package G9_LATAM_Team_11_FinanceAI.domain.Service;

import G9_LATAM_Team_11_FinanceAI.DTO.IngresarUsuarioDTO;
import G9_LATAM_Team_11_FinanceAI.Repository.IUsuarioRepository;
import G9_LATAM_Team_11_FinanceAI.domain.usuario.Usuario;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    @Autowired
    private IUsuarioRepository repository;

    @Autowired
    IUsuarioRepository usuarioRepository;

    public Usuario ingresarUsuario(IngresarUsuarioDTO datos){

        var ingreso = new Usuario(datos);

        return repository.save(ingreso);
    }

    public Usuario obtenerUsuarioConTransacciones(Long id){

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("usuario no encontrado"));

        return usuario;
    }

    public void eliminarUsuario(Long id){

        var eliminar = repository.getReferenceById(id);

        eliminar.eliminarUsuario();
    }
}
