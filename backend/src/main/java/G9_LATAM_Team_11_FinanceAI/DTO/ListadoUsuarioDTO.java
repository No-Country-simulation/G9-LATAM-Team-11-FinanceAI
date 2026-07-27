package G9_LATAM_Team_11_FinanceAI.DTO;

import G9_LATAM_Team_11_FinanceAI.domain.usuario.Usuario;

import java.math.BigDecimal;
import java.util.List;

public record ListadoUsuarioDTO(long id, BigDecimal ingresoMensual, boolean activo, List<ListadoTransaccionDTO> transacciones) {
public ListadoUsuarioDTO(Usuario usuario){
    this(
            usuario.getId(),
            usuario.getIngresoMensual(),
            usuario.getActivo(),
            usuario.getTransacciones().stream().map(ListadoTransaccionDTO::new).toList()
    );
}
}
