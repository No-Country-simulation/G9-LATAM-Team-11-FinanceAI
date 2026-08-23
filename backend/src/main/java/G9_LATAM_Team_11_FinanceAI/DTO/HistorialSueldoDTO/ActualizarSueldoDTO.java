package G9_LATAM_Team_11_FinanceAI.DTO.HistorialSueldoDTO;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record ActualizarSueldoDTO(
        @NotNull(message = "El nuevo sueldo es obligatorio")
        @Positive(message = "El sueldo debe ser mayor a cero")
        BigDecimal nuevoSueldo
) {
}

