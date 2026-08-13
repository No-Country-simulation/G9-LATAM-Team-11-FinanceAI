package G9_LATAM_Team_11_FinanceAI.DTO.AnalisisFinancieroDTO;

import G9_LATAM_Team_11_FinanceAI.analisis_financiero.AnalisisFinanciero;

import java.time.LocalDate;

public record RespuestaAnalisisFinancieroDTO(

        LocalDate fechaDeAnalisis,

        String fechaDeMesesAnalisis,

        String perfilFinanciero,

        Double nivelDeEndeudamiento,

        String nivelAhorro,

        String Recomendaciones

) {
    public RespuestaAnalisisFinancieroDTO(AnalisisFinanciero analisis) {
        this(
                analisis.getFechaAnalisis(),
                "Analisis Financiero desde el " + analisis.getFechaInicio() + " hasta el " + analisis.getFechaFinal(),
                analisis.getPerfilFinanciero(),
                analisis.getNivelEndeudamiento(),
                analisis.getNivelAhorro(),
                analisis.getRecomendaciones()
        );
    }
}
