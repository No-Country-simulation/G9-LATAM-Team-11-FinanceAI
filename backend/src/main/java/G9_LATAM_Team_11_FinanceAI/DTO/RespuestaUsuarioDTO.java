package G9_LATAM_Team_11_FinanceAI.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record RespuestaUsuarioDTO(
        @NotBlank String mensaje,
        @NotNull Long id
) {
}
