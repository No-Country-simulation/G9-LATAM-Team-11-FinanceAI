package G9_LATAM_Team_11_FinanceAI.domain.resumenmensual;

import G9_LATAM_Team_11_FinanceAI.domain.usuario.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "resumen_mensual")
public class ResumenMensual {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    private Integer anio;
    private Integer mes;
    private BigDecimal sueldoBase;        // sueldo configurado en ingreso_mensual
    private BigDecimal sobranteMesAnterior; // acumulado que viene del mes anterior
    private BigDecimal gastadoEnElMes;
    private BigDecimal sobranteFinal;     // arrastrara al mes siguiente

    // Constructores, Getters y Setters
}