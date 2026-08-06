package G9_LATAM_Team_11_FinanceAI.DTO.TransaccionDTOs;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ActualizarTransaccionDTO(
        String descripcion,
        BigDecimal monto,
        String categoria,
        LocalDate fecha
) {
}
