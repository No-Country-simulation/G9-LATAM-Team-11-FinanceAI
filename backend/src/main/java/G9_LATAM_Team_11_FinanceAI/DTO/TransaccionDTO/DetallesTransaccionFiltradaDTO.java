package G9_LATAM_Team_11_FinanceAI.DTO.TransaccionDTO;

import G9_LATAM_Team_11_FinanceAI.domain.transaccion.Transaccion;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DetallesTransaccionFiltradaDTO(
        Long id,
        String descripcion,
        BigDecimal monto,
        String categoria,
        LocalDate fecha
) {
    public DetallesTransaccionFiltradaDTO(Transaccion datos) {
        this(datos.getId(), datos.getDescripcion(), datos.getMonto(), datos.getCategoria(), datos.getFecha());
    }
}

