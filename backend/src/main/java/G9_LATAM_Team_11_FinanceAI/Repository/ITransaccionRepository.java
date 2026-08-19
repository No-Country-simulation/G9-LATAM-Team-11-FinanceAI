package G9_LATAM_Team_11_FinanceAI.Repository;

import G9_LATAM_Team_11_FinanceAI.domain.transaccion.Transaccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ITransaccionRepository extends JpaRepository<Transaccion, Long> {

    List<Transaccion> findByUsuarioIdAndFechaBetween(Long idUsuario, LocalDate desde, LocalDate hasta);

    boolean existsByUsuarioIdAndDescripcionAndMontoAndFecha(Long idUsuario, String descripcion, BigDecimal monto, LocalDate fecha);

    //suma todos los montos de las transacciones del usuario en el mes y año actual:
    @Query("""
        SELECT COALESCE(SUM(t.monto), 0) 
        FROM Transaccion t 
        WHERE t.usuario.id = :idUsuario 
          AND MONTH(t.fecha) = :mes 
          AND YEAR(t.fecha) = :anio
    """)
    BigDecimal obtenerTotalGastadoEnMes(
            @Param("idUsuario") Long idUsuario,
            @Param("mes") int mes,
            @Param("anio") int anio
    );

}
