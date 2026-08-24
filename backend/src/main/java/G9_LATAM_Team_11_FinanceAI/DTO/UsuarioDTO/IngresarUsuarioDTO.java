package G9_LATAM_Team_11_FinanceAI.DTO.UsuarioDTO;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record IngresarUsuarioDTO(
        @NotBlank String nombre,
        @NotBlank @Email String email,
        @NotBlank String password,
        @NotNull BigDecimal ingresoMensual
) {
}
