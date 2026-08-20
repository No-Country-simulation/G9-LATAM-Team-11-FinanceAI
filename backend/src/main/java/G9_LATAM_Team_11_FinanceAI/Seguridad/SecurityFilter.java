package G9_LATAM_Team_11_FinanceAI.Seguridad;

import G9_LATAM_Team_11_FinanceAI.domain.Service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Autowired
    private TokenService tokenService;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String autenticacion = request.getHeader("Authorization");

        if (autenticacion != null && autenticacion.startsWith("Bearer ")) {
            String token = autenticacion.replace("Bearer ", "").trim();

            try {
                if (tokenService.esTokenValido(token)) {
                    String email = tokenService.getSubject(token);
                    if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                        var autorizacion = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities()
                        );

                        SecurityContextHolder.getContext().setAuthentication(autorizacion);
                    }
                }
            } catch (Exception e) {
                // Token inválido o usuario no encontrado: se ignora para que Spring Security maneje la falta de auth
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}
