package G9_LATAM_Team_11_FinanceAI.domain.Service;

import G9_LATAM_Team_11_FinanceAI.DTO.CategoriaDTOs.SolicitudCategoriaDTO;
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

            // 1. Armar el array 2D con la descripción cruda que llega de la transacción
            String descripcion = solicitud.descripcion() != null ? solicitud.descripcion() : "";
            String[][] inputData = new String[][] { { descripcion } };

            // 2. Crear el tensor de tipo String para ONNX
            try (OnnxTensor inputTensor = OnnxTensor.createTensor(env, inputData)) {

                // 3. Mapear con el nodo de entrada esperado por el modelo
                Map<String, OnnxTensor> inputFeatures = Map.of("string_input", inputTensor);

                // 4. Ejecutar la inferencia
                try (OrtSession.Result results = session.run(inputFeatures)) {

                    // 5. Extraer la categoría desde el nodo de salida "output_label"
                    OnnxValue outputValue = results.get("output_label").orElse(results.get(0));
                    String categoriaObtenida = "General";

                    if (outputValue instanceof OnnxTensor tensor) {
                        Object value = tensor.getValue();

                        // Manejo si la salida es un array de Strings
                        if (value instanceof String[] labelArray && labelArray.length > 0) {
                            categoriaObtenida = labelArray[0];
                        }
                        // Manejo si la salida es un array bidimensional de Strings (común en pipelines de scikit-learn/onnx)
                        else if (value instanceof String[][] labelMatrix && labelMatrix.length > 0 && labelMatrix[0].length > 0) {
                            categoriaObtenida = labelMatrix[0][0];
                        }
                    }

                    // --- MEJORA CON METADATA ---

                    // 1. Si el modelo devolvió un ID/código, lo traducimos usando el mapa de metadata
                    if (mapeoCategorias.containsKey(categoriaObtenida)) {
                        categoriaObtenida = mapeoCategorias.get(categoriaObtenida);
                    }
                    // 2. Validamos si la categoría obtenida es reconocida en metadata.json
                    if (!categoriasValidas.isEmpty() && !categoriasValidas.contains(categoriaObtenida.toLowerCase())) {
                        return "otro"; // Fallback si la predicción no existe en las categorías permitidas
                    }
                    return categoriaObtenida;
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
            return "sin archivo"; // Fallback en caso de error durante la inferencia
        }
    }
}
