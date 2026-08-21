package G9_LATAM_Team_11_FinanceAI.Controller;

import G9_LATAM_Team_11_FinanceAI.DTO.AnalisisFinancieroDTO.IngresarAnalisisFinancieroDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.AnalisisFinancieroDTO.RespuestaAnalisisFinancieroDTO;
import G9_LATAM_Team_11_FinanceAI.domain.Service.AnalisisFinancieroService;
import jakarta.validation.Valid;
import G9_LATAM_Team_11_FinanceAI.domain.analisis_financiero.AnalisisFinanciero;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/analisisfinanciero")
public class AnalisisFinancieroController {


    @Autowired
    private AnalisisFinancieroService analisisFinancieroService;

    @PostMapping
    public ResponseEntity<RespuestaAnalisisFinancieroDTO> ingresarAnalisisFinanciero(@RequestBody @Valid IngresarAnalisisFinancieroDTO datos){


        AnalisisFinanciero analisis = analisisFinancieroService.ingresarAnalisisFinanciero(datos);

        return ResponseEntity.status(HttpStatus.CREATED).body(new RespuestaAnalisisFinancieroDTO(analisis));
    }

    @PostMapping("/guardar/{idUsuario}")
    public ResponseEntity<RespuestaAnalisisFinancieroDTO> generarAnalisis(@PathVariable Long idUsuario) {
        AnalisisFinanciero resultado = analisisFinancieroService.generarYGuardarAnalisis(idUsuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(new RespuestaAnalisisFinancieroDTO(resultado));
    }

    @GetMapping("/historial/{idUsuario}")
    public ResponseEntity<List<RespuestaAnalisisFinancieroDTO>> obtenerHistorial(@PathVariable Long idUsuario) {
        List<RespuestaAnalisisFinancieroDTO> historial = analisisFinancieroService.obtenerHistorialAnalisis(idUsuario);
        return ResponseEntity.ok(historial);
    }

}
