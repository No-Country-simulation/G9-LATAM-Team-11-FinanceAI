package G9_LATAM_Team_11_FinanceAI.Controller;

import G9_LATAM_Team_11_FinanceAI.DTO.CategoriaDTO.RespuestaCategoriaDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.TransaccionDTO.ActualizarTransaccionDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.TransaccionDTO.DetallesTransaccionFiltradaDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.TransaccionDTO.IngresarTransaccionDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.TransaccionDTO.TransaccionFiltradaDTO;
import G9_LATAM_Team_11_FinanceAI.domain.Service.TransacionService;
import G9_LATAM_Team_11_FinanceAI.domain.transaccion.Transaccion;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/transaccion")
@RequiredArgsConstructor
public class TransaccionController {

    private final TransacionService transaccionService;

    @PostMapping
    public ResponseEntity<RespuestaCategoriaDTO> ingresarTransaccion(@RequestBody @Valid IngresarTransaccionDTO datos){

        Transaccion transaccionGuardada = transaccionService.ingresarTransaccion(datos);
        return ResponseEntity.status(HttpStatus.CREATED).body(new RespuestaCategoriaDTO(transaccionGuardada));
    }

    @GetMapping("/rangos")
    public ResponseEntity<List<DetallesTransaccionFiltradaDTO>> obtenerTransaccionPorFechas(@ModelAttribute @Valid TransaccionFiltradaDTO datos) {
        List<DetallesTransaccionFiltradaDTO> transacciones = transaccionService.obtenerTransaccionesPorRango(datos);
        if (transacciones.isEmpty()){
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(transacciones);
    }


    @PatchMapping("/actualizar/{id}")
    public ResponseEntity<Void> actualizarTransferencia(@PathVariable Long id, @RequestBody @Valid ActualizarTransaccionDTO datos) {

        transaccionService.actualizarTransferencia(id, datos);

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarTransaccion(@PathVariable Long id) {
        boolean eliminado = transaccionService.eliminarTransaccion(id);
        return eliminado
                ? ResponseEntity.noContent().build()  // 204 exito
                : ResponseEntity.notFound().build();  // 404 si no existe
    }

}
