package G9_LATAM_Team_11_FinanceAI.domain.Service;

import G9_LATAM_Team_11_FinanceAI.DTO.CategoriaDTO.SolicitudCategoriaDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.TransaccionDTO.ActualizarTransaccionDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.TransaccionDTO.DetallesTransaccionFiltradaDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.TransaccionDTO.IngresarTransaccionDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.TransaccionDTO.TransaccionFiltradaDTO;
import G9_LATAM_Team_11_FinanceAI.Repository.IResumenMensualRepository;
import G9_LATAM_Team_11_FinanceAI.Repository.ITransaccionRepository;
import G9_LATAM_Team_11_FinanceAI.Repository.IUsuarioRepository;
import G9_LATAM_Team_11_FinanceAI.domain.resumenmensual.ResumenMensual;
import G9_LATAM_Team_11_FinanceAI.domain.transaccion.Transaccion;
import G9_LATAM_Team_11_FinanceAI.domain.usuario.Usuario;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransacionService {

    private final ITransaccionRepository transaccionRepository;
    private final IUsuarioRepository usuarioRepository;
    private final DataScienceModelService dataScienceService;
    private final IResumenMensualRepository resumenMensualRepository;
    private final UsuarioValidacionService usuarioValidacionService;

    @Transactional
    public Transaccion ingresarTransaccion(IngresarTransaccionDTO datos){
        Usuario usuario = usuarioValidacionService.obtenerUsuarioActivoOExcepcion(datos.idUsuario());

        BigDecimal ingresoFijoMensual = usuario.getIngresoMensual();

        if (ingresoFijoMensual == null) {
            throw new ValidationException("El usuario no tiene un ingreso mensual asignado.");
        }
        // obtenemos mes y año de la fecha que viene en la transacción
        int mes = datos.fecha().getMonthValue();
        int anio = datos.fecha().getYear();

        //calcula saldo disponible (sueldo + sobrante del mes - gastos)
        BigDecimal saldoDisponible = calcularSaldoDisponibleReal(usuario.getId(), mes, anio);
        // verifica que la transaccion no supere el saldo disponible
        if(saldoDisponible.compareTo(datos.monto())<0){
            throw new ValidationException("No tiene suficiente saldo para realizar la transaccion");}

        //obtener la categoria
        SolicitudCategoriaDTO solicitud = new SolicitudCategoriaDTO(datos);
        String categoriaObtenida = dataScienceService.obtenerCategoria(solicitud);

        //crea la transaccion con la categoria
        var transaccion  = crearTransaccion(datos, usuario, categoriaObtenida);

        return transaccionRepository.save(transaccion);
    }

    private Transaccion crearTransaccion(IngresarTransaccionDTO datos, Usuario usuario, String categoria) {
        return new Transaccion(datos, usuario, categoria);
    }



    @Transactional
    // Metodo para filtrar transacciones de usuarios por rangos de fechas
    public List<DetallesTransaccionFiltradaDTO> obtenerTransaccionesPorRango(TransaccionFiltradaDTO datos) {
        if (!usuarioRepository.existsByIdAndActivoTrue(datos.idUsuario())) {
            throw new IllegalStateException("No se logró realizar la acción solicitada, revise los parámetros ingresados.");
        }

        List<Transaccion> listadoTransacciones = transaccionRepository
                .findByUsuarioIdAndFechaBetween(datos.idUsuario(), datos.desde(), datos.hasta());

        return listadoTransacciones.stream()
                .map(DetallesTransaccionFiltradaDTO::new)
                .toList();
    }

    @Transactional
    public void actualizarTransferencia(Long id, ActualizarTransaccionDTO actualizar){

        Transaccion transaccion = obtenerTransaccionPorId(id);

        if (actualizar.categoria() != null) {
            transaccion.setCategoria(actualizar.categoria());
        }

        if (actualizar.descripcion() != null) {
            transaccion.setDescripcion(actualizar.descripcion());
        }

        if (actualizar.fecha() != null) {
            transaccion.setFecha(actualizar.fecha());
        }

        if (actualizar.monto() != null) {
            transaccion.setMonto(actualizar.monto());
        }
    }

    private Transaccion obtenerTransaccionPorId(Long id){
        return transaccionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("usuario no encontrado"));
    }

    @Transactional
    public boolean eliminarTransaccion(Long id) {
        if (transaccionRepository.existsById(id)) {
            transaccionRepository.deleteById(id);
            return true;
        }
        return false;
    }


    @Transactional
    public BigDecimal calcularSaldoDisponibleReal(Long usuarioId, int mesActual, int anioActual) {
        Usuario usuario = usuarioValidacionService.obtenerUsuarioOExcepcion(usuarioId);

        // sueldo Fijo/Modificado actual
        BigDecimal sueldoBase = usuario.getIngresoMensual();

        // obtener el sobrante del mes inmediatamente anterior (si existe)
        int mesAnterior = (mesActual == 1) ? 12 : mesActual - 1;
        int anioAnterior = (mesActual == 1) ? anioActual - 1 : anioActual;

        BigDecimal sobranteMesAnterior = resumenMensualRepository
                .findByUsuarioIdAndAnioAndMes(usuarioId, anioAnterior, mesAnterior)
                .map(ResumenMensual::getSobranteFinal)
                .orElse(BigDecimal.ZERO);

        // gastos realizados en el mes actual
        BigDecimal gastadoEnElMes = transaccionRepository
                .obtenerTotalGastadoEnMes(usuarioId, mesActual, anioActual);

        if (gastadoEnElMes == null) {
            gastadoEnElMes = BigDecimal.ZERO;
        }
        // calculo: (Sueldo Fijo + Sobrante Mes Anterior) - Gastos Mes Actual
        return sueldoBase.add(sobranteMesAnterior).subtract(gastadoEnElMes);
    }

}
