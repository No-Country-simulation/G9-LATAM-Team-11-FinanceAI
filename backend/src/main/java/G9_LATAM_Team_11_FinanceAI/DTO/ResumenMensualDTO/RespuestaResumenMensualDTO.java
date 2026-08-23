package G9_LATAM_Team_11_FinanceAI.DTO.ResumenMensualDTOs;

import G9_LATAM_Team_11_FinanceAI.domain.resumenmensual.ResumenMensual;
import java.math.BigDecimal;

public record RespuestaResumenMensualDTO(
        Long id,
        Long idUsuario,
        Integer mes,
        Integer anio,
        BigDecimal ingresoTotal,
        BigDecimal gastoTotal,
        BigDecimal ahorroTotal,
        BigDecimal sobranteFinal
) {
    public RespuestaResumenMensualDTO(ResumenMensual resumen) {
        this(
                resumen.getId(),
                resumen.getUsuario().getId(),
                resumen.getMes(),
                resumen.getAnio(),
                resumen.getIngresoTotal(),
                resumen.getGastoTotal(),
                resumen.getAhorroTotal(),
                resumen.getSobranteFinal()
        );
    }
}