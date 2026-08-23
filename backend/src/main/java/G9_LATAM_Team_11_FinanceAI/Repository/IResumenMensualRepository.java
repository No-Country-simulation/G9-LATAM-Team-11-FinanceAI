package G9_LATAM_Team_11_FinanceAI.Repository;

import G9_LATAM_Team_11_FinanceAI.domain.resumenmensual.ResumenMensual;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IResumenMensualRepository extends JpaRepository<ResumenMensual, Long> {
    Optional<ResumenMensual> findByUsuarioIdAndAnioAndMes(Long usuarioId, Integer anio, Integer mes);

}
