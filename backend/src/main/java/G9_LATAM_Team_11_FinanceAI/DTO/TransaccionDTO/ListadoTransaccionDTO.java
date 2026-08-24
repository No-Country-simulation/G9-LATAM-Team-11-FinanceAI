package G9_LATAM_Team_11_FinanceAI.DTO.TransaccionDTO;

import G9_LATAM_Team_11_FinanceAI.domain.transaccion.Transaccion;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ListadoTransaccionDTO(String categoria, BigDecimal monto, String descripcion, LocalDate fecha) {
        public ListadoTransaccionDTO(Transaccion transaccion) {
        this(transaccion.getCategoria(), transaccion.getMonto(), transaccion.getDescripcion(), transaccion.getFecha());
    }
}
