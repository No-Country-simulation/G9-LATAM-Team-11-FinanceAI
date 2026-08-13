package G9_LATAM_Team_11_FinanceAI.domain.Service;

import G9_LATAM_Team_11_FinanceAI.DTO.AnalisisFinancieroDTO.IngresarAnalisisFinancieroDTO;
import G9_LATAM_Team_11_FinanceAI.Repository.IAnalisisFinanciero;
import G9_LATAM_Team_11_FinanceAI.Repository.IUsuarioRepository;
import G9_LATAM_Team_11_FinanceAI.analisis_financiero.AnalisisFinanciero;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class AnalisisFinancieroService {

    @Autowired
    private IAnalisisFinanciero iAnalisisFinanciero;

    @Autowired
    private IUsuarioRepository usuarioRepository;

    public AnalisisFinanciero ingresarAnalisisFinanciero(IngresarAnalisisFinancieroDTO datos){

        var usuario = usuarioRepository.findById(datos.idUsuario())
                .orElseThrow(() -> new EntityNotFoundException("Usuario no existe"));

            var analisisfinanciero = new AnalisisFinanciero(datos, usuario);

            return iAnalisisFinanciero.save(analisisfinanciero);
    }

}
