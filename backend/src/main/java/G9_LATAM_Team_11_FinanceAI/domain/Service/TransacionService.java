package G9_LATAM_Team_11_FinanceAI.domain.Service;

import G9_LATAM_Team_11_FinanceAI.DTO.IngresarTransaccionDTO;
import G9_LATAM_Team_11_FinanceAI.Repository.ITransaccionRepository;
import G9_LATAM_Team_11_FinanceAI.Repository.IUsuarioRepository;
import G9_LATAM_Team_11_FinanceAI.domain.transaccion.Transaccion;
import G9_LATAM_Team_11_FinanceAI.domain.usuario.Usuario;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TransacionService {

    @Autowired
    private ITransaccionRepository repository;

    @Autowired
    private IUsuarioRepository usuarioRepository;


    public Transaccion ingresarTransaccion(IngresarTransaccionDTO datos){

        Usuario usuario = usuarioRepository.findById(datos.idUsuario())
                .orElseThrow(() -> new EntityNotFoundException("Usuario no existe"));

        var ingreso = new Transaccion(datos, usuario);

        return repository.save(ingreso);

    }


}
