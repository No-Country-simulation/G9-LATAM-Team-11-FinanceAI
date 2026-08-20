package G9_LATAM_Team_11_FinanceAI.Repository;

import G9_LATAM_Team_11_FinanceAI.analisis_financiero.AnalisisFinanciero;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IAnalisisFinanciero extends JpaRepository<AnalisisFinanciero, Long> {
}
