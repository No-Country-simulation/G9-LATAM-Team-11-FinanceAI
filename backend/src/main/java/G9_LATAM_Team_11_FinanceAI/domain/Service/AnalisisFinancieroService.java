package G9_LATAM_Team_11_FinanceAI.domain.Service;

import G9_LATAM_Team_11_FinanceAI.DTO.AnalisisFinancieroDTO.IngresarAnalisisFinancieroDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.AnalisisFinancieroDTO.ItemTransaccionAnalisisDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.AnalisisFinancieroDTO.ResultadoAnalisisDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.AnalisisFinancieroDTO.SolicitudAnalisisDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.CategoriaDTOs.SolicitudCategoriaDTO;
import G9_LATAM_Team_11_FinanceAI.Repository.IAnalisisFinanciero;
import G9_LATAM_Team_11_FinanceAI.Repository.IUsuarioRepository;
import G9_LATAM_Team_11_FinanceAI.analisis_financiero.AnalisisFinanciero;
import G9_LATAM_Team_11_FinanceAI.domain.usuario.Usuario;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
public class AnalisisFinancieroService {

    @Autowired
    private IAnalisisFinanciero iAnalisisFinanciero;

    @Autowired
    private IUsuarioRepository usuarioRepository;

    @Autowired
    private DataScienceModelService dataScienceModelService;

    @Transactional
    public ResultadoAnalisisDTO analizarFinanzas(SolicitudAnalisisDTO solicitud) {
        BigDecimal ingreso = solicitud.ingresoMensual() != null && solicitud.ingresoMensual().compareTo(BigDecimal.ZERO) > 0
                ? solicitud.ingresoMensual()
                : BigDecimal.valueOf(2500.0);

        List<ItemTransaccionAnalisisDTO> transacciones = solicitud.transacciones() != null
                ? solicitud.transacciones()
                : Collections.emptyList();

        // 1. Calcular resumen de gastos por categoría usando NLP de ONNX si falta la categoría
        Map<String, Double> resumenGastos = new HashMap<>();
        double totalGastado = 0.0;

        for (ItemTransaccionAnalisisDTO t : transacciones) {
            double monto = t.valor() != null ? t.valor().doubleValue() : 0.0;
            if (monto <= 0) continue;

            String cat = t.categoria();
            if (cat == null || cat.isBlank() || cat.equalsIgnoreCase("otro") || cat.equalsIgnoreCase("general")) {
                SolicitudCategoriaDTO catReq = new SolicitudCategoriaDTO(t.descripcion(), t.valor(), LocalDate.now().toString(), solicitud.idUsuario());
                cat = dataScienceModelService.obtenerCategoria(catReq);
            }

            resumenGastos.put(cat, resumenGastos.getOrDefault(cat, 0.0) + monto);
            totalGastado += monto;
        }

        // 2. Calcular endeudamiento y frecuencia de ahorro si no fueron provistos
        Double endeudamiento = solicitud.nivelEndeudamiento();
        if (endeudamiento == null || endeudamiento <= 0.0) {
            if (ingreso.doubleValue() > 0) {
                endeudamiento = Math.min(100.0, (totalGastado / ingreso.doubleValue()) * 100.0);
            } else {
                endeudamiento = 0.0;
            }
        }

        String ahorro = solicitud.frecuenciaAhorro();
        if (ahorro == null || ahorro.isBlank()) {
            double ratio = totalGastado / Math.max(1.0, ingreso.doubleValue());
            if (ratio < 0.50) ahorro = "Alta";
            else if (ratio < 0.80) ahorro = "Media";
            else ahorro = "Baja";
        }

        // 3. Ejecutar inferencia con modelo_perfil.onnx
        String perfilPredicho = dataScienceModelService.obtenerPerfilFinanciero(ingreso, endeudamiento, ahorro);

        // 4. Generar recomendaciones dinámicas basadas en los gastos y perfil
        List<String> recomendaciones = generarRecomendaciones(resumenGastos, ingreso.doubleValue(), endeudamiento, ahorro, perfilPredicho);

        // 5. Persistir en la BD si se especificó un usuario registrado
        if (solicitud.idUsuario() != null) {
            final Double finalEndeudamiento = endeudamiento;
            final String finalAhorro = ahorro;
            usuarioRepository.findById(solicitud.idUsuario()).ifPresent(usuario -> {
                AnalisisFinanciero registro = new AnalisisFinanciero();
                registro.setUsuario(usuario);
                registro.setFechaAnalisis(LocalDate.now());
                registro.setFechaInicio(LocalDate.now().withDayOfMonth(1));
                registro.setFechaFinal(LocalDate.now());
                registro.setPerfilFinanciero(perfilPredicho);
                registro.setNivelEndeudamiento(finalEndeudamiento);
                registro.setNivelAhorro(finalAhorro);
                registro.setRecomendaciones(String.join(" | ", recomendaciones));
                iAnalisisFinanciero.save(registro);
            });
        }

        double probabilidad = switch (perfilPredicho.toLowerCase()) {
            case "saludable" -> 0.88;
            case "en observacion" -> 0.72;
            default -> 0.81; // en riesgo
        };

        return new ResultadoAnalisisDTO(perfilPredicho, probabilidad, resumenGastos, recomendaciones);
    }

