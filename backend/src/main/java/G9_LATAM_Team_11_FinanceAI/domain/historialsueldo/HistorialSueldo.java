package G9_LATAM_Team_11_FinanceAI.domain.historialsueldo;


import G9_LATAM_Team_11_FinanceAI.domain.usuario.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "historial_sueldo")
public class HistorialSueldo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    private BigDecimal sueldoAnterior;
    private BigDecimal sueldoNuevo;
    private LocalDateTime fechaModificacion;


    public HistorialSueldo(Usuario usuario, BigDecimal sueldoAnterior, BigDecimal sueldoNuevo) {
        this.usuario = usuario;
        this.sueldoAnterior = sueldoAnterior;
        this.sueldoNuevo = sueldoNuevo;
        this.fechaModificacion = LocalDateTime.now();
    }
}