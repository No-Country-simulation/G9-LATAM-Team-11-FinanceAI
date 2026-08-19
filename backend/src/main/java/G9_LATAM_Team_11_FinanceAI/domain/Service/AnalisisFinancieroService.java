package G9_LATAM_Team_11_FinanceAI.domain.Service;

import G9_LATAM_Team_11_FinanceAI.DTO.AnalisisFinancieroDTO.IngresarAnalisisFinancieroDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.AnalisisFinancieroDTO.RespuestaAnalisisFinancieroDTO;
import G9_LATAM_Team_11_FinanceAI.Repository.IAnalisisFinanciero;
import G9_LATAM_Team_11_FinanceAI.Repository.ITransaccionRepository;
import G9_LATAM_Team_11_FinanceAI.Repository.IUsuarioRepository;
import G9_LATAM_Team_11_FinanceAI.analisis_financiero.AnalisisFinanciero;
import G9_LATAM_Team_11_FinanceAI.domain.transaccion.Transaccion;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Service
public class AnalisisFinancieroService {

    @Autowired
    private IAnalisisFinanciero iAnalisisFinanciero;

    @Autowired
    private IUsuarioRepository usuarioRepository;

    @Autowired
    private ITransaccionRepository transaccionRepository;

    @Autowired
    private OnnxInferenceService onnxInferenceService;

    public RespuestaAnalisisFinancieroDTO ingresarAnalisisFinanciero(IngresarAnalisisFinancieroDTO datos){

        var usuario = usuarioRepository.findById(datos.idUsuario())
                .orElseThrow(() -> new EntityNotFoundException("Usuario no existe"));

//            var analisisfinanciero = new AnalisisFinanciero(datos, usuario);
//
//            return iAnalisisFinanciero.save(analisisfinanciero);
//    }
        List<Transaccion> transacciones = transaccionRepository.findByUsuarioId(usuario.getId());
        if (transacciones.isEmpty()) {
            throw new IllegalArgumentException("Necesitas al menos una transacción registrada.");
        }

        BigDecimal ingreso = usuario.getIngresoMensual() != null ? usuario.getIngresoMensual() : BigDecimal.ZERO;

        double endeudamiento = calcularEndeudamiento(transacciones, ingreso);
        String frecuenciaAhorroStr = calcularFrecuenciaAhorro(transacciones, ingreso);

        float frecuenciaNum = "Alta".equals(frecuenciaAhorroStr) ? 3.0f : ("Media".equals(frecuenciaAhorroStr) ? 2.0f : 1.0f);
        float[] inputsModel = new float[]{(float) endeudamiento, frecuenciaNum};

        OnnxInferenceService.PredictResult resultadoML;
        try {
            resultadoML = onnxInferenceService.predecirPerfil(inputsModel);
        } catch (Exception e) {
            resultadoML = new OnnxInferenceService.PredictResult("En observación", 0.5);
        }

        Map<String, BigDecimal> resumenGastos = calcularResumenGastos(transacciones);
        List<String> recomendaciones = generarRecomendaciones(resumenGastos, ingreso, endeudamiento, frecuenciaAhorroStr, transacciones.size());

        LocalDate hoy = LocalDate.now();
        AnalisisFinanciero entidad = new AnalisisFinanciero();
        entidad.setUsuario(usuario);
        entidad.setFechaAnalisis(hoy);
        entidad.setFechaInicio(hoy.minusMonths(1));
        entidad.setFechaFinal(hoy);
        entidad.setPerfilFinanciero(resultadoML.perfil());
        entidad.setNivelEndeudamiento(endeudamiento);
        entidad.setNivelAhorro(frecuenciaAhorroStr);

        entidad.setRecomendaciones(String.join("", recomendaciones));

        AnalisisFinanciero guardado = iAnalisisFinanciero.save(entidad);


        return new RespuestaAnalisisFinancieroDTO(guardado);
    }

