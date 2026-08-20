package G9_LATAM_Team_11_FinanceAI.Controller;

import G9_LATAM_Team_11_FinanceAI.DTO.CategoriaDTOs.RespuestaCategoriaDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.TransaccionDTOs.ActualizarTransaccionDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.TransaccionDTOs.DetallesTransaccionFiltradaDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.TransaccionDTOs.IngresarTransaccionDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.TransaccionDTOs.TransaccionFiltradaDTO;
import G9_LATAM_Team_11_FinanceAI.domain.Service.TransacionService;
import G9_LATAM_Team_11_FinanceAI.domain.transaccion.Transaccion;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/transaccion")

public class TransaccionController {

    @Autowired
    TransacionService transaccionService;

    @Transactional
    @PostMapping
    public ResponseEntity<?> ingresarTransaccion(@RequestBody @Valid IngresarTransaccionDTO datos){

        Transaccion transaccionGuardada = transaccionService.ingresarTransaccion(datos);

        var respuesta = new RespuestaCategoriaDTO(transaccionGuardada);

        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }


    @Transactional
    @PostMapping("/rangos")
    public ResponseEntity<List<DetallesTransaccionFiltradaDTO>> obtenerTransaccionPorFechas(@RequestBody TransaccionFiltradaDTO datos) {
        List<DetallesTransaccionFiltradaDTO> transacciones = transaccionService.obtenerTransaccionesPorRango(datos);
        return ResponseEntity.ok(transacciones);
    }


    @Transactional
    @PatchMapping("/actualizar/{id}")
    public ResponseEntity<?> actualizarTransferencia(@PathVariable Long id, @RequestBody ActualizarTransaccionDTO datos) {

        transaccionService.actualizarTransferencia(id, datos);

        return ResponseEntity.ok().build();
    }

    

}
