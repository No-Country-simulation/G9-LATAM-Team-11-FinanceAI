package G9_LATAM_Team_11_FinanceAI.domain.Service;

import G9_LATAM_Team_11_FinanceAI.DTO.AnalisisFinancieroDTO.IngresarAnalisisFinancieroDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.AnalisisFinancieroDTO.RespuestaAnalisisFinancieroDTO;
import G9_LATAM_Team_11_FinanceAI.Repository.IAnalisisFinanciero;
import G9_LATAM_Team_11_FinanceAI.Repository.IUsuarioRepository;
import G9_LATAM_Team_11_FinanceAI.domain.Models.FrecuenciaAhorro;
import G9_LATAM_Team_11_FinanceAI.domain.analisis_financiero.AnalisisFinanciero;
import G9_LATAM_Team_11_FinanceAI.domain.usuario.Usuario;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;



@Service
public class AnalisisFinancieroService {

    @Autowired
    private IAnalisisFinanciero iAnalisisFinanciero;

    @Autowired
    private IUsuarioRepository usuarioRepository;

    @Autowired
    private PerfilFinancieroService perfilFinancieroService;

    @Autowired
    private DataScienceModelService dataScienceModelService;


    public Usuario obtenerUsuarioPorId(Long id){
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se encontró un usuario con el ID: " + id));
    }


    public AnalisisFinanciero ingresarAnalisisFinanciero(IngresarAnalisisFinancieroDTO datos){

        var usuario = obtenerUsuarioPorId(datos.idUsuario());

        var analisisfinanciero = new AnalisisFinanciero(datos, usuario);

        return iAnalisisFinanciero.save(analisisfinanciero);
    }

    public AnalisisFinanciero generarYGuardarAnalisis(Long idUsuario) {
        Usuario usuario = obtenerUsuarioPorId(idUsuario);

        // rango de fechas (01 de agosto a hoy)
        LocalDate fechaActual = LocalDate.now();
        LocalDate fechaInicio = fechaActual.withDayOfMonth(1);

        // calculo endeudamiento y frecuencia de ahorro
        BigDecimal endeudamiento = perfilFinancieroService.calcularPorcentajeEndeudamiento(idUsuario);
        FrecuenciaAhorro nivelAhorro = perfilFinancieroService.calcularFrecuenciaAhorro(idUsuario);

        // predicción ONNX
        String perfilFinanciero = dataScienceModelService.predecirPerfilFinanciero(
                usuario.getIngresoMensual(),
                endeudamiento,
                nivelAhorro
        );

        // genera sugerencias personalizadas
        String recomendaciones = generarRecomendacion(endeudamiento, nivelAhorro, perfilFinanciero);

        IngresarAnalisisFinancieroDTO datosDTO = new IngresarAnalisisFinancieroDTO(
                usuario.getId(),
                LocalDateTime.now(),
                fechaInicio,
                fechaActual,
                perfilFinanciero,
                endeudamiento,
                nivelAhorro,
                recomendaciones
        );

        AnalisisFinanciero analisis = new AnalisisFinanciero(datosDTO, usuario);

        return iAnalisisFinanciero.save(analisis);
    }

    private String generarRecomendacion(BigDecimal endeudamiento, FrecuenciaAhorro ahorro, String perfil) {
        StringBuilder sb = new StringBuilder();

        // Reglas para endeudamiento
        if (endeudamiento.compareTo(new BigDecimal("40")) > 0) {
            sb.append("Atención: Tu nivel de gastos fijos está elevado (mayor al 40%). Intenta renegociar servicios o reducir costos de vivienda. ");
        } else {
            sb.append("Tus gastos fijos están en un rango saludable. ");
        }

        // Reglas para frecuencia de ahorro
        if (ahorro == FrecuenciaAhorro.NINGUNA || ahorro == FrecuenciaAhorro.BAJA) {
            sb.append("Trata de automatizar al menos una transferencia de ahorro/inversión a principio de mes. ");
        } else {
            sb.append("¡Buen trabajo manteniendo constancia en tus aportes de inversión! ");
        }

        // Regla según perfil predicho
        sb.append("Basado en tu perfil ").append(perfil).append(", te sugerimos diversificar según tu tolerancia al riesgo.");

        return sb.toString();
    }


    //Mostra los analisis financieron guardados
    public List<RespuestaAnalisisFinancieroDTO> obtenerHistorialAnalisis(Long idUsuario) {
        obtenerUsuarioPorId(idUsuario);

        // el historial ordenado de más reciente a más antiguo
        List<AnalisisFinanciero> historial = iAnalisisFinanciero.findByUsuarioIdOrderByFechaAnalisisDesc(idUsuario);

        // convertir la lista de entidades a lista de DTOs
        return historial.stream()
                .map(RespuestaAnalisisFinancieroDTO::new)
                .toList();
    }
}



