package G9_LATAM_Team_11_FinanceAI.Controller;

import G9_LATAM_Team_11_FinanceAI.DTO.AnalisisFinancieroDTO.IngresarAnalisisFinancieroDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.AnalisisFinancieroDTO.RespuestaAnalisisFinancieroDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.AnalisisFinancieroDTO.ResultadoAnalisisDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.AnalisisFinancieroDTO.SolicitudAnalisisDTO;
import G9_LATAM_Team_11_FinanceAI.domain.Service.AnalisisFinancieroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/analisis-financiero", "/analisisfinanciero"})
@CrossOrigin(origins = {"http://localhost:8082", "http://localhost:3000", "http://127.0.0.1:8082", "http://127.0.0.1:3000"})
public class AnalisisFinancieroController {

    @Autowired
    private AnalisisFinancieroService analisisFinancieroService;

    @PostMapping
    public ResponseEntity<ResultadoAnalisisDTO> realizarAnalisisFinanciero(@RequestBody SolicitudAnalisisDTO solicitud) {
        ResultadoAnalisisDTO resultado = analisisFinancieroService.analizarFinanzas(solicitud);
        return ResponseEntity.ok(resultado);
    }

    @PostMapping("/manual")
    public ResponseEntity<RespuestaAnalisisFinancieroDTO> ingresarAnalisisFinancieroManual(@RequestBody IngresarAnalisisFinancieroDTO datos) {
        var analisis = analisisFinancieroService.ingresarAnalisisFinanciero(datos);
        return ResponseEntity.status(HttpStatus.CREATED).body(new RespuestaAnalisisFinancieroDTO(analisis));
    }
}
