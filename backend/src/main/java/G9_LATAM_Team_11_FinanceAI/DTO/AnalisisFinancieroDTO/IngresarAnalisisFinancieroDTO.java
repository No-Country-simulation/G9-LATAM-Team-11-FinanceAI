package G9_LATAM_Team_11_FinanceAI.DTO.AnalisisFinancieroDTO;

import G9_LATAM_Team_11_FinanceAI.domain.Models.FrecuenciaAhorro;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record IngresarAnalisisFinancieroDTO(

        Long idUsuario,
        LocalDateTime fechaAnalisis,
        LocalDate fechaInicio,
        LocalDate fechaFinal,
        String perfilFinanciero,
        BigDecimal nivelEndeudamiento,
        FrecuenciaAhorro nivelAhorro,
        String recomendaciones
) {
}
