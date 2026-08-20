package G9_LATAM_Team_11_FinanceAI.domain.Service;

import ai.onnxruntime.OnnxTensor;
import ai.onnxruntime.OrtEnvironment;
import ai.onnxruntime.OrtException;
import ai.onnxruntime.OrtSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

import java.io.File;
import java.nio.FloatBuffer;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

@Service
public class OnnxInferenceService {

    @Value("${app.shared-models.path:./shared-models}")
    private String sharedModelsPath;

    private OrtEnvironment env;
    private OrtSession session;

    @PostConstruct
    public void init() throws Exception {
        try {
            this.env = OrtEnvironment.getEnvironment();

            File modelFile = Paths.get(sharedModelsPath, "modelo_perfil.onnx").toFile();

            if (!modelFile.exists()) {
                modelFile = new File("shared-models/modelo_perfil.onnx");
            }
            if (!modelFile.exists()) {
                modelFile = new File("../shared-models/modelo_perfil.onnx");
            }

            if (!modelFile.exists()) {
                System.err.println("Advertencia [OnnxInferenceService]: No se encontró modelo_perfil.onnx en: " + modelFile.getAbsolutePath());
                return;
            }

            byte[] modelBytes = Files.readAllBytes(modelFile.toPath());
            this.session = env.createSession(modelBytes, new OrtSession.SessionOptions());

            System.out.println("Modelo ONNX cargado correctamente desde: " + modelFile.getAbsolutePath());

        } catch (Exception e) {
            System.err.println("Advertencia al inicializar OnnxInferenceService: " + e.getMessage());
        }
    }

    public PredictResult predecirPerfil(float[] features) throws OrtException {
        long[] shape = new long[]{1, features.length};
        OnnxTensor inputTensor = OnnxTensor.createTensor(env, FloatBuffer.wrap(features), shape);

        Map<String, OnnxTensor> inputs = Map.of("float_input", inputTensor);

        try (OrtSession.Result results = session.run(inputs)) {

            String[] labelArray = (String[]) results.get("output_label").get().getValue();
            String label = labelArray[0];

            @SuppressWarnings("unchecked")
            List<Map<String, Float>> probList = (List<Map<String, Float>>) results.get("output_probability").get().getValue();
            Map<String, Float> probMap = probList.get(0);

            double probabilidad = probMap.getOrDefault(label, 0.0f).doubleValue();

            return new PredictResult(label, probabilidad);
        } finally {
            inputTensor.close();
        }
    }

    @PreDestroy
    public void close() throws OrtException {
        if (session != null) session.close();
        if (env != null) env.close();
    }

    public record PredictResult(String perfil, double probabilidad) {}
}
