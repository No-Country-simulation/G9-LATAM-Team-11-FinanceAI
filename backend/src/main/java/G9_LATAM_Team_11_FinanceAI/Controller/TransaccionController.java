package G9_LATAM_Team_11_FinanceAI.Controller;

import G9_LATAM_Team_11_FinanceAI.DTO.DetallesTransaccionFiltradaDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.IngresarTransaccionDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.TransaccionFiltradaDTO;
import G9_LATAM_Team_11_FinanceAI.domain.Service.TransacionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/transaccion")
public class TransaccionController {

    @Autowired
    TransacionService transacionService;

    @Transactional
    @PostMapping
    public ResponseEntity<?> ingresarTransaccion(@RequestBody @Valid IngresarTransaccionDTO datos){

        transacionService.ingresarTransaccion(datos);

        return ResponseEntity.status(HttpStatus.CREATED).body(datos);
    }

    @PostMapping("/rangos")
    public ResponseEntity<?> obtenerTransaccionPorFechas(@RequestBody TransaccionFiltradaDTO datos) {
        try {
            List<DetallesTransaccionFiltradaDTO> transacciones = transacionService.obtenerTransaccionesPorRango(datos);
            return ResponseEntity.ok(transacciones);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("mensaje", e.getMessage()));
        }
    }


}
