package G9_LATAM_Team_11_FinanceAI.domain.Service;

import G9_LATAM_Team_11_FinanceAI.DTO.AutenticacionDTOs.DatosLoginDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.AutenticacionDTOs.LoginRespuestaDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.HistorialSueldoDTO.HistorialSueldoDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.UsuarioDTOs.IngresarUsuarioDTO;
import G9_LATAM_Team_11_FinanceAI.Repository.IHistorialSueldoRespository;
import G9_LATAM_Team_11_FinanceAI.Repository.IUsuarioRepository;
import G9_LATAM_Team_11_FinanceAI.domain.historialsueldo.HistorialSueldo;
import G9_LATAM_Team_11_FinanceAI.domain.usuario.Usuario;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import jakarta.validation.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class UsuarioService implements UserDetailsService {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private IUsuarioRepository usuarioRepository;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private IHistorialSueldoRespository historialSueldoRespository;

    public Usuario ingresarUsuario(IngresarUsuarioDTO datos){

        ValidaUsuarioRepetido(datos);

        String passwordEncriptada = passwordEncoder.encode(datos.password());

        var ingreso = new Usuario(datos, passwordEncriptada);

        return usuarioRepository.save(ingreso);
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

        var eliminar = usuarioRepository.getReferenceById(id);

        eliminar.eliminarUsuario();
    }

    public List<Usuario> obtenerTodosLosUsuariosConTransaccionesPorMesAnio(int mes, int anio) {
        return usuarioRepository.findAllUsuariosActivosConTransaccionesPorMesAnio(mes, anio);
    }

    public LoginRespuestaDTO loginUsuario (DatosLoginDTO datos) {
        var usuario = usuarioRepository.findByEmail(datos.email())
                .orElseThrow(() -> new RuntimeException("Usuario no registrado."));
        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new RuntimeException("La cuenta se encuentra desactivada.");
        }
        boolean coincide = passwordEncoder.matches(datos.password(), usuario.getPassword());
        if (!coincide) {
            throw new RuntimeException("Contraseña incorrecta.");
        }
        String token = tokenService.generarToken(usuario.getEmail());
        String mensaje = "Bienvenido/a, " + usuario.getNombre();
        return new LoginRespuestaDTO(token, usuario.getId(), usuario.getNombre(), usuario.getEmail());
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return usuarioRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con el email: " + username));
    }

    @Transactional
    public void actualizarSueldoUsuario(Long usuarioId, BigDecimal nuevoSueldo) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        BigDecimal sueldoAnterior = usuario.getIngresoMensual();

        if (sueldoAnterior.compareTo(nuevoSueldo) != 0) {
            // registrar modificación en el historial de sueldo
            HistorialSueldo historial = new HistorialSueldo(usuario, sueldoAnterior, nuevoSueldo);
            historialSueldoRespository.save(historial);

            // actualizar el sueldo del usuario
            usuario.setIngresoMensual(nuevoSueldo);
            usuarioRepository.save(usuario);
        }
    }

    public List<HistorialSueldoDTO> obtenerHistorialSueldo(Long usuarioId) {
        // Validar si el usuario existe antes de buscar
        if (!usuarioRepository.existsById(usuarioId)) {
            throw new EntityNotFoundException("Usuario no encontrado.");
        }

        return historialSueldoRespository
                .findByUsuarioIdOrderByFechaModificacionDesc(usuarioId)
                .stream()
                .map(HistorialSueldoDTO::new)
                .toList();
    }
}
