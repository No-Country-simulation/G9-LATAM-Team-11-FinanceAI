package G9_LATAM_Team_11_FinanceAI.domain.usuario;

import G9_LATAM_Team_11_FinanceAI.DTO.UsuarioDTOs.IngresarUsuarioDTO;
import G9_LATAM_Team_11_FinanceAI.analisis_financiero.AnalisisFinanciero;
import G9_LATAM_Team_11_FinanceAI.domain.transaccion.Transaccion;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;


@Table(name="usuarios")
@Entity(name = "Usuario")
@Getter
@Setter
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


    @OneToMany(mappedBy = "usuario")
    private List<AnalisisFinanciero> analisisFinancieros;

    //constructor para los datos del DTO con contraseña ya cifrada
    public Usuario(IngresarUsuarioDTO datos, String encodedPassword) {
        this.nombre = datos.nombre();
        this.email = datos.email();
        this.password = encodedPassword != null ? encodedPassword : datos.password();
        this.ingresoMensual = datos.ingresoMensual();
        this.fechaCreacion = LocalDate.now();
        this.activo = true;
    }

    public Usuario(IngresarUsuarioDTO datos) {
        this(datos, datos.password());
    }

    public void eliminarUsuario(){
        this.activo = false;
    }

}
