package G9_LATAM_Team_11_FinanceAI.DTO.AutenticacionDTOs;

public record LoginRespuestaDTO(
        String token,
        Long idUsuario,
        String nombre,
        String email
) {
}
