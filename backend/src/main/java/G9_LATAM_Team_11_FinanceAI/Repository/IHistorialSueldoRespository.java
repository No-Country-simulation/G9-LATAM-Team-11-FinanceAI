package G9_LATAM_Team_11_FinanceAI.Repository;

import G9_LATAM_Team_11_FinanceAI.domain.historialsueldo.HistorialSueldo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IHistorialSueldoRespository extends JpaRepository<HistorialSueldo, Long> {

    // lista completa de cambios de sueldo de un usuario
    List<HistorialSueldo> findByUsuarioIdOrderByFechaModificacionDesc(Long usuarioId);

}
