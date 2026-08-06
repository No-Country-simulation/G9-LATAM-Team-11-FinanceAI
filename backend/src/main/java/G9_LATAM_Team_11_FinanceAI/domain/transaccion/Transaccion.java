package G9_LATAM_Team_11_FinanceAI.domain.transaccion;

import G9_LATAM_Team_11_FinanceAI.DTO.TransaccionDTOs.IngresarTransaccionDTO;
import G9_LATAM_Team_11_FinanceAI.domain.usuario.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Table(name = "transacciones")
@Entity(name = "Transaccion")
@Getter
@Setter
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


    public Transaccion(IngresarTransaccionDTO datos, Usuario usuario) {
        this.descripcion = datos.descripcion();
        this.monto = datos.monto();
        this.categoria = datos.categoria(); //traer categoria de DS
        this.fecha = datos.fecha();

        this.usuario = usuario;

    }
}
