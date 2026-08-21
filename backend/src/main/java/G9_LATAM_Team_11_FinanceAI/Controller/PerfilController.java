package G9_LATAM_Team_11_FinanceAI.Controller;

import G9_LATAM_Team_11_FinanceAI.domain.Models.FrecuenciaAhorro;
import G9_LATAM_Team_11_FinanceAI.domain.Service.PerfilFinancieroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/perfil")
public class PerfilController {

    @Autowired
    private PerfilFinancieroService perfilFinancieroService;

    @GetMapping("/frecuencia-ahorro/{idUsuario}")
    public ResponseEntity<FrecuenciaAhorro> obtenerFrecuencia(@PathVariable Long idUsuario) {
        FrecuenciaAhorro frecuencia = perfilFinancieroService.calcularFrecuenciaAhorro(idUsuario);
        return ResponseEntity.ok(frecuencia);
    }

    @GetMapping("/endeudamiento/{idUsuario}")
    public ResponseEntity<BigDecimal> obtenerPorcentajeEndeudamiento(@PathVariable Long idUsuario) {
        BigDecimal porcentaje = perfilFinancieroService.calcularPorcentajeEndeudamiento(idUsuario);
        return ResponseEntity.ok(porcentaje);
    }

}
