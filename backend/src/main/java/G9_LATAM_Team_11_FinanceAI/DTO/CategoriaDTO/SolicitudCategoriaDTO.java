package G9_LATAM_Team_11_FinanceAI.DTO.CategoriaDTO;

import G9_LATAM_Team_11_FinanceAI.DTO.TransaccionDTO.IngresarTransaccionDTO;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public record SolicitudCategoriaDTO(
        @JsonProperty("descripcion") String descripcion,
        @JsonProperty("monto") BigDecimal monto,
        @JsonProperty("fecha") String fecha,
        @JsonProperty("idUsuario") Long idUsuario) {

    public SolicitudCategoriaDTO(IngresarTransaccionDTO datos) {
        this(datos.descripcion(), datos.monto(),
                datos.fecha()!= null ? datos.fecha().toString() : null
                , datos.idUsuario());
    }
}
