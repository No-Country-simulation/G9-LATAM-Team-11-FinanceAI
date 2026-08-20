package G9_LATAM_Team_11_FinanceAI.Repository;

import G9_LATAM_Team_11_FinanceAI.domain.analisis_financiero.AnalisisFinanciero;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IAnalisisFinanciero extends JpaRepository<AnalisisFinanciero, Long> {

    List<AnalisisFinanciero> findByUsuarioIdOrderByFechaAnalisisDesc(Long idUsuario);
}
