package G9_LATAM_Team_11_FinanceAI;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;


@SpringBootApplication
@EnableScheduling //habilito las tareas automáticas. "Tarea Programada (@Scheduled)."
public class Application{

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}
}
