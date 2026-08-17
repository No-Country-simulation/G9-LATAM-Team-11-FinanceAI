# 📊 Guía de Trabajo y Desarrollo - Área Data Science

Bienvenido al entorno de desarrollo de Data Science para **FinanceAI**. Este espacio está diseñado para que el equipo de ciencia de datos colabore en limpio, aplicando buenas prácticas de ciberseguridad y MLOps.

---

## 🛠️ 1. Gestión del Entorno y Dependencias

A diferencia de configuraciones previas, **no debes instalar dependencias manualmente mediante `pip` ni dentro del notebook (`%pip install`)**. 

El entorno está dockerizado de forma segura y estática:
1.  Todas las dependencias necesarias (`pandas`, `numpy`, `scikit-learn`, `skl2onnx`, `onnxruntime`, etc.) ya se encuentran pre-instaladas en el contenedor durante la fase de construcción de Docker.
2.  Si necesitas agregar una nueva librería de Python al proyecto:
    *   Agrégala al archivo `requirements.txt` de esta carpeta.
    *   Ejecuta en tu terminal física: `docker compose build data-science` para reconstruir la imagen de forma limpia.

---

## 🔄 2. Flujo de Trabajo Recomendado (Paso a Paso)

Para encarar el desarrollo del MVP de forma metódica, conviene seguir este flujo secuencial:

```text
1. Simular Datos ➔ 2. Exploración (EDA) ➔ 3. Modelado ➔ 4. Exportar ONNX
 (simulation.ipynb)      (eda.ipynb)         (training.ipynb)    (shared-models/)
```

### Paso A: Simulación de Datos (`simulation.ipynb`)
Antes de explorar y entrenar, necesitan la materia prima.
- Escriban la lógica matemática para simular a los 1000 usuarios y sus 5000 transacciones (sueldos y egresos) en este notebook dedicado.
- Generen los archivos JSON y CSV correspondientes y guárdenlos en la carpeta `data/` (`usuarios.json`/`usuarios.csv` y `transacciones.json`/`transacciones.csv`).

### Paso B: Análisis Exploratorio (`eda.ipynb`)
- Abran el notebook de exploración y carguen los datasets desde `data/`.
- Realicen análisis de correlación (ej. Heatmap de ingresos vs endeudamiento) y visualicen la distribución de categorías para asegurar que la simulación es realista.

### Paso C: Modelado y Entrenamiento (`training.ipynb`)
- **Clasificador NLP:** Entrenen el pipeline de Scikit-Learn utilizando `TfidfVectorizer` y un clasificador para predecir la categoría a partir del texto de la transacción.
- **Evaluación de Perfil:** Entrenen un modelo para clasificar la salud financiera en base a los indicadores del usuario.
- Analicen la precisión de ambos modelos con matrices de confusión y reportes de métricas.

### Paso D: Exportación a Producción
- Conviertan los pipelines entrenados a formato binario `.onnx` usando la librería `skl2onnx`.
- Exporten los archivos `.onnx` a la ruta interna `/home/jovyan/work/models/`. Docker se encargará de reflejarlos en la carpeta raíz `shared-models/` para que el desarrollador Backend de Java los consuma directamente.

---

## 🔍 3. Decisiones de Diseño para Defender ante el Jurado

Si los evaluadores les preguntan por las decisiones de arquitectura del área de datos, pueden argumentar estos tres puntos profesionales:

1.  **Formato ONNX Abierto:** En lugar de forzar al Backend a levantar un servidor Python para ejecutar los modelos (lo cual consume muchos recursos), exportamos a ONNX. Esto permite que el Backend (Java) ejecute la inteligencia artificial de forma nativa a velocidad C++, sin dependencias externas en producción.
2.  **No uso de Stop Words en Español (`stop_words=None`):**
    *   **¿Qué es una Stop Word?** Son palabras de uso frecuente en un idioma (como *"de"*, *"la"*, *"y"*, *"el"*) que sirven para estructurar oraciones pero no aportan significado semántico al clasificador de textos. En Procesamiento de Lenguaje Natural (NLP), es común quitarlas para que el algoritmo solo analice palabras clave.
    *   **¿Por qué configuramos `None`?** La herramienta `TfidfVectorizer` de Scikit-Learn solo tiene una lista de stop words en inglés por defecto (`stop_words='english'`). Si se le escribe `'spanish'`, el programa fallará porque no tiene el diccionario en español cargado nativamente.
    *   **Justificación Técnica:** Como las descripciones de nuestras transacciones simuladas son extremadamente cortas (conceptos de 1 a 2 palabras como *"Supermercado"*, *"Cine"*, *"Luz"*), no contienen artículos ni conectores en español. Establecer `stop_words=None` (no eliminar palabras vacías) resuelve el fallo de Scikit-Learn de forma nativa, elimina la necesidad de descargar diccionarios externos complejos (como NLTK o Spacy) en producción y no afecta el rendimiento del clasificador.
3.  **Seguridad de Contenedores:** Reemplazamos la instalación de dependencias en caliente por una construcción inmutable en Dockerfile, lo que bloquea ataques a la cadena de suministro en el entorno de desarrollo.
