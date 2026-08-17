package G9_LATAM_Team_11_FinanceAI.DTO.AnalisisFinancieroDTO;

import com.fasterxml.jackson.annotation.JsonAlias;
import java.math.BigDecimal;

public record ItemTransaccionAnalisisDTO(
        String descripcion,
        @JsonAlias({"valor", "monto"})
        BigDecimal valor,
        String categoria
) {
}
