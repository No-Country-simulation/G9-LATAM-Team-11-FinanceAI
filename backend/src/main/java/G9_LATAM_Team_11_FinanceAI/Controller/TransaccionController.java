package G9_LATAM_Team_11_FinanceAI.Controller;

import G9_LATAM_Team_11_FinanceAI.DTO.IngresarTransaccionDTO;
import G9_LATAM_Team_11_FinanceAI.Repository.ITransaccionRepository;
import G9_LATAM_Team_11_FinanceAI.domain.transaccion.Transaccion;
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
    private ITransaccionRepository repository;

    @Transactional
    @PostMapping
    public ResponseEntity ingresarTransaccion(@RequestBody @Valid IngresarTransaccionDTO datos){
        var ingreso = new Transaccion(datos);
        repository.save(ingreso);
        return ResponseEntity.status(HttpStatus.CREATED).body(datos);
    }


}