    @Transactional
    public AnalisisFinanciero ingresarAnalisisFinanciero(IngresarAnalisisFinancieroDTO datos) {
        var usuario = usuarioRepository.findById(datos.idUsuario())
                .orElseThrow(() -> new EntityNotFoundException("Usuario no existe"));

        var analisisfinanciero = new AnalisisFinanciero(datos, usuario);
        return iAnalisisFinanciero.save(analisisfinanciero);
    }

    private List<String> generarRecomendaciones(Map<String, Double> resumenGastos, double ingreso, double endeudamiento, String ahorro, String perfil) {
        List<String> recomendaciones = new ArrayList<>();

        if (endeudamiento > 70.0) {
            recomendaciones.add("Tu nivel de gasto supera el 70% de tus ingresos. Es crucial recortar gastos discrecionales y consolidar obligaciones.");
        } else if (endeudamiento > 50.0) {
            recomendaciones.add("Tus gastos consumen más del 50% de tus ingresos. Mantener un margen mayor te protegerá ante imprevistos.");
        }

        if (ahorro.equalsIgnoreCase("baja") || ahorro.equalsIgnoreCase("ninguna")) {
            recomendaciones.add("Tu capacidad de ahorro es limitada. Intenta apartar entre el 10% y el 15% al inicio de cada mes de forma automática.");
        } else if (ahorro.equalsIgnoreCase("media")) {
            recomendaciones.add("Tu nivel de ahorro es moderado. Ajustar suscripciones o compras no esenciales te permitirá pasar a un nivel alto.");
        }

        // Ordenar categorías por mayor gasto
        List<Map.Entry<String, Double>> topCategorias = new ArrayList<>(resumenGastos.entrySet());
        topCategorias.sort((a, b) -> Double.compare(b.getValue(), a.getValue()));

        double totalGastos = resumenGastos.values().stream().mapToDouble(Double::doubleValue).sum();

        for (int i = 0; i < Math.min(2, topCategorias.size()); i++) {
            Map.Entry<String, Double> entry = topCategorias.get(i);
            if (totalGastos > 0) {
                int porcentaje = (int) Math.round((entry.getValue() / totalGastos) * 100);
                if (porcentaje >= 30) {
                    recomendaciones.add(entry.getKey() + " representa el " + porcentaje + "% de tus gastos totales. Establece un presupuesto límite mensual para esta categoría.");
                }
            }
        }

        if (perfil.equalsIgnoreCase("saludable")) {
            recomendaciones.add("Tu perfil financiero es sólido y equilibrado. Evalúa destinar excedentes a instrumentos de inversión o fondos de emergencia.");
        }

        if (recomendaciones.isEmpty()) {
            recomendaciones.add("Continúa registrando tus transacciones diarias para obtener diagnósticos con mayor precisión.");
        }

        return recomendaciones;
    }
}
