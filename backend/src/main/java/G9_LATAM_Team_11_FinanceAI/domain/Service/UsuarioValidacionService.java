package G9_LATAM_Team_11_FinanceAI.domain.Service;

import G9_LATAM_Team_11_FinanceAI.Repository.IUsuarioRepository;
import G9_LATAM_Team_11_FinanceAI.domain.usuario.Usuario;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsuarioValidacionService {

    private final IUsuarioRepository usuarioRepository;

    public Usuario obtenerUsuarioOExcepcion(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));
    }

    public void validarExistencia(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new EntityNotFoundException("Usuario no encontrado");
        }
    }

    public Usuario obtenerUsuarioActivoOExcepcion(Long id) {
        Usuario usuario = obtenerUsuarioOExcepcion(id);
        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new ValidationException("Usuario inactivo no puede realizar esta operación.");
        }
        return usuario;
    }
}
