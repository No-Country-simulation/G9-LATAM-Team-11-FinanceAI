package G9_LATAM_Team_11_FinanceAI.domain.Service;

import G9_LATAM_Team_11_FinanceAI.DTO.AutenticacionDTO.DatosLoginDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.AutenticacionDTO.LoginRespuestaDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.HistorialSueldoDTO.HistorialSueldoDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.UsuarioDTO.IngresarUsuarioDTO;
import G9_LATAM_Team_11_FinanceAI.Repository.IHistorialSueldoRespository;
import G9_LATAM_Team_11_FinanceAI.Repository.IUsuarioRepository;
import G9_LATAM_Team_11_FinanceAI.domain.historialsueldo.HistorialSueldo;
import G9_LATAM_Team_11_FinanceAI.domain.usuario.Usuario;
import jakarta.transaction.Transactional;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService implements UserDetailsService {

    private final PasswordEncoder passwordEncoder;

    private final IUsuarioRepository usuarioRepository;

    private final TokenService tokenService;

    private final IHistorialSueldoRespository historialSueldoRespository;

    private final UsuarioValidacionService usuarioValidacionService;

    @Transactional
    public Usuario ingresarUsuario(IngresarUsuarioDTO datos){

        ValidaUsuarioRepetido(datos);
        String passwordEncriptada = passwordEncoder.encode(datos.password());
        Usuario usuario = new Usuario(datos, passwordEncriptada);

        return usuarioRepository.save(usuario);
    }

    public void ValidaUsuarioRepetido(IngresarUsuarioDTO datos){
        boolean cuentaRepetida =usuarioRepository.existsByEmail(
                datos.email());
        if(cuentaRepetida){
            throw new ValidationException("La cuenta ya se encuentra registrada en la base de datos.");
        }
    }

    @Transactional
    public Usuario obtenerUsuarioConTransacciones(Long id){
        return usuarioValidacionService.obtenerUsuarioActivoOExcepcion(id);
    }

    @Transactional
    public void eliminarUsuario(Long id){
        Usuario usuario = usuarioValidacionService.obtenerUsuarioOExcepcion(id);
        usuario.eliminarUsuario();
    }

    @Transactional
    public List<Usuario> obtenerTodosLosUsuariosConTransaccionesPorMesAnio(int mes, int anio) {
        return usuarioRepository.findAllUsuariosActivosConTransaccionesPorMesAnio(mes, anio);
    }

    @Transactional
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
        return new LoginRespuestaDTO(token, usuario.getId(), usuario.getNombre(), usuario.getEmail());
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return usuarioRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con el email: " + username));
    }

    @Transactional
    public void actualizarSueldoUsuario(Long usuarioId, BigDecimal nuevoSueldo) {
        Usuario usuario = usuarioValidacionService.obtenerUsuarioOExcepcion(usuarioId);
        BigDecimal sueldoAnterior = usuario.getIngresoMensual();

        if (sueldoAnterior == null || sueldoAnterior.compareTo(nuevoSueldo) != 0) {
            // registrar modificación en el historial de sueldo
            HistorialSueldo historial = new HistorialSueldo(usuario, sueldoAnterior, nuevoSueldo);
            historialSueldoRespository.save(historial);

            // actualizar el sueldo del usuario
            usuario.setIngresoMensual(nuevoSueldo);
            usuarioRepository.save(usuario);
        }
    }

    @Transactional
    public List<HistorialSueldoDTO> obtenerHistorialSueldo(Long usuarioId) {
        Usuario usuario = usuarioValidacionService.obtenerUsuarioOExcepcion(usuarioId);

        List<HistorialSueldo> historial = historialSueldoRespository
                .findByUsuarioIdOrderByFechaModificacionDesc(usuarioId);

        if (historial.isEmpty()) {
            return List.of(new HistorialSueldoDTO(
                    usuario.getIngresoMensual(),
                    usuario.getIngresoMensual(),
                    LocalDateTime.now()
            ));
        }

        return historial.stream()
                .map(HistorialSueldoDTO::new)
                .toList();
    }
}