    private double calcularEndeudamiento(List<Transaccion> transacciones, BigDecimal ingreso) {
        if (ingreso.compareTo(BigDecimal.ZERO) <= 0) return 0.0;

        LocalDate ahora = LocalDate.now();
        BigDecimal gastoMes = transacciones.stream()
                .filter(t -> t.getFecha() != null &&
                        t.getFecha().getMonth() == ahora.getMonth() &&
                        t.getFecha().getYear() == ahora.getYear())
                .map(Transaccion::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double porcentaje = gastoMes.divide(ingreso, 4, RoundingMode.HALF_UP).doubleValue() * 100;
        return Math.min(100.0, Math.round(porcentaje));
    }

    private String calcularFrecuenciaAhorro(List<Transaccion> transacciones, BigDecimal ingreso) {
        if (ingreso.compareTo(BigDecimal.ZERO) <= 0) return "Baja";

        BigDecimal totalGastado = transacciones.stream()
                .map(Transaccion::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long meses = transacciones.stream()
                .filter(t -> t.getFecha() != null)
                .map(t -> t.getFecha().getYear() + "-" + t.getFecha().getMonthValue())
                .distinct()
                .count();

        meses = Math.max(1, meses);
        BigDecimal promedioMensual = totalGastado.divide(BigDecimal.valueOf(meses), 2, RoundingMode.HALF_UP);
        double ratioGasto = promedioMensual.divide(ingreso, 4, RoundingMode.HALF_UP).doubleValue();

        if (ratioGasto < 0.5) return "Alta";
        if (ratioGasto < 0.8) return "Media";
        return "Baja";
    }

    private Map<String, BigDecimal> calcularResumenGastos(List<Transaccion> transacciones) {
        Map<String, BigDecimal> resumen = new HashMap<>();
        for (Transaccion t : transacciones) {
            String cat = (t.getCategoria() != null && !t.getCategoria().isBlank()) ? t.getCategoria() : "Otro";
            resumen.merge(cat, t.getMonto(), BigDecimal::add);
        }
        return resumen;
    }

    private PerfilResultado determinarPerfil(double endeudamiento, String frecuenciaAhorro) {
        int puntaje = 0;

        if (endeudamiento < 30) puntaje += 3;
        else if (endeudamiento < 60) puntaje += 2;
        else if (endeudamiento < 80) puntaje += 1;

        if ("Alta".equals(frecuenciaAhorro)) puntaje += 3;
        else if ("Media".equals(frecuenciaAhorro)) puntaje += 2;
        else puntaje += 1;

        if (puntaje >= 5) {
            return new PerfilResultado("Saludable", 0.7 + (puntaje - 5) * 0.1);
        }
        if (puntaje >= 3) {
            return new PerfilResultado("En observación", 0.5 + (puntaje - 3) * 0.1);
        }
        return new PerfilResultado("En riesgo", 0.6 + (2 - puntaje) * 0.15);
    }

    private List<String> generarRecomendaciones(Map<String, BigDecimal> resumenGastos, BigDecimal ingreso, double endeudamiento, String frecuenciaAhorro, int totalTransacciones) {
        List<String> recomendaciones = new ArrayList<>();

        if (endeudamiento > 70) {
            recomendaciones.add(" Tu nivel de gasto supera el 70% de tu ingreso. Revisa tus gastos fijos y busca reducir los no esenciales para evitar sobreendeudarte.");
        } else if (endeudamiento > 50) {
            recomendaciones.add(" Estás gastando más de la mitad de tu ingreso. Intenta mantener tus gastos por debajo del 50% para tener un colchón financiero.");
        }

        if ("Baja".equals(frecuenciaAhorro)) {
            recomendaciones.add(" Tu capacidad de ahorro es baja. Un buen objetivo es ahorrar entre el 10% y el 20% de tu ingreso mensual.");
        } else if ("Media".equals(frecuenciaAhorro)) {
            recomendaciones.add(" Tu nivel de ahorro es moderado. Para mejorar, identifica un gasto recurrente que puedas reducir.");
        }

        BigDecimal totalGastos = resumenGastos.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalGastos.compareTo(BigDecimal.ZERO) > 0) {
            resumenGastos.entrySet().stream()
                    .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                    .limit(3)
                    .forEach(entry -> {
                        double pct = entry.getValue().divide(totalGastos, 4, RoundingMode.HALF_UP).doubleValue() * 100;
                        if (pct > 40) {
                            recomendaciones.add(entry.getKey() + " concentra el " + Math.round(pct) + "% de tus gastos totales. Considera buscar alternativas más económicas.");
                        } else if (pct > 25) {
                            recomendaciones.add(entry.getKey() + " es tu categoría de mayor gasto (" + Math.round(pct) + "% del total). Revisa si puedes optimizar.");
                        }
                    });
        }

        if (endeudamiento < 40 && "Alta".equals(frecuenciaAhorro)) {
            recomendaciones.add(" Tu manejo financiero es sólido. Considera destinar parte de tu ahorro a inversiones de bajo riesgo.");
        }

        if (totalTransacciones < 5) {
            recomendaciones.add(" Tienes pocas transacciones registradas. Cuantos más gastos registres, más preciso será tu análisis.");
        }

        return recomendaciones.stream().limit(6).collect(Collectors.toList());
    }

    private record PerfilResultado(String nombre, double probabilidad) {}
}



