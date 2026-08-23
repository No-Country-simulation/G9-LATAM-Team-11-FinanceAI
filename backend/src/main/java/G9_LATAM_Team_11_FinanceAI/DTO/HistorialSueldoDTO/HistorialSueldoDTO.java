package G9_LATAM_Team_11_FinanceAI.DTO.HistorialSueldoDTO;

import G9_LATAM_Team_11_FinanceAI.domain.historialsueldo.HistorialSueldo;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record HistorialSueldoDTO(
        BigDecimal sueldoAnterior,
        BigDecimal sueldoNuevo,
        LocalDateTime fechaModificacion
) {
    // Constructor a partir de la Entidad
    public HistorialSueldoDTO(HistorialSueldo historial) {
        this(
                historial.getSueldoAnterior(),
                historial.getSueldoNuevo(),
                historial.getFechaModificacion()
        );
    }

    // Constructor secundario (usado cuando el usuario no tiene historial aun)
    public HistorialSueldoDTO(BigDecimal sueldoAnterior, BigDecimal sueldoNuevo, LocalDateTime fechaModificacion) {
        this.sueldoAnterior = sueldoAnterior;
        this.sueldoNuevo = sueldoNuevo;
        this.fechaModificacion = fechaModificacion;
    }
}

