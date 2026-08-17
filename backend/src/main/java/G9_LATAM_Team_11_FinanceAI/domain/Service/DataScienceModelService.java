package G9_LATAM_Team_11_FinanceAI.domain.Service;

import G9_LATAM_Team_11_FinanceAI.DTO.CategoriaDTOs.SolicitudCategoriaDTO;
import ai.onnxruntime.OnnxTensor;
import ai.onnxruntime.OnnxValue;
import ai.onnxruntime.OrtEnvironment;
import ai.onnxruntime.OrtSession;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.math.BigDecimal;
import java.nio.file.Paths;
import java.text.Normalizer;
import java.util.*;

@Service
public class DataScienceModelService {

    @Value("${app.shared-models.path:./shared-models}")
    private String sharedModelsPath;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Set<String> categoriasValidas = new HashSet<>();
    private final Set<String> perfilesValidos = new HashSet<>();
    private final Map<String, String> mapeoCategorias = new HashMap<>();

    private OrtEnvironment env;
    private OrtSession sessionTransacciones;
    private OrtSession sessionPerfil;

    @PostConstruct
    public void inicializarModelos() {
        try {
            this.env = OrtEnvironment.getEnvironment();
            File dirModelos = new File(sharedModelsPath);

            // 1. Cargar metadata.json
            File archivoMetadata = Paths.get(sharedModelsPath, "metadata.json").toFile();
            if (archivoMetadata.exists()) {
                JsonNode root = objectMapper.readTree(archivoMetadata);

                JsonNode catNode = root.has("categories") ? root.get("categories") : root.get("categorias");
                if (catNode != null && catNode.isArray()) {
                    for (JsonNode cat : catNode) {
                        categoriasValidas.add(cat.asText().toLowerCase());
                    }
                }

                JsonNode profNode = root.has("profiles") ? root.get("profiles") : root.get("perfiles");
                if (profNode != null && profNode.isArray()) {
                    for (JsonNode prof : profNode) {
                        perfilesValidos.add(prof.asText().toLowerCase());
                    }
                }

                if (root.has("mapping")) {
                    root.get("mapping").fields().forEachRemaining(entry ->
                            mapeoCategorias.put(entry.getKey(), entry.getValue().asText())
                    );
                }
            }

            // 2. Cargar sesión de modelo de transacciones
            File archivoTransacciones = Paths.get(sharedModelsPath, "modelo_transacciones.onnx").toFile();
            if (archivoTransacciones.exists()) {
                this.sessionTransacciones = env.createSession(archivoTransacciones.getAbsolutePath(), new OrtSession.SessionOptions());
            }

            // 3. Cargar sesión de modelo de perfil
            File archivoPerfil = Paths.get(sharedModelsPath, "modelo_perfil.onnx").toFile();
            if (archivoPerfil.exists()) {
                this.sessionPerfil = env.createSession(archivoPerfil.getAbsolutePath(), new OrtSession.SessionOptions());
            }

        } catch (Exception e) {
            System.err.println("Advertencia al inicializar modelos ONNX: " + e.getMessage());
        }
    }

    @PreDestroy
    public void cerrarRecursos() {
        try {
            if (sessionTransacciones != null) {
                sessionTransacciones.close();
            }
            if (sessionPerfil != null) {
                sessionPerfil.close();
            }
            if (env != null) {
                env.close();
            }
        } catch (Exception e) {
            System.err.println("Error al cerrar recursos ONNX: " + e.getMessage());
        }
    }

    public String normalizarTexto(String texto) {
        if (texto == null) return "";
        String normalizado = Normalizer.normalize(texto, Normalizer.Form.NFD);
        return normalizado.replaceAll("\\p{M}", "").trim().toLowerCase();
    }

