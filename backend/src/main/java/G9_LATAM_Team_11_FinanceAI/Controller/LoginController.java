package G9_LATAM_Team_11_FinanceAI.Controller;

import G9_LATAM_Team_11_FinanceAI.DTO.AutenticacionDTOs.DatosLoginDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.AutenticacionDTOs.LoginRespuestaDTO;
import G9_LATAM_Team_11_FinanceAI.domain.Service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/login")
@RequiredArgsConstructor
public class LoginController {

    private final UsuarioService usuarioService;

    @PostMapping
    public ResponseEntity<?> login(@RequestBody @Valid DatosLoginDTO datos) {
        try {
            LoginRespuestaDTO respuesta = usuarioService.loginUsuario(datos);
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }
}
