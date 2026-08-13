package G9_LATAM_Team_11_FinanceAI.analisis_financiero;

import G9_LATAM_Team_11_FinanceAI.DTO.AnalisisFinancieroDTO.IngresarAnalisisFinancieroDTO;
import G9_LATAM_Team_11_FinanceAI.domain.usuario.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity(name = "AnalisisFinanciero")
@Table(name = "analisis_financiero")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AnalisisFinanciero {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate fechaAnalisis;

    private LocalDate fechaInicio;

    private LocalDate fechaFinal;

    private String perfilFinanciero;

    private Double nivelEndeudamiento;

    private String nivelAhorro;

    private String Recomendaciones;

    @ManyToOne
    private Usuario usuario;

    public AnalisisFinanciero(IngresarAnalisisFinancieroDTO datos, Usuario usuario) {
        this.fechaAnalisis = datos.fechaAnalisis();
        this.fechaInicio = datos.fechaInicio();
        this.fechaFinal = datos.fechaFinal();
        this.perfilFinanciero = datos.perfilFinanciero();
        this.nivelEndeudamiento = datos.nivelEndeudamiento();
        this.nivelAhorro = datos.nivelAhorro();
        this.Recomendaciones = datos.Recomendaciones();
        this.usuario = usuario;
    }
}