    public String obtenerCategoria(SolicitudCategoriaDTO solicitud) {
        if (sessionTransacciones == null || env == null) {
            return "General";
        }

        try {
            String descripcion = solicitud.descripcion() != null ? normalizarTexto(solicitud.descripcion()) : "";
            String[][] inputData = new String[][] { { descripcion } };

            try (OnnxTensor inputTensor = OnnxTensor.createTensor(env, inputData)) {
                Map<String, OnnxTensor> inputFeatures = Map.of("string_input", inputTensor);

                try (OrtSession.Result results = sessionTransacciones.run(inputFeatures)) {
                    OnnxValue outputValue = results.get("output_label").orElse(results.get(0));
                    String categoriaObtenida = "General";

                    if (outputValue instanceof OnnxTensor tensor) {
                        Object value = tensor.getValue();
                        if (value instanceof String[] labelArray && labelArray.length > 0) {
                            categoriaObtenida = labelArray[0];
                        } else if (value instanceof String[][] labelMatrix && labelMatrix.length > 0 && labelMatrix[0].length > 0) {
                            categoriaObtenida = labelMatrix[0][0];
                        }
                    }

                    if (mapeoCategorias.containsKey(categoriaObtenida)) {
                        categoriaObtenida = mapeoCategorias.get(categoriaObtenida);
                    }

                    if (!categoriasValidas.isEmpty() && !categoriasValidas.contains(categoriaObtenida.toLowerCase())) {
                        return "Otro";
                    }

                    return categoriaObtenida;
                }
            }
        } catch (Exception e) {
            System.err.println("Error durante la inferencia de categoría: " + e.getMessage());
            return "General";
        }
    }

    public String obtenerPerfilFinanciero(BigDecimal ingresoMensual, Double nivelEndeudamiento, String frecuenciaAhorro) {
        if (sessionPerfil == null || env == null) {
            // Heurística de fallback si el modelo ONNX no está cargado
            return calcularPerfilHeuristico(nivelEndeudamiento, frecuenciaAhorro);
        }

        try {
            float ingreso = ingresoMensual != null ? ingresoMensual.floatValue() : 2500.0f;
            float endeudamiento = nivelEndeudamiento != null ? nivelEndeudamiento.floatValue() : 40.0f;
            float ahorroNum = mapearFrecuenciaAhorro(frecuenciaAhorro);

            float[][] inputData = new float[][] { { ingreso, endeudamiento, ahorroNum } };

            try (OnnxTensor inputTensor = OnnxTensor.createTensor(env, inputData)) {
                Map<String, OnnxTensor> inputFeatures = Map.of("float_input", inputTensor);

                try (OrtSession.Result results = sessionPerfil.run(inputFeatures)) {
                    OnnxValue outputValue = results.get("output_label").orElse(results.get(0));
                    String perfilObtenido = "Saludable";

                    if (outputValue instanceof OnnxTensor tensor) {
                        Object value = tensor.getValue();
                        if (value instanceof String[] labelArray && labelArray.length > 0) {
                            perfilObtenido = labelArray[0];
                        } else if (value instanceof String[][] labelMatrix && labelMatrix.length > 0 && labelMatrix[0].length > 0) {
                            perfilObtenido = labelMatrix[0][0];
                        }
                    }

                    return perfilObtenido;
                }
            }
        } catch (Exception e) {
            System.err.println("Error durante la inferencia de perfil: " + e.getMessage());
            return calcularPerfilHeuristico(nivelEndeudamiento, frecuenciaAhorro);
        }
    }

    private float mapearFrecuenciaAhorro(String frecuencia) {
        if (frecuencia == null) return 1.0f;
        return switch (frecuencia.trim().toLowerCase()) {
            case "alta" -> 3.0f;
            case "media" -> 2.0f;
            case "baja" -> 1.0f;
            default -> 0.0f; // "ninguna" u otro
        };
    }

    private String calcularPerfilHeuristico(Double endeudamiento, String frecuenciaAhorro) {
        double end = endeudamiento != null ? endeudamiento : 50.0;
        String freq = frecuenciaAhorro != null ? frecuenciaAhorro.trim().toLowerCase() : "media";

        if (end < 35.0 && (freq.equals("alta") || freq.equals("media"))) {
            return "Saludable";
        }
        if (end > 70.0 || freq.equals("ninguna")) {
            return "En riesgo";
        }
        return "En observacion";
    }
}
