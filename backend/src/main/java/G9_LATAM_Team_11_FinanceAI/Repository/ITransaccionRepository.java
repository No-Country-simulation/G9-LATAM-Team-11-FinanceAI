package G9_LATAM_Team_11_FinanceAI.Repository;

import G9_LATAM_Team_11_FinanceAI.domain.transaccion.Transaccion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ITransaccionRepository extends JpaRepository<Transaccion, Long> {

        List<Transaccion> findByUsuarioIdAndFechaBetween(Long idUsuario, LocalDate desde, LocalDate hasta);

    boolean existsByUsuarioIdAndDescripcionAndMontoAndFecha(Long idUsuario, String descripcion, BigDecimal monto, LocalDate fecha);
}
