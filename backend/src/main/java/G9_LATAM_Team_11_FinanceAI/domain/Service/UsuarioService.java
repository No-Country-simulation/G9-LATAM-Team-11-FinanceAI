package G9_LATAM_Team_11_FinanceAI.domain.Service;

import G9_LATAM_Team_11_FinanceAI.DTO.UsuarioDTOs.IngresarUsuarioDTO;
import G9_LATAM_Team_11_FinanceAI.Repository.IUsuarioRepository;
import G9_LATAM_Team_11_FinanceAI.domain.usuario.Usuario;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    @Autowired
    private IUsuarioRepository repository;

    @Autowired
    IUsuarioRepository usuarioRepository;

    public Usuario ingresarUsuario(IngresarUsuarioDTO datos){

        var ingreso = new Usuario(datos);

        ValidaUsuarioRepetido(datos);

        return repository.save(ingreso);
    }

    public void ValidaUsuarioRepetido(IngresarUsuarioDTO datos){
        boolean cuentaRepetida =usuarioRepository.existsByEmail(
                datos.email());

        if (cuentaRepetida){
            throw new ValidationException("La cuenta ya se encuentra registrada en la base de datos.");
        }
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

    public List<Usuario> obtenerTodosLosUsuariosConTransaccionesPorMesAnio(int mes, int anio) {
        return usuarioRepository.findAllUsuariosActivosConTransaccionesPorMesAnio(mes, anio);
    }
}
