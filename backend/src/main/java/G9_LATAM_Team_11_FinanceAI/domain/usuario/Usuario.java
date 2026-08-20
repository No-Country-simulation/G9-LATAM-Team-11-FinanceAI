package G9_LATAM_Team_11_FinanceAI.domain.usuario;

import G9_LATAM_Team_11_FinanceAI.DTO.UsuarioDTOs.IngresarUsuarioDTO;
import G9_LATAM_Team_11_FinanceAI.domain.analisis_financiero.AnalisisFinanciero;
import G9_LATAM_Team_11_FinanceAI.domain.transaccion.Transaccion;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;


@Table(name="usuarios")
@Entity(name = "Usuario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Usuario implements UserDetails {
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
    @JsonIgnore //evita bucle infinito en listar analisis financiero
    private List<Transaccion> transacciones;


    @OneToMany(mappedBy = "usuario")
    @JsonIgnore
    private List<AnalisisFinanciero> analisisFinancieros;

    //constructor para los datos del DTO
    public Usuario(IngresarUsuarioDTO datos, String passwordEncriptada) {
        this.nombre = datos.nombre();
        this.email = datos.email();
        this.password = passwordEncriptada;
        this.ingresoMensual = datos.ingresoMensual();
        this.fechaCreacion = LocalDate.now();
        this.activo = true;

    }

    public void eliminarUsuario(){
        this.activo = false;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // La cuenta no ha expirado
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // La cuenta no está bloqueada
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // La contraseña no ha expirado
    }

    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(this.activo); // Conectado a tu campo 'activo'
    }
}
