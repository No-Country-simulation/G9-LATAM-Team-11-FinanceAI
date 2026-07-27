package G9_LATAM_Team_11_FinanceAI.Controller;

import G9_LATAM_Team_11_FinanceAI.DTO.IngresarUsuarioDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.ListadoUsuarioDTO;
import G9_LATAM_Team_11_FinanceAI.Repository.IUsuarioRepository;
import G9_LATAM_Team_11_FinanceAI.domain.usuario.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/usuario")
public class UsuarioController {

    @Autowired
    private IUsuarioRepository repository;


    @Transactional
    @PostMapping
    public ResponseEntity ingresarUsuario(@RequestBody IngresarUsuarioDTO datos) {
        var ingreso = new Usuario(datos);
        repository.save(ingreso);

        return ResponseEntity.status(HttpStatus.CREATED).body(datos);
    }
    @Transactional
    @GetMapping("/{id}")
    public ResponseEntity<ListadoUsuarioDTO> obtenerUsuarioConTransacciones(@PathVariable Long id) {
        Usuario usuario = repository.findById(id).orElseThrow(() -> new RuntimeException("usuario no encontrado"));
        ListadoUsuarioDTO dto = new ListadoUsuarioDTO(usuario);
        return ResponseEntity.ok(dto);
    }

    //se realiza soft-delete en la base para desactivar cuentas de usuarios.
    @Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity eliminarUsuario (@PathVariable Long id){
        var eliminar = repository.getReferenceById(id);
        eliminar.eliminarUsuario();

        return ResponseEntity.noContent().build();
    }

}















