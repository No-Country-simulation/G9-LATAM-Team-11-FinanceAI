package G9_LATAM_Team_11_FinanceAI.Controller;

import G9_LATAM_Team_11_FinanceAI.DTO.AutenticacionDTOs.DatosAutenticacionDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.AutenticacionDTOs.LoginRespuestaDTO;
import G9_LATAM_Team_11_FinanceAI.domain.Service.UsuarioService;
import G9_LATAM_Team_11_FinanceAI.domain.usuario.Usuario;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/login")
@CrossOrigin(origins = {"http://localhost:8082", "http://localhost:3000", "http://127.0.0.1:8082", "http://127.0.0.1:3000"})
public class LoginController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping
    public ResponseEntity<LoginRespuestaDTO> login(@RequestBody @Valid DatosAutenticacionDTO datos) {
        Usuario usuario = usuarioService.autenticarUsuario(datos.email(), datos.password());

        // Para el MVP se genera un token de sesión opaco seguro
        String token = UUID.randomUUID().toString();

        LoginRespuestaDTO respuesta = new LoginRespuestaDTO(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getIngresoMensual(),
                token
        );

        return ResponseEntity.ok(respuesta);
    }
}
