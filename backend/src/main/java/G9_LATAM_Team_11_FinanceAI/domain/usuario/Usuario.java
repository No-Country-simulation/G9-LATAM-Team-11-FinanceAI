package G9_LATAM_Team_11_FinanceAI.domain.usuario;

import G9_LATAM_Team_11_FinanceAI.DTO.IngresarUsuarioDTO;
import G9_LATAM_Team_11_FinanceAI.domain.transaccion.Transaccion;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;


@Table(name="usuarios")
@Entity(name = "Usuario")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private String email;
    private String password;
    private BigDecimal ingresoMensual;
    private LocalDate fechaCreacion;
    private Boolean activo;

    @OneToMany(mappedBy = "usuario")
    private List<Transaccion> transacciones;

    //constructor para los datos del DTO
    public Usuario(IngresarUsuarioDTO datos) {
        this.nombre = datos.nombre();
        this.email = datos.email();
        this.password = datos.password();
        this.ingresoMensual = datos.ingresoMensual();
        this.fechaCreacion = LocalDate.now();
        this.activo = true;

    }

    public Usuario(Long id) {
        this.id = id;
    }

}
