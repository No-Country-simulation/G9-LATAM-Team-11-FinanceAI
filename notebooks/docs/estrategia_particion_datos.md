En los Notebooks 1 y 3 se crean y utilizan **2 conjuntos independientes de divisiones `train / val / test`** (es decir, 2 particiones completas compuestas por 3 subconjuntos cada una). 

---

### En el Notebook 1 (`1_simulation.ipynb`):
Se realizan **2 particiones explícitas**:
1. **Primera partición (`splits_usr`):** Aplica la columna `split` (`train`, `val`, `test`) sobre la tabla de Usuarios (corte aleatorio/transversal del 60%, 20%, 20%).
2. **Segunda partición (`df_transacciones['split']`):** Aplica la columna `split` (`train`, `val`, `test`) sobre la tabla de **Transacciones** (corte temporal por meses: Ene-Ago, Sep-Oct, Nov-Dic).

**¿Por qué se crean dos versiones de archivos al exportar?**

* **Los DataFrames CON la columna `split` (`usuarios.csv`, `transacciones.csv`) son para el trabajo de Data Science (Notebooks 2 y 3):**
  Garantizan la reproducibilidad del experimento. En el Notebook 2 (EDA), permiten aislar los datos con `split == 'train'` para realizar el análisis exploratorio visual de forma segura y sin fuga de datos (*Data Leakage*). En el Notebook 3 (`training`), se leen para reconstruir directamente los subconjuntos de `train`, `val` y `test` con los que se entrenan los modelos, se optimizan los hiperparámetros en `GridSearchCV` y se evalúa el rendimiento final. Es importante destacar que el Notebook 2 es una etapa de informe y análisis que no genera ni modifica archivos para el Notebook 3; ambos leen de manera independiente las semillas creadas en el Notebook 1.

* **Los DataFrames SIN la columna `split` (`usuarios_backend.csv`, `transacciones_backend.csv`, etc.) son para el equipo de Backend (MySQL 8.0):**
  La columna `split` es un concepto puramente experimental de ML que no existe en el modelo de dominio financiero real. Estos archivos representan la información limpia que consumirá el backend en Spring Boot para poblar la base de datos inicial y servir la API REST sin introducir columnas ajenas a la entidad del negocio.

### En el Notebook 3 (`3_training.ipynb`):
Se cargan e independizan esos 2 conjuntos en 6 variables principales:
1. **Para el Modelo 1 (Perfil Financiero de Usuarios):**
   * `train_u`: Datos de entrenamiento de usuarios.
   * `val_u`: Datos de validación para ajuste de hiperparámetros.
   * `test_u`: Datos de prueba final ciega.
2. **Para el Modelo 2 (Categorización NLP de Transacciones):**
   * `train_t`: Datos de entrenamiento de transacciones.
   * `val_t`: Datos de validación para calibración de umbrales.
   * `test_t`: Datos de prueba final ciega.
3. **Validación Cruzada interna:** Adicionalmente, el motor `GridSearchCV` utiliza `cv=3`, dividiendo internamente `train_t` en 3 pliegues (*folds*) para evaluar cada combinación de hiperparámetros sin tocar `val_t` ni `test_t`.

---

## 2. Por qué se utilizan dos particiones distintas

Existen tres razones fundamentales de arquitectura de datos y MLOps:

### A. Diferente unidad de análisis y dos modelos distintos
El sistema FinanceAI no entrena un solo modelo, sino dos:
* **Modelo de Perfil Financiero:** Su unidad de estudio es el **usuario/persona** (evalúa ingresos, nivel de endeudamiento y capacidad de ahorro).
* **Modelo de Categorización NLP:** Su unidad de estudio es el **texto de la transacción** (evalúa descripciones de gastos como "compra en supermercado").

Dado que son dos problemas matemáticos sobre tablas distintas, cada modelo requiere su propio conjunto de `train`, `val` y `test`.

### B. Diferente estrategia contra la Fuga de Datos (*Data Leakage*)
* **En Usuarios (Corte Transversal):** La partición se hace por ID de usuario. Esto asegura que el modelo se pruebe con personas que jamás vio en el entrenamiento, validando su capacidad de clasificar nuevos clientes.
* **En Transacciones (Corte Temporal):** La partición se hace por fecha. El modelo entrena con el pasado (Enero - Agosto) y se prueba con el futuro (Noviembre - Diciembre). Esto previene el *Temporal Data Leakage*, garantizando que el modelo funcione correctamente cuando reciba compras reales en el tiempo presente.

### C. El estándar de evaluación de 3 capas (Train, Val, Test)
Separar en tres capas en lugar de dos (`train` y `test`) evita el sobreajuste (*overfitting*) en las decisiones del científico de datos:
* **`Train`:** Ajusta los pesos del algoritmo.
* **`Val`:** Permite al científico de datos experimentar, probar combinaciones en `GridSearchCV` y calibrar probabilidades sin contaminar la evaluación final.
* **`Test`:** Actúa como el examen final ciego que simula la puesta en producción.
