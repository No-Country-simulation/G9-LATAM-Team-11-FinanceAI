package G9_LATAM_Team_11_FinanceAI.Controller;

import G9_LATAM_Team_11_FinanceAI.DTO.UsuarioDTOs.IngresarUsuarioDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.UsuarioDTOs.ListadoUsuarioDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.UsuarioDTOs.RespuestaUsuarioDTO;
import G9_LATAM_Team_11_FinanceAI.domain.Service.UsuarioService;
import G9_LATAM_Team_11_FinanceAI.domain.usuario.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/usuario")
@CrossOrigin(origins = "http://localhost:8082")

public class UsuarioController {


    @Autowired
    private UsuarioService usuarioService;

    @Transactional
    @PostMapping
    public ResponseEntity ingresarUsuario(@RequestBody IngresarUsuarioDTO datos) {

        var u = usuarioService.ingresarUsuario(datos);
        var mje= "Usuario "+ datos.nombre() +" registrado con éxito";
        var resultado = new RespuestaUsuarioDTO(mje, u.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(resultado);
    }
    @Transactional
    @GetMapping("/{id}")
    public ResponseEntity<ListadoUsuarioDTO> obtenerUsuarioConTransacciones(@PathVariable Long id) {

        Usuario usuario = usuarioService.obtenerUsuarioConTransacciones(id);

        ListadoUsuarioDTO dto = new ListadoUsuarioDTO(usuario);

        return ResponseEntity.ok(dto);
    }

    //se realiza soft-delete en la base para desactivar cuentas de usuarios.
    @Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity eliminarUsuario (@PathVariable Long id){

        usuarioService.eliminarUsuario(id);

        return ResponseEntity.noContent().build();
    }

    @Transactional(readOnly = true)
    @GetMapping("/activos/mesanio")
    public ResponseEntity<List<ListadoUsuarioDTO>> obtenerTodosLosUsuariosConTransacciones(@RequestParam(name = "mes") int mes, @RequestParam(name = "anio") int anio) {

        List<Usuario> usuarios = usuarioService.obtenerTodosLosUsuariosConTransaccionesPorMesAnio(mes, anio);

        List<ListadoUsuarioDTO> dtoList = usuarios.stream()
                .map(ListadoUsuarioDTO::new)
                .toList();

        return ResponseEntity.ok(dtoList);
    }
}















