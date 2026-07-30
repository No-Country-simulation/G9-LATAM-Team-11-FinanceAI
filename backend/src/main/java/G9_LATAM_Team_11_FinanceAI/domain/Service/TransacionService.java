package G9_LATAM_Team_11_FinanceAI.domain.Service;

import G9_LATAM_Team_11_FinanceAI.DTO.DetallesTransaccionFiltradaDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.IngresarTransaccionDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.TransaccionFiltradaDTO;
import G9_LATAM_Team_11_FinanceAI.Repository.ITransaccionRepository;
import G9_LATAM_Team_11_FinanceAI.Repository.IUsuarioRepository;
import G9_LATAM_Team_11_FinanceAI.domain.transaccion.Transaccion;
import G9_LATAM_Team_11_FinanceAI.domain.usuario.Usuario;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransacionService {

    @Autowired
    private ITransaccionRepository repository;

    @Autowired
    private IUsuarioRepository usuarioRepository;


    public Transaccion ingresarTransaccion(IngresarTransaccionDTO datos){

        Usuario usuario = obtenerUsuarioPorId(datos.idUsuario());

        validarUsuarioActivo(usuario);

        var ingreso = crearTransaccion(datos, usuario);


        descontarMontoDelIngresoMensual(usuario, datos);


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

    public void descontarMontoDelIngresoMensual(Usuario usuario, IngresarTransaccionDTO datos){

        if (usuario.getIngresoMensual() == null || datos.monto() == null) {
            throw new ValidationException("Ingreso mensual o monto de transacción no puede ser nulo.");
        }
        usuario.setIngresoMensual(usuario.getIngresoMensual().subtract(datos.monto()));
    }

    // Metodo para filtrar transacciones de usuarios por rangos de fechas
    public List<DetallesTransaccionFiltradaDTO> obtenerTransaccionesPorRango(TransaccionFiltradaDTO datos) {
                Usuario usuario = usuarioRepository.findById(datos.idUsuario())
                .orElseThrow(() -> new IllegalArgumentException("El usuario ingresado no existe."));

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new IllegalStateException("No se puede realizar la acción solicitada.");
        }

        List<Transaccion> listadoTransacciones = repository
                .findByUsuarioIdAndFechaBetween(datos.idUsuario(), datos.desde(), datos.hasta());

        return listadoTransacciones.stream()
                .map(DetallesTransaccionFiltradaDTO::new)
                .toList();
    }
}
