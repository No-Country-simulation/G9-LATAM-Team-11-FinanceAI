package G9_LATAM_Team_11_FinanceAI.DTO.TransaccionDTOs;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record IngresarTransaccionDTO(
        @NotNull
        String descripcion,
        @NotNull
        BigDecimal monto,
        @NotNull
        LocalDate fecha,
        @NotNull
        Long idUsuario
) {
}