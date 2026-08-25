package G9_LATAM_Team_11_FinanceAI.domain.Service;

import G9_LATAM_Team_11_FinanceAI.DTO.ResumenMensualDTO.RespuestaResumenMensualDTO;
import G9_LATAM_Team_11_FinanceAI.Repository.IResumenMensualRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResumenMensualService {

    private final IResumenMensualRepository resumenMensualRepository;
    private final UsuarioValidacionService usuarioValidacionService;

    @Transactional(readOnly = true)
    public List<RespuestaResumenMensualDTO> obtenerResumenesPorUsuario(Long idUsuario) {
        usuarioValidacionService.validarExistencia(idUsuario);

        return resumenMensualRepository.findByUsuarioId(idUsuario)
                .stream()
                .map(RespuestaResumenMensualDTO::new)
                .toList();
    }
}