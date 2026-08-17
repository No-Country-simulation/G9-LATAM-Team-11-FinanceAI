package G9_LATAM_Team_11_FinanceAI.DTO.CategoriaDTOs;

import G9_LATAM_Team_11_FinanceAI.domain.transaccion.Transaccion;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RespuestaCategoriaDTO(
        String descripcion,
        BigDecimal monto,
        @JsonProperty("categoria") String categoria,
        LocalDate fecha,
        Long idUsuario
) {
    public RespuestaCategoriaDTO(Transaccion transaccion) {
        this(
                transaccion.getDescripcion(),
                transaccion.getMonto(),
                transaccion.getCategoria(),
                transaccion.getFecha(),
                transaccion.getUsuario().getId()
        );
    }
}