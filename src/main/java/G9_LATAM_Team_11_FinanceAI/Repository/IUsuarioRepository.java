package G9_LATAM_Team_11_FinanceAI.Repository;

import G9_LATAM_Team_11_FinanceAI.domain.usuario.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IUsuarioRepository extends JpaRepository<Usuario, Long> {
}
