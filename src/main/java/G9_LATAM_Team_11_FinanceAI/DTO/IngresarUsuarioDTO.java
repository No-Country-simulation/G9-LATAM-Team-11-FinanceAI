package G9_LATAM_Team_11_FinanceAI.DTO;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record IngresarUsuarioDTO(
        @NotBlank String nombre,
        @NotBlank @Email String email,
        @NotBlank String password,
        @NotNull Double ingreso_mensual
) {
}
