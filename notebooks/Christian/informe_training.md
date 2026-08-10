
# Entrenamiento y Exportación de Modelos

Fase final del ciclo de vida de data science del MVP. 
Entrenamiento de los algoritmos predictivos utilizando el motor de datos generados en el **Notebook 1**, y empaquetamiento del "cerebro" matemático para que el equipo de backend pueda consumirlo.

## Modelos Desarrollados

Se entrenaron dos sistemas de clasificación: perfilado financiero y modelo de categorización de transacciones (NLP)


## MLOps y Validación

Para garantizar la integridad de los modelos, este cuaderno sigue y mantiene los splits de separación generados en el Notebook 1:
*   Para el modelo de perfiles, respeta la separación poblacional (transversal).
*   Para el modelo NLP, respeta la separación temporal.
Se utilizan **Matrices de Confusión** para validar la puntería del modelo asegurando de que no arrastraran errores graves de clasificación hacia el entorno de producción.


## Exportación e Interoperabilidad (ONNX)

En lugar de utilizar formatos exclusivos de Python (como `.pkl`), los algoritmos se exportan bajo el estándar de código abierto **ONNX (Open Neural Network Exchange)**. 

*   **¿Qué genera?** Expulsa los archivos `modelo_perfil.onnx`, `modelo_transacciones.onnx` y un diccionario de traducción `metadata.json` hacia la carpeta `/shared-models/`.
*   ONNX empaqueta toda la matemática compleja (incluyendo el vectorizador de palabras) en un formato universal. para que el equipo de backend lea el archivo e infiera predicciones de manera nativa y ultra rápida utilizando **Java (Spring Boot)**, rompiendo la barrera de lenguajes entre Data Science e Ingeniería de Software.
