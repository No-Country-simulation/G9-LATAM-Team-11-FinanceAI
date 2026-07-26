package G9_LATAM_Team_11_FinanceAI.Repository;

import G9_LATAM_Team_11_FinanceAI.domain.transaccion.Transaccion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ITransaccionRepository extends JpaRepository<Transaccion, Long> {

}
