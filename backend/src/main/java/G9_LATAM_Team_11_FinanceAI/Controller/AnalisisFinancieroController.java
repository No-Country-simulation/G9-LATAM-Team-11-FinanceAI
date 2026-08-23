package G9_LATAM_Team_11_FinanceAI.Controller;


import G9_LATAM_Team_11_FinanceAI.DTO.AnalisisFinancieroDTO.RespuestaAnalisisFinancieroDTO;
import G9_LATAM_Team_11_FinanceAI.domain.Service.AnalisisFinancieroService;
import G9_LATAM_Team_11_FinanceAI.domain.analisis_financiero.AnalisisFinanciero;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/analisisfinanciero")
@RequiredArgsConstructor
public class AnalisisFinancieroController {

    private final AnalisisFinancieroService analisisFinancieroService;

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
