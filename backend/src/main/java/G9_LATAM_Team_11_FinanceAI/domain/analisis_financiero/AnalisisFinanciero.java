package G9_LATAM_Team_11_FinanceAI.domain.analisis_financiero;

import G9_LATAM_Team_11_FinanceAI.DTO.AnalisisFinancieroDTO.IngresarAnalisisFinancieroDTO;
import G9_LATAM_Team_11_FinanceAI.domain.Models.FrecuenciaAhorro;
import G9_LATAM_Team_11_FinanceAI.domain.usuario.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
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

    private BigDecimal nivelEndeudamiento;

    @Enumerated(EnumType.STRING)
    private FrecuenciaAhorro nivelAhorro;

    @Column(columnDefinition = "TEXT")
    private String recomendaciones;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    public AnalisisFinanciero(IngresarAnalisisFinancieroDTO datos, Usuario usuario) {
        this.fechaAnalisis = datos.fechaAnalisis();
        this.fechaInicio = datos.fechaInicio();
        this.fechaFinal = datos.fechaFinal();
        this.perfilFinanciero = datos.perfilFinanciero();
        this.nivelEndeudamiento = datos.nivelEndeudamiento();
        this.nivelAhorro = datos.nivelAhorro();
        this.recomendaciones = datos.recomendaciones();
        this.usuario = usuario;
    }

    public AnalisisFinanciero(Usuario usuario, LocalDate fechaInicio, LocalDate fechaFinal,
                              String perfilFinanciero, BigDecimal nivelEndeudamiento,
                              FrecuenciaAhorro nivelAhorro, String recomendaciones) {
        this.usuario = usuario;
        this.fechaAnalisis = fechaFinal;
        this.fechaInicio = fechaInicio;
        this.fechaFinal = fechaFinal;
        this.perfilFinanciero = perfilFinanciero;
        this.nivelEndeudamiento = nivelEndeudamiento;
        this.nivelAhorro = nivelAhorro;
        this.recomendaciones = recomendaciones;
    }
}
