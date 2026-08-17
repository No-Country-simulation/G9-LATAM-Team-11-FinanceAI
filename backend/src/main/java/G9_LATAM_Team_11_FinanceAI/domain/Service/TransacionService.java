package G9_LATAM_Team_11_FinanceAI.domain.Service;

import G9_LATAM_Team_11_FinanceAI.DTO.CategoriaDTOs.SolicitudCategoriaDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.TransaccionDTOs.ActualizarTransaccionDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.TransaccionDTOs.DetallesTransaccionFiltradaDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.TransaccionDTOs.IngresarTransaccionDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.TransaccionDTOs.TransaccionFiltradaDTO;
import G9_LATAM_Team_11_FinanceAI.Repository.ITransaccionRepository;
import G9_LATAM_Team_11_FinanceAI.Repository.IUsuarioRepository;
import G9_LATAM_Team_11_FinanceAI.domain.transaccion.Transaccion;
import G9_LATAM_Team_11_FinanceAI.domain.usuario.Usuario;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TransacionService {

    @Autowired
    private ITransaccionRepository transaccionRepository;

    @Autowired
    private IUsuarioRepository usuarioRepository;

    @Autowired
    private DataScienceModelService dataScienceService;

    @Transactional
    public Transaccion ingresarTransaccion(IngresarTransaccionDTO datos) {
        Usuario usuario = obtenerUsuarioPorId(datos.idUsuario());
        validarUsuarioActivo(usuario);
        validarTransaccionDuplicada(datos);

        // Obtener la categoría mediante inferencia ONNX NLP
        SolicitudCategoriaDTO solicitud = new SolicitudCategoriaDTO(datos);
        String categoriaObtenida = dataScienceService.obtenerCategoria(solicitud);

        // Crear la transacción con la categoría inferida
        Transaccion transaccion = new Transaccion(datos, usuario, categoriaObtenida);
        return transaccionRepository.save(transaccion);
    }

    // Validación para que un mismo usuario no ingrese transacciones duplicadas idénticas
    public void validarTransaccionDuplicada(IngresarTransaccionDTO datos) {
        boolean existeDuplicidad = transaccionRepository.existsByUsuarioIdAndDescripcionAndMontoAndFecha(
                datos.idUsuario(),
                datos.descripcion(),
                datos.monto(),
                datos.fecha()
        );

        if (existeDuplicidad) {
            throw new ValidationException("Esta transacción ya fue ingresada al sistema.");
        }
    }

    @Transactional(readOnly = true)
    public Usuario obtenerUsuarioPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con ID: " + id));
    }

    public void validarUsuarioActivo(Usuario usuario) {
        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new ValidationException("El usuario se encuentra inactivo.");
        }
    }

    // Método para filtrar transacciones de usuarios por rangos de fechas
    @Transactional(readOnly = true)
    public List<DetallesTransaccionFiltradaDTO> obtenerTransaccionesPorRango(TransaccionFiltradaDTO datos) {
        Usuario usuario = usuarioRepository.findById(datos.idUsuario())
                .orElseThrow(() -> new IllegalArgumentException("No se encontró la información solicitada para los parámetros ingresados."));

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new IllegalStateException("El usuario solicitado se encuentra inactivo.");
        }

        List<Transaccion> listadoTransacciones = transaccionRepository
                .findByUsuarioIdAndFechaBetween(datos.idUsuario(), datos.desde(), datos.hasta());

        return listadoTransacciones.stream()
                .map(DetallesTransaccionFiltradaDTO::new)
                .toList();
    }

    @Transactional
    public Transaccion actualizarTransferencia(Long id, ActualizarTransaccionDTO actualizar) {
        Transaccion transaccion = obtenerTransaccionPorId(id);

        if (actualizar.categoria() != null && !actualizar.categoria().isBlank()) {
            transaccion.setCategoria(actualizar.categoria());
        }

        if (actualizar.descripcion() != null && !actualizar.descripcion().isBlank()) {
            transaccion.setDescripcion(actualizar.descripcion());
        }

        if (actualizar.fecha() != null) {
            transaccion.setFecha(actualizar.fecha());
        }

        if (actualizar.monto() != null) {
            transaccion.setMonto(actualizar.monto());
        }

        return transaccionRepository.save(transaccion);
    }

    @Transactional(readOnly = true)
    public Transaccion obtenerTransaccionPorId(Long id) {
        return transaccionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transacción no encontrada con ID: " + id));
    }
}
