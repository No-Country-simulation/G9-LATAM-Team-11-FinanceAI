package G9_LATAM_Team_11_FinanceAI.DTO.UsuarioDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RespuestaUsuarioDTO(
        @NotBlank String mensaje,
        @NotNull Long id
) {
}
