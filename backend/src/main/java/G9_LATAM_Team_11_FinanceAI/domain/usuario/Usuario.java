package G9_LATAM_Team_11_FinanceAI.domain.usuario;

import G9_LATAM_Team_11_FinanceAI.domain.transaccion.Transaccion;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;


@Table(name="usuarios")
@Entity(name = "Usuario")
@Getter
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String nombre;
    private String email;
    private String password;
    private double ingreso_mensual;
    private LocalDateTime fecha_creacion;
    private boolean activo;

    @OneToMany(mappedBy = "usuario")
    private List<Transaccion> transacciones;

}
