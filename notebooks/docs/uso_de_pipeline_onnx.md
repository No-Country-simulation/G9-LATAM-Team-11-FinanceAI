### Aclaración previa
Se implementa para encapsular el preprocesamiento de texto y el algoritmo de clasificación en un solo objeto.

---

### 1. ¿CÓMO fue implementado?
El pipeline se definió secuencialmente conectando la transformación de texto libre con el clasificador mediante tuplas identificadoras `(nombre_paso, estimador)`:

1. **Paso 1 (`'tfidf'`):** `TfidfVectorizer(stop_words=spanish_stop_words)` para convertir las frases crudas de las transacciones en una matriz numérica de frecuencias relativas.
2. **Paso 2 (`'clf'`):** `LogisticRegression(random_state=42)` como el motor matemático de clasificación.

Además, el `Pipeline` se integró como el estimador principal dentro de `GridSearchCV`, utilizando la sintaxis de doble guion bajo (`paso__parametro`, ej. `tfidf__max_features` y `clf__C`) para ajustar simultáneamente los hiperparámetros del preprocesador y del clasificador en una sola búsqueda.

---

### 2. ¿POR QUÉ se decidió usar `Pipeline`? (Justificación de MLOps)

* **Garantía anti-fuga de datos (*Anti-Data Leakage*):** Sin un `Pipeline`, es común cometer el error de aplicar `fit_transform` sobre todo el dataset antes de dividir los datos, o aplicar un `fit` del vectorizador fuera del bucle de validación cruzada. El `Pipeline` garantiza de forma estricta que el vocabulario y las frecuencias de TF-IDF se calculen únicamente durante el `fit` sobre el conjunto de entrenamiento (`train_t`), aplicando solo `transform` transparente en validación y prueba.
* **Consistencia del ciclo de vida:** Evita desincronizaciones entre la fase de entrenamiento y la fase de evaluación. Cualquier transformación aplicada a los datos de entrada se replica exactamente con la misma configuración en las predicciones futuras.
* **Eliminación del uso inadecuado de `LabelEncoder`:** Permite que el pipeline maneje las clases de texto de forma nativa (`nlp_pipeline.classes_`), evitando traducir manualmente las etiquetas a números.

---

### 3. ¿PARA QUÉ se usó? (impacto y beneficios de integración)

* **Exportación unificada a formato ONNX:** Permite empaquetar todo el flujo de trabajo (transformador + clasificador) en un único archivo binario `.onnx` mediante la librería `skl2onnx`.
* **Simplificación y desacoplamiento en el Backend:** Gracias al `Pipeline` exportado en ONNX, el backend en Java (Spring Boot) no necesita implementar librerías complejas de NLP ni mantener archivos JSON secundarios de traducción. La API REST envía la cadena de texto crudo (ej. `"Compra Supermercado"`) directamente al modelo ONNX, y este retorna de forma autónoma la categoría en formato texto (ej. `"Alimentacion"`).

