package G9_LATAM_Team_11_FinanceAI.DTO.ResumenMensualDTO;

import G9_LATAM_Team_11_FinanceAI.domain.resumenmensual.ResumenMensual;
import java.math.BigDecimal;

public record RespuestaResumenMensualDTO(
        Long id,
        Long idUsuario,
        Integer mes,
        Integer anio,
        BigDecimal sueldoBase,
        BigDecimal sobranteMesAnterior,
        BigDecimal gastadoEnElMes,
        BigDecimal sobranteFinal
) {
    public RespuestaResumenMensualDTO(ResumenMensual resumen) {
        this(
                resumen.getId(),
                resumen.getUsuario().getId(),
                resumen.getMes(),
                resumen.getAnio(),
                resumen.getSueldoBase(),
                resumen.getSobranteMesAnterior(),
                resumen.getGastadoEnElMes(),
                resumen.getSobranteFinal()
        );
    }
}