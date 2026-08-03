package G9_LATAM_Team_11_FinanceAI.Repository;

import G9_LATAM_Team_11_FinanceAI.domain.usuario.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IUsuarioRepository extends JpaRepository<Usuario, Long> {

    @Query("SELECT DISTINCT u FROM Usuario u LEFT JOIN FETCH u.transacciones t WHERE u.activo = true AND MONTH(t.fecha) = :mes AND YEAR(t.fecha) = :anio")
    List<Usuario> findAllUsuariosActivosConTransaccionesPorMesAnio(@Param("mes") int mes, @Param("anio") int anio);
}
