package G9_LATAM_Team_11_FinanceAI.domain.Service;

import G9_LATAM_Team_11_FinanceAI.DTO.CategoriaDTOs.SolicitudCategoriaDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.TransaccionDTOs.ActualizarTransaccionDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.TransaccionDTOs.DetallesTransaccionFiltradaDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.TransaccionDTOs.IngresarTransaccionDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.TransaccionDTOs.TransaccionFiltradaDTO;
import G9_LATAM_Team_11_FinanceAI.Repository.IResumenMensualRepository;
import G9_LATAM_Team_11_FinanceAI.Repository.ITransaccionRepository;
import G9_LATAM_Team_11_FinanceAI.Repository.IUsuarioRepository;
import G9_LATAM_Team_11_FinanceAI.domain.resumenmensual.ResumenMensual;
import G9_LATAM_Team_11_FinanceAI.domain.transaccion.Transaccion;
import G9_LATAM_Team_11_FinanceAI.domain.usuario.Usuario;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class TransacionService {

    @Autowired
    private ITransaccionRepository transaccionRepository;

    @Autowired
    private IUsuarioRepository usuarioRepository;

    @Autowired
    private DataScienceModelService dataScienceService;

    private IResumenMensualRepository resumenMensualRepository;

    public Transaccion ingresarTransaccion(IngresarTransaccionDTO datos){

        Usuario usuario = obtenerUsuarioPorId(datos.idUsuario());

        validarUsuarioActivo(usuario);

        BigDecimal ingresoFijoMensual = usuario.getIngresoMensual();

        if (ingresoFijoMensual == null) {
            throw new ValidationException("El usuario no tiene un ingreso mensual asignado.");
        }
        // 1. Obtenemos mes y año de la fecha que viene en la transacción
        int mes = datos.fecha().getMonthValue();
        int anio = datos.fecha().getYear();

        // 2. Calculamos lo gastado únicamente en ese mes y año
        BigDecimal gastadoEnElMes = transaccionRepository.obtenerTotalGastadoEnMes(usuario.getId(), mes, anio);

        // 3. Calculamos cuánto le queda disponible para este mes
        BigDecimal saldoDisponible = ingresoFijoMensual.subtract(gastadoEnElMes);

        // 4. Validamos si la nueva transacción supera lo disponible
        if (saldoDisponible.compareTo(datos.monto()) < 0) {
            throw new ValidationException("No tiene suficiente ingreso para hacer esta transferencia.");
        }

        //obtener la categoria
        SolicitudCategoriaDTO solicitud = new SolicitudCategoriaDTO(datos);
        String categoriaObtenida = dataScienceService.obtenerCategoria(solicitud);

        //crea la transaccion con la categoria
        var transaccion  = crearTransaccion(datos, usuario, categoriaObtenida);

        //borra
        //descontarMontoDelIngresoMensual(usuario, datos);
        return transaccionRepository.save(transaccion);
    }


    public Usuario obtenerUsuarioPorId(Long id){
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no existe"));
    }

    private Transaccion crearTransaccion(IngresarTransaccionDTO datos, Usuario usuario, String categoria) {
        return new Transaccion(datos, usuario, categoria);
    }


    public void validarUsuarioActivo(Usuario usuario){

        if(!Boolean.TRUE.equals(usuario.getActivo())){
            throw new ValidationException("Usuario inactivo no puede hacer transferencia.");
        }

    }


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


    public boolean eliminaTransaciones(Long id) {
        try {
            transaccionRepository.deleteById(id);
            return true;
        }catch (EmptyResultDataAccessException e){
            return false;
        }
    }


    public BigDecimal calcularSaldoDisponibleReal(Long usuarioId, int mesActual, int anioActual) {
        Usuario usuario = obtenerUsuarioPorId(usuarioId);

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
