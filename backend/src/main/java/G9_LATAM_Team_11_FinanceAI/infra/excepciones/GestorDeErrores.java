package G9_LATAM_Team_11_FinanceAI.infra.excepciones;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;

@ControllerAdvice
public class GestorDeErrores {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity gestionarError404(EntityNotFoundException ex){

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of(
                        "error", "Resource not found",
                        "message", ex.getMessage(),
                        "timestamp", java.time.LocalDateTime.now()
                )
        );

    }

}
