package G9_LATAM_Team_11_FinanceAI.domain.transaccion;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Date;

@Table(name = "transacciones")
@Entity(name = "Transaccion")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Transaccion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String descripccion;
    private Double monto;
    private String categoria;
    private Date fecha;
}
