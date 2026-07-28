package G9_LATAM_Team_11_FinanceAI.domain.Service;

import G9_LATAM_Team_11_FinanceAI.DTO.IngresarTransaccionDTO;
import G9_LATAM_Team_11_FinanceAI.Repository.ITransaccionRepository;
import G9_LATAM_Team_11_FinanceAI.Repository.IUsuarioRepository;
import G9_LATAM_Team_11_FinanceAI.domain.transaccion.Transaccion;
import G9_LATAM_Team_11_FinanceAI.domain.usuario.Usuario;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TransacionService {

    @Autowired
    private ITransaccionRepository repository;

    @Autowired
    private IUsuarioRepository usuarioRepository;


    public Transaccion ingresarTransaccion(IngresarTransaccionDTO datos){

        Usuario usuario = obtenerUsuarioPorId(datos.idUsuario());

        var ingreso = crearTransaccion(datos, usuario);

        validarUsuarioActivo(usuario);

        return repository.save(ingreso);

    }

    public Usuario obtenerUsuarioPorId(Long id){
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no existe"));
    }

    private Transaccion crearTransaccion(IngresarTransaccionDTO datos, Usuario usuario) {
        return new Transaccion(datos, usuario);
    }


    public void validarUsuarioActivo(Usuario usuario){

        if(!Boolean.TRUE.equals(usuario.getActivo())){
            throw new ValidationException("Usuario inactivo no puede hacer transferencia.");
        }

    }


}
