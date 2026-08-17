Validación cruzada

## 1. Dónde se implementa en el código

En el notebook 3, durante la búsqueda de hiperparámetros del modelo de categorización de gastos (NLP), se ejecuta la siguiente configuración:


grid_search = GridSearchCV(nlp_pipeline, param_grid, cv=3, n_jobs=-1, verbose=1)

El parámetro **`cv=3`** es el que activa la validación cruzada tipo **K-Fold con $K = 3$**.

---

## 2. Cómo funciona el $K$-Fold ($K=3$) en el proyecto

Cuando le entregas a `GridSearchCV` el conjunto de entrenamiento `train_t` junto con `cv=3`, Scikit-Learn ejecuta el siguiente proceso automático:

1. **División en 3 bloques (*Folds*):** Toma el dataset `train_t` y lo divide internamente en 3 partes iguales. Al ser un problema de clasificación, Scikit-Learn utiliza automáticamente **Stratified K-Fold** (K-Fold Estratificado), asegurando que cada uno de los 3 bloques mantenga la misma proporción de las 10 categorías de gastos.
2. **Evaluación de combinaciones:** Definimos 12 combinaciones de hiperparámetros en el `param_grid`. Para cada combinación, el sistema ejecuta 3 iteraciones:
   * **Iteración 1:** Entrena en los bloques 1 y 2 $\rightarrow$ Evalúa en el bloque 3.
   * **Iteración 2:** Entrena en los bloques 1 y 3 $\rightarrow$ Evalúa en el bloque 2.
   * **Iteración 3:** Entrena en los bloques 2 y 3 $\rightarrow$ Evalúa en el bloque 1.
3. **Selección del ganador:** Realiza un total de **36 entrenamientos en paralelo** ($12 \text{ combinaciones} \times 3 \text{ folds}$) y promedia la métrica de rendimiento de cada combinación para seleccionar la mejor (`best_estimator_`).

---

## 3. Sobre el Notebook 1 y el concepto "Group K-Fold"

* **En el Notebook 1:** Se realiza una partición tipo **Holdout agrupada por usuario** (se asignan aleatoriamente los IDs de usuario en un 60% Train, 20% Val y 20% Test) para simular la separación inicial de los datos.
* **En el Notebook 3:** Se ejecuta la **Validación Cruzada K-Fold algorítmica real** ($K=3$) automatizada por Scikit-Learn dentro de `GridSearchCV`.
