package G9_LATAM_Team_11_FinanceAI.domain.transaccion;

import G9_LATAM_Team_11_FinanceAI.DTO.IngresarTransaccionDTO;
import G9_LATAM_Team_11_FinanceAI.Repository.IUsuarioRepository;
import G9_LATAM_Team_11_FinanceAI.domain.usuario.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.time.LocalDate;
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
    private String descripcion;
    private BigDecimal monto;
    private String categoria;
    private LocalDate fecha;

    @ManyToOne
    private Usuario usuario;
    // Esto deberia ir en un service lo puse aqui de manera temporal




    public Transaccion(IngresarTransaccionDTO datos, Usuario usuario) {
        this.descripcion = datos.descripcion();
        this.monto = datos.monto();
        this.categoria = datos.categoria(); //traer categoria de DS
        this.fecha = datos.fecha();

        this.usuario = usuario;

    }
}
