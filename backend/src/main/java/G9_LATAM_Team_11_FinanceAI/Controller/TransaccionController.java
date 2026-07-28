package G9_LATAM_Team_11_FinanceAI.Controller;

import G9_LATAM_Team_11_FinanceAI.DTO.IngresarTransaccionDTO;
import G9_LATAM_Team_11_FinanceAI.Repository.ITransaccionRepository;
import G9_LATAM_Team_11_FinanceAI.domain.Service.TransacionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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


}
