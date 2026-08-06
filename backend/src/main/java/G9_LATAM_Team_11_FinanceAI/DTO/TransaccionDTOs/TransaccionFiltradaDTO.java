package G9_LATAM_Team_11_FinanceAI.DTO.TransaccionDTOs;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record TransaccionFiltradaDTO(
        @NotNull Long idUsuario,
        @NotNull LocalDate desde,
        @NotNull LocalDate hasta
) {
}
