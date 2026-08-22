package G9_LATAM_Team_11_FinanceAI.DTO.HistorialSueldoDTO;

import G9_LATAM_Team_11_FinanceAI.domain.historialsueldo.HistorialSueldo;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record HistorialSueldoDTO(
        Long id,
        Long idUsuario,
        BigDecimal sueldoAnterior,
        BigDecimal sueldoNuevo,

        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        LocalDateTime fechaModificacion
) {
    // Constructor de mapeo a partir de la Entidad
    public HistorialSueldoDTO(HistorialSueldo historial) {
        this(
                historial.getId(),
                historial.getUsuario().getId(),
                historial.getSueldoAnterior(),
                historial.getSueldoNuevo(),
                historial.getFechaModificacion()
        );
    }
}

