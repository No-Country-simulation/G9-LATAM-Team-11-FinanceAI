package G9_LATAM_Team_11_FinanceAI.DTO;

import G9_LATAM_Team_11_FinanceAI.domain.transaccion.Transaccion;

import java.math.BigDecimal;

public record ListadoTransaccionDTO(String categoria, BigDecimal monto) {
        public ListadoTransaccionDTO(Transaccion transaccion) {
        this(transaccion.getCategoria(), transaccion.getMonto());
    }
}
