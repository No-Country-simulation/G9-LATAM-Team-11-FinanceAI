package G9_LATAM_Team_11_FinanceAI.Controller;

import G9_LATAM_Team_11_FinanceAI.DTO.AutenticacionDTOs.DatosLoginDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.AutenticacionDTOs.LoginRespuestaDTO;
import G9_LATAM_Team_11_FinanceAI.domain.Service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("login")

public class LoginController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping
    public ResponseEntity<?> login(@RequestBody DatosLoginDTO datos) {
        try {
            LoginRespuestaDTO respuesta = usuarioService.loginUsuario(datos);
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }
}
