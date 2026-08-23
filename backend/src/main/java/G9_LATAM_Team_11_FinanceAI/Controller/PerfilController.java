package G9_LATAM_Team_11_FinanceAI.Controller;

import G9_LATAM_Team_11_FinanceAI.domain.Models.FrecuenciaAhorro;
import G9_LATAM_Team_11_FinanceAI.domain.Service.PerfilFinancieroService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/perfil")
@RequiredArgsConstructor
public class PerfilController {

    private final PerfilFinancieroService perfilFinancieroService;

    @GetMapping("/frecuencia-ahorro/{idUsuario}")
    public ResponseEntity<FrecuenciaAhorro> obtenerFrecuencia(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(perfilFinancieroService.calcularFrecuenciaAhorro(idUsuario));
    }

    @GetMapping("/endeudamiento/{idUsuario}")
    public ResponseEntity<BigDecimal> obtenerPorcentajeEndeudamiento(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(perfilFinancieroService.calcularPorcentajeEndeudamiento(idUsuario));
    }

}
