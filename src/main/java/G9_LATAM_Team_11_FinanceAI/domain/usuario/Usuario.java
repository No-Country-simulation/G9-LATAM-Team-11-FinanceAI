package G9_LATAM_Team_11_FinanceAI.domain.usuario;

import G9_LATAM_Team_11_FinanceAI.DTO.IngresarUsuarioDTO;
import jakarta.persistence.*;
import lombok.*;

import java.security.Timestamp;
import java.time.LocalDateTime;
import java.util.Date;


@Table(name="usuarios")
@Entity(name = "Usuario")
@Getter
@Setter
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

    public Usuario(){

    }

    //constructor para los datos del DTO
    public Usuario(IngresarUsuarioDTO datos) {
        this.nombre = datos.nombre();
        this.email = datos.email();
        this.password = datos.password();
        this.ingreso_mensual = datos.ingreso_mensual();
        this.fecha_creacion = LocalDateTime.now();

    }
}
