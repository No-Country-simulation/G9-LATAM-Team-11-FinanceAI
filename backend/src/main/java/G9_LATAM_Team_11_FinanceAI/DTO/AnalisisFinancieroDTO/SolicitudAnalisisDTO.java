package G9_LATAM_Team_11_FinanceAI.DTO.AnalisisFinancieroDTO;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.util.List;

public record SolicitudAnalisisDTO(
        @JsonAlias({"idUsuario", "id_usuario", "usuario_id"})
        Long idUsuario,

        @JsonProperty("ingreso_mensual")
        @JsonAlias({"ingresoMensual", "ingreso"})
        BigDecimal ingresoMensual,

        @JsonProperty("nivel_endeudamiento")
        @JsonAlias({"nivelEndeudamiento", "endeudamiento"})
        Double nivelEndeudamiento,

        @JsonProperty("frecuencia_ahorro")
        @JsonAlias({"frecuenciaAhorro", "nivelAhorro", "nivel_ahorro"})
        String frecuenciaAhorro,

        List<ItemTransaccionAnalisisDTO> transacciones
) {
}
