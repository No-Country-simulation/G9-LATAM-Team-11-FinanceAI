package G9_LATAM_Team_11_FinanceAI.DTO.AutenticacionDTOs;

import java.math.BigDecimal;

public record LoginRespuestaDTO(
        Long id,
        String nombre,
        String email,
        BigDecimal ingresoMensual,
        String token
) {
}
