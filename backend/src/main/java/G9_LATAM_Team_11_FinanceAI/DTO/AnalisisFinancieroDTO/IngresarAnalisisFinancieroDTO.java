package G9_LATAM_Team_11_FinanceAI.DTO.AnalisisFinancieroDTO;

import java.time.LocalDate;

public record IngresarAnalisisFinancieroDTO(

        Long idUsuario,

        LocalDate fechaAnalisis,

        LocalDate fechaInicio,

        LocalDate fechaFinal,

        String perfilFinanciero,

        Double nivelEndeudamiento,

        String nivelAhorro,

        String Recomendaciones
) {
}
