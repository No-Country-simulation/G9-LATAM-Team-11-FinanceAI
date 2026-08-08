package G9_LATAM_Team_11_FinanceAI.Controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("login")
@CrossOrigin(origins = {"http://localhost:8082", "http://localhost:3000"})

public class LoginController {
}
