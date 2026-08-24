package G9_LATAM_Team_11_FinanceAI.Controller;

import G9_LATAM_Team_11_FinanceAI.DTO.HistorialSueldoDTO.ActualizarSueldoDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.HistorialSueldoDTO.HistorialSueldoDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.ResumenMensualDTO.RespuestaResumenMensualDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.UsuarioDTO.IngresarUsuarioDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.UsuarioDTO.ListadoUsuarioDTO;
import G9_LATAM_Team_11_FinanceAI.DTO.UsuarioDTO.RespuestaUsuarioDTO;
import G9_LATAM_Team_11_FinanceAI.domain.Service.ResumenMensualService;
import G9_LATAM_Team_11_FinanceAI.domain.Service.UsuarioService;
import G9_LATAM_Team_11_FinanceAI.domain.usuario.Usuario;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/usuario")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final ResumenMensualService resumenMensualService;

    @PostMapping
    public ResponseEntity ingresarUsuario(@RequestBody IngresarUsuarioDTO datos) {
        var u = usuarioService.ingresarUsuario(datos);
        var mje= "Usuario "+ datos.nombre() +" registrado con éxito";
        return ResponseEntity.status(HttpStatus.CREATED).body(new RespuestaUsuarioDTO(mje, u.getId()));
    }
    @GetMapping("/{id}")
    public ResponseEntity<ListadoUsuarioDTO> obtenerUsuarioConTransacciones(@PathVariable Long id) {
        Usuario usuario = usuarioService.obtenerUsuarioConTransacciones(id);
        return ResponseEntity.ok(new ListadoUsuarioDTO(usuario));
    }

    //se realiza soft-delete en la base para desactivar cuentas de usuarios.
    @DeleteMapping("/{id}")
    public ResponseEntity eliminarUsuario (@PathVariable Long id){
        usuarioService.eliminarUsuario(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/activos/mesanio")
    public ResponseEntity<List<ListadoUsuarioDTO>> obtenerTodosLosUsuariosConTransacciones(@RequestParam int mes, @RequestParam int anio) {

        List<Usuario> usuarios = usuarioService.obtenerTodosLosUsuariosConTransaccionesPorMesAnio(mes, anio);
        List<ListadoUsuarioDTO> dtoList = usuarios.stream()
                .map(ListadoUsuarioDTO::new)
                .toList();
        return ResponseEntity.ok(dtoList);
    }

    @PutMapping("/{id}/sueldo")
    public ResponseEntity<Map<String, String>> actualizarSueldo(
            @PathVariable Long id,
            @RequestBody @Valid ActualizarSueldoDTO dto) {

        usuarioService.actualizarSueldoUsuario(id, dto.nuevoSueldo());
        return ResponseEntity.ok(Map.of("mensaje", "Sueldo actualizado"));
    }

    @GetMapping("/{id}/historial-sueldo")
    public ResponseEntity<List<HistorialSueldoDTO>> obtenerHistorialSueldo(@PathVariable Long id) {
        List<HistorialSueldoDTO> historial = usuarioService.obtenerHistorialSueldo(id);
        return ResponseEntity.ok(historial);
    }

    @GetMapping("/{id}/resumen-mensual")
    public ResponseEntity<List<RespuestaResumenMensualDTO>> obtenerResumenMensual(@PathVariable Long id) {
        return ResponseEntity.ok(resumenMensualService.obtenerResumenesPorUsuario(id));
    }

}















