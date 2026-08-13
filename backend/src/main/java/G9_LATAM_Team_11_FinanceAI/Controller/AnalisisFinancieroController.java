package G9_LATAM_Team_11_FinanceAI.Controller;

import G9_LATAM_Team_11_FinanceAI.DTO.AnalisisFinancieroDTO.IngresarAnalisisFinancieroDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.AnalisisFinancieroDTO.RespuestaAnalisisFinancieroDTO;
import G9_LATAM_Team_11_FinanceAI.domain.Service.AnalisisFinancieroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("analisisfinanciero")
public class AnalisisFinancieroController {


    @Autowired
    private AnalisisFinancieroService analisisFinancieroService;

    @PostMapping
    public ResponseEntity<?> ingresarAnalisisFinanciero(@RequestBody IngresarAnalisisFinancieroDTO datos){

        var analisis  = analisisFinancieroService.ingresarAnalisisFinanciero(datos);


        return ResponseEntity.status(HttpStatus.CREATED).body(new RespuestaAnalisisFinancieroDTO(analisis));
    }


}
