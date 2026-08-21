package G9_LATAM_Team_11_FinanceAI.DTO.AnalisisFinancieroDTO;

import G9_LATAM_Team_11_FinanceAI.domain.Models.FrecuenciaAhorro;
import G9_LATAM_Team_11_FinanceAI.domain.analisis_financiero.AnalisisFinanciero;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public record RespuestaAnalisisFinancieroDTO(

        Long id,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        LocalDateTime fechaDeAnalisis,
        String fechaDeMesesAnalisis,
        String perfilFinanciero,
        BigDecimal nivelDeEndeudamiento,
        FrecuenciaAhorro nivelAhorro,
        String recomendaciones

) {
    public RespuestaAnalisisFinancieroDTO(AnalisisFinanciero analisis) {
        this(
                analisis.getId(),
                analisis.getFechaAnalisis(),
                construirRangoFechas(analisis.getFechaInicio(), analisis.getFechaFinal()),
                analisis.getPerfilFinanciero(),
                analisis.getNivelEndeudamiento(),
                analisis.getNivelAhorro(),
                analisis.getRecomendaciones()
        );
    }

    private static final DateTimeFormatter FORMATO_FECHA = DateTimeFormatter.ofPattern("dd-MM-yyyy");

    private static String construirRangoFechas(LocalDate inicio, LocalDate fin) {
        if (inicio == null || fin == null) {
            return "Rango de fechas no disponible";
        }
        return "desde el " + inicio.format(FORMATO_FECHA) + " hasta el " + fin.format(FORMATO_FECHA);
    }
}
