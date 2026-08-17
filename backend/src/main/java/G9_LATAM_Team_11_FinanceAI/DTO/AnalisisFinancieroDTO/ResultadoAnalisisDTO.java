package G9_LATAM_Team_11_FinanceAI.DTO.AnalisisFinancieroDTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

public record ResultadoAnalisisDTO(
        @JsonProperty("perfil_financiero")
        String perfilFinanciero,

        @JsonProperty("probabilidad")
        Double probabilidad,

        @JsonProperty("resumen_gastos")
        Map<String, Double> resumenGastos,

        @JsonProperty("recomendaciones")
        List<String> recomendaciones
) {
}
