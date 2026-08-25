package G9_LATAM_Team_11_FinanceAI.infra.scheduler;

import G9_LATAM_Team_11_FinanceAI.Repository.IResumenMensualRepository;
import G9_LATAM_Team_11_FinanceAI.Repository.ITransaccionRepository;
import G9_LATAM_Team_11_FinanceAI.Repository.IUsuarioRepository;
import G9_LATAM_Team_11_FinanceAI.domain.resumenmensual.ResumenMensual;
import G9_LATAM_Team_11_FinanceAI.domain.usuario.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
public class CierreMensualScheduler {

    @Autowired
    private IUsuarioRepository usuarioRepository;

    @Autowired
    private ITransaccionRepository transaccionRepository;

    @Autowired
    private IResumenMensualRepository resumenMensualRepository;

    // se ejecutara automáticamente el día 1 de cada mes a las 00:00:00
    @Scheduled(cron = "0 0 0 1 * ?")
    @Transactional
    public void ejecutarCierreMensualAutomatico() {
        LocalDate hoy = LocalDate.now();
        LocalDate mesPasado = hoy.minusMonths(1);

        int mes = mesPasado.getMonthValue();
        int anio = mesPasado.getYear();

        List<Usuario> usuariosActivos = usuarioRepository.findByActivoTrue();

        for (Usuario usuario : usuariosActivos) {
            BigDecimal sueldoBase = usuario.getIngresoMensual();
            if (sueldoBase == null) continue;

            // obtener lo que gastó el mes pasado
            BigDecimal gastado = transaccionRepository.obtenerTotalGastadoEnMes(usuario.getId(), mes, anio);
            if (gastado == null) gastado = BigDecimal.ZERO;

            // obtener el sobrante del mes antepasado para encadenar acumulados
            LocalDate mesAntepasado = mesPasado.minusMonths(1);
            BigDecimal sobranteAnterior = resumenMensualRepository
                    .findByUsuarioIdAndAnioAndMes(usuario.getId(), mesAntepasado.getYear(), mesAntepasado.getMonthValue())
                    .map(ResumenMensual::getSobranteFinal)
                    .orElse(BigDecimal.ZERO);

            // calcular el sobrante del mes que acaba de cerrar
            BigDecimal sobranteFinal = sueldoBase.add(sobranteAnterior).subtract(gastado);

            if (sobranteFinal.compareTo(BigDecimal.ZERO) < 0) {
                sobranteFinal = BigDecimal.ZERO;
            }

            // guardar el resumen en la base de datos
            ResumenMensual resumen = new ResumenMensual();
            resumen.setUsuario(usuario);
            resumen.setAnio(anio);
            resumen.setMes(mes);
            resumen.setSueldoBase(sueldoBase);
            resumen.setSobranteMesAnterior(sobranteAnterior);
            resumen.setGastadoEnElMes(gastado);
            resumen.setSobranteFinal(sobranteFinal);

            resumenMensualRepository.save(resumen);
        }
    }
}