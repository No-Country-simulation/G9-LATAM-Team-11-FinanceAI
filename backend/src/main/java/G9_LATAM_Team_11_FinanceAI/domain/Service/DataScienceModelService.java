package G9_LATAM_Team_11_FinanceAI.domain.Service;

import G9_LATAM_Team_11_FinanceAI.DTO.CategoriaDTO.SolicitudCategoriaDTO;
import G9_LATAM_Team_11_FinanceAI.domain.Models.FrecuenciaAhorro;
import ai.onnxruntime.OnnxTensor;
import ai.onnxruntime.OnnxValue;
import ai.onnxruntime.OrtEnvironment;
import ai.onnxruntime.OrtSession;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.math.BigDecimal;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Service
public class DataScienceModelService {
    //conexion entre Spring y DS con ONNX

    @Value("${app.shared-models.path}")
    private String sharedModelsPath;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Set<String> categoriasValidas = new HashSet<>();
    private final Map<String, String> mapeoCategorias = new HashMap<>();

    // Se ejecuta al arrancar Spring Boot para cargar el diccionario de metadata.json
    @PostConstruct
    public void cargarMetadata() {
        try {
            File archivoMetadata = Paths.get(sharedModelsPath, "metadata.json").toFile();
            if (archivoMetadata.exists()) {
                JsonNode root = objectMapper.readTree(archivoMetadata);

                // Opción A: Si metadata.json contiene una lista de categorías válidas
                if (root.has("categorias")) {
                    for (JsonNode cat : root.get("categorias")) {
                        categoriasValidas.add(cat.asText().toLowerCase());
                    }
                }

                // Opción B: Si metadata.json contiene un mapa de traducciones/indices (ej: "0": "Supermercado")
                if (root.has("mapping")) {
                    root.get("mapping").fields().forEachRemaining(entry ->
                            mapeoCategorias.put(entry.getKey(), entry.getValue().asText())
                    );
                }
            }
        } catch (Exception e) {
            System.err.println("Error al cargar metadata.json: " + e.getMessage());
        }
    }

    public String obtenerCategoria(SolicitudCategoriaDTO solicitud) {
        String rutaModelo = Paths.get(sharedModelsPath, "modelo_transacciones.onnx").toString();

        try (OrtEnvironment env = OrtEnvironment.getEnvironment();
             OrtSession session = env.createSession(rutaModelo, new OrtSession.SessionOptions())) {

            String descripcion = solicitud.descripcion() != null ? solicitud.descripcion() : "";
            String[][] inputData = new String[][] { { descripcion } };

            try (OnnxTensor inputTensor = OnnxTensor.createTensor(env, inputData)) {

                Map<String, OnnxTensor> inputFeatures = Map.of("string_input", inputTensor);

                try (OrtSession.Result results = session.run(inputFeatures)) {

                    OnnxValue outputValue = results.get("output_label").orElse(results.get(0));
                    String categoriaObtenida = "General";

                    if (outputValue instanceof OnnxTensor tensor) {
                        Object value = tensor.getValue();

                        // manejo si la salida es un array de Strings
                        if (value instanceof String[] labelArray && labelArray.length > 0) {
                            categoriaObtenida = labelArray[0];
                        }
                        // manejo si la salida es un array bidimensional de Strings (común en pipelines de scikit-learn/onnx)
                        else if (value instanceof String[][] labelMatrix && labelMatrix.length > 0 && labelMatrix[0].length > 0) {
                            categoriaObtenida = labelMatrix[0][0];
                        }
                    }

                    // --- MEJORA CON METADATA ---

                    // si el modelo devolvió un id/código, lo traducimos usando el mapa de metadata
                    if (mapeoCategorias.containsKey(categoriaObtenida)) {
                        categoriaObtenida = mapeoCategorias.get(categoriaObtenida);
                    }
                    // validamos si la categoría obtenida es reconocida en metadata.json
                    if (!categoriasValidas.isEmpty() && !categoriasValidas.contains(categoriaObtenida.toLowerCase())) {
                        return "otro"; // si la predicción no existe en las categorías permitidas
                    }
                    return categoriaObtenida;
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
            return "sin archivo";
        }
    }

    //convierte el enum de frecuencia de ahorro en numerico con coma
    public float convertirFrecuenciaANumerico(FrecuenciaAhorro frecuencia) {
        if (frecuencia == null) return 0.0f;

        return switch (frecuencia) {
            case ALTA -> 3.0f;
            case MEDIA -> 2.0f;
            case BAJA -> 1.0f;
            case NINGUNA -> 0.0f;
        };
    }

    //predice el perfil financiero
    public String predecirPerfilFinanciero(BigDecimal ingresoMensual, BigDecimal porcentajeEndeudamiento, FrecuenciaAhorro frecuencia) {
        File archivoModelo = Paths.get(sharedModelsPath, "modelo_perfil.onnx").toFile();

        if (!archivoModelo.exists()) {
            System.err.println("Error: No se encontró el archivo ONNX en: " + archivoModelo.getAbsolutePath());
            return "En observacion"; // Fallback consitente con tu modelo
        }

        // convertimos los valores a flotante
        float ingreso = ingresoMensual != null ? ingresoMensual.floatValue() : 0.0f;
        float endeudamiento = porcentajeEndeudamiento != null ? porcentajeEndeudamiento.floatValue() : 0.0f;
        float ahorroNum = convertirFrecuenciaANumerico(frecuencia);

        float[][] inputData = new float[][] { { ingreso, endeudamiento, ahorroNum } };

        try (OrtEnvironment env = OrtEnvironment.getEnvironment();
             OrtSession session = env.createSession(archivoModelo.getAbsolutePath(), new OrtSession.SessionOptions())) {

            try (OnnxTensor inputTensor = OnnxTensor.createTensor(env, inputData)) {

                Map<String, OnnxTensor> container = Map.of("float_input", inputTensor);

                try (OrtSession.Result results = session.run(container)) {

                    var outputOptional = results.get("output_label");

                    if (outputOptional.isPresent() && outputOptional.get() instanceof OnnxTensor tensor) {
                        Object value = tensor.getValue();

                        // si el modelo retorna string
                        if (value instanceof String[] labelArray && labelArray.length > 0) {
                            return labelArray[0];
                        }
                        // si el modelo retorna un índice o número
                        else if (value instanceof long[] longArray && longArray.length > 0) {
                            return String.valueOf(longArray[0]);
                        }
                    }
                    return "En observacion"; // por defecto si no se pudo mapear el output
                }
            }

        } catch (Exception e) {
            System.err.println("Error al ejecutar modelo_perfil.onnx: " + e.getMessage());
            e.printStackTrace();
            return "En observacion";
        }
    }

}
