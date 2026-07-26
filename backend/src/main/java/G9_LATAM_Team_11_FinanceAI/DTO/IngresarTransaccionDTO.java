package G9_LATAM_Team_11_FinanceAI.DTO;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record IngresarTransaccionDTO(
        @NotNull
        String descripcion,
        @NotNull
        BigDecimal monto,
        @NotNull
        String categoria, //ELIMINAR: traer la categoria de DS
        @NotNull
        LocalDate fecha,
        @NotNull
        long idUsuario
) {
}