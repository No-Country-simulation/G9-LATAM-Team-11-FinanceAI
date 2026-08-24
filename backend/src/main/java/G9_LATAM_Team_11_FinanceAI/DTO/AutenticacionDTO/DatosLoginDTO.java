package G9_LATAM_Team_11_FinanceAI.DTO.AutenticacionDTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DatosLoginDTO(
        @NotBlank @Email String email,
        @NotNull String password
) {
}
