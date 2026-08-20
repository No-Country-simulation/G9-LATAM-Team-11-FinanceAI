package G9_LATAM_Team_11_FinanceAI.domain.Service;

import G9_LATAM_Team_11_FinanceAI.Repository.ITransaccionRepository;
import G9_LATAM_Team_11_FinanceAI.Repository.IUsuarioRepository;
import G9_LATAM_Team_11_FinanceAI.domain.Models.FrecuenciaAhorro;
import G9_LATAM_Team_11_FinanceAI.domain.usuario.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class PerfilFinancieroService {

    @Autowired
    private ITransaccionRepository transaccionRepository;

    @Autowired
    private IUsuarioRepository usuarioRepository;

    @Autowired
    private DataScienceModelService dataScienceModelService;

    public FrecuenciaAhorro calcularFrecuenciaAhorro(Long idUsuario) {
        LocalDate fechaActual = LocalDate.now(); //fecha de hoy

        LocalDate primerDiaDelMes = fechaActual.withDayOfMonth(1);// necesito mes actual: desde el primer dia del mes

        long cantidadInversiones = transaccionRepository.countInversionesEnRango(idUsuario,
                "Inversión", primerDiaDelMes, fechaActual);

        // evaluacion por cantidad de inversion, no por monto
        if (cantidadInversiones == 0) {
            return FrecuenciaAhorro.NINGUNA;
        } else if (cantidadInversiones == 1) {
            return FrecuenciaAhorro.BAJA;
        } else if (cantidadInversiones == 2) {
            return FrecuenciaAhorro.MEDIA;
        } else {
            return FrecuenciaAhorro.ALTA; // 3 o mas inversiones
        }
    }

    public BigDecimal calcularPorcentajeEndeudamiento(Long idUsuario) {

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        BigDecimal ingresoMensual = usuario.getIngresoMensual();

        // controlar el ingreso mensual, si no está configurado o es cero, si divide por 0 da error
        if (ingresoMensual == null || ingresoMensual.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }


        // rango del mes actual "del 1 del mes a la fecha actual"
        LocalDate fechaActual = LocalDate.now();
        LocalDate primerDiaDelMes = fechaActual.withDayOfMonth(1);

        List<String> categoriasGastosFijos = List.of("vivienda", "servicios");

        // sumar vivienda y servicios del mes
        BigDecimal totalGastosFijos = transaccionRepository.sumarGastosPorCategoriasEnRango(
                idUsuario,
                categoriasGastosFijos,
                primerDiaDelMes,
                fechaActual
        );

        // saca el porcentaje: (gastos_fijos / ingreso_mensual) * 100
        BigDecimal porcentaje = totalGastosFijos
                .divide(ingresoMensual, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP); // 2 decimales (ej: 35.50%)

        return porcentaje;
    }


}