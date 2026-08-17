package G9_LATAM_Team_11_FinanceAI.domain.Service;

import G9_LATAM_Team_11_FinanceAI.DTO.UsuarioDTOs.IngresarUsuarioDTO;
import G9_LATAM_Team_11_FinanceAI.Repository.IUsuarioRepository;
import G9_LATAM_Team_11_FinanceAI.domain.usuario.Usuario;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UsuarioService {

    @Autowired
    private IUsuarioRepository usuarioRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public Usuario ingresarUsuario(IngresarUsuarioDTO datos) {
        validaUsuarioRepetido(datos);

        String passwordCifrada = passwordEncoder.encode(datos.password());
        Usuario nuevoUsuario = new Usuario(datos, passwordCifrada);

        return usuarioRepository.save(nuevoUsuario);
    }

    public void validaUsuarioRepetido(IngresarUsuarioDTO datos) {
        boolean cuentaRepetida = usuarioRepository.existsByEmail(datos.email());
        if (cuentaRepetida) {
            throw new ValidationException("La cuenta ya se encuentra registrada en la base de datos.");
        }
    }

    @Transactional(readOnly = true)
    public Usuario autenticarUsuario(String email, String rawPassword) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ValidationException("Credenciales inválidas."));

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new ValidationException("La cuenta de usuario se encuentra desactivada.");
        }

        // Si la contraseña almacenada empieza con $2a$ o $2b$ (BCrypt), verificar con passwordEncoder
        if (usuario.getPassword().startsWith("$2a$") || usuario.getPassword().startsWith("$2b$") || usuario.getPassword().startsWith("$2y$")) {
            if (!passwordEncoder.matches(rawPassword, usuario.getPassword())) {
                throw new ValidationException("Credenciales inválidas.");
            }
        } else {
            // Compatibilidad hacia atrás si hubiera contraseñas legadas en texto plano
            if (!usuario.getPassword().equals(rawPassword)) {
                throw new ValidationException("Credenciales inválidas.");
            }
            // Auto-migrar a BCrypt en el próximo inicio exitoso
            usuario.setPassword(passwordEncoder.encode(rawPassword));
            usuarioRepository.save(usuario);
        }

        return usuario;
    }

    @Transactional(readOnly = true)
    public Usuario obtenerUsuarioConTransacciones(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con ID: " + id));
    }

    @Transactional
    public void eliminarUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con ID: " + id));
        usuario.eliminarUsuario();
    }

    @Transactional(readOnly = true)
    public List<Usuario> obtenerTodosLosUsuariosConTransaccionesPorMesAnio(int mes, int anio) {
        return usuarioRepository.findAllUsuariosActivosConTransaccionesPorMesAnio(mes, anio);
    }
}
