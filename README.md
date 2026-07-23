# 💡 FinanceAI — Asistente Inteligente de Salud Financiera

Una solución inteligente para analizar el comportamiento y la salud financiera de usuarios a partir de sus transacciones, hábitos de consumo e indicadores financieros, transformando datos brutos en conocimiento claro y accionable.

---

##  1. Funcionalidades del MVP (Features)

- 🏷️ **Clasificación Automática de Gastos**: Categorización inteligente de transacciones en categorías clave (*Alimentación, Transporte, Salud, Vivienda, Educación, Ocio, Servicios, Ahorros, Deudas*).
- 📊 **Evaluación del Perfil Financiero**: Catalogación del nivel de riesgo e higiene financiera del usuario en tres perfiles: **Saludable**, **En observación** o **En riesgo**, con cálculo de probabilidad.
- 💡 **Recomendaciones Personalizadas**: Generación automática de consejos simples y accionables para reducir gastos excesivos y mejorar la capacidad de ahorro.

---

##  2. Stack Tecnológico

- **Ciencia de Datos**: Python, Pandas, Scikit-Learn (Random Forest & NLP TF-IDF), ONNX (`skl2onnx`).
- **Back-End**: Java 17, Spring Boot, ONNX Runtime (`onnxruntime`), PostgreSQL (Spring Data JPA).
- **Front-End**: Vue 3, Vite, HTML5, CSS3.
- **Cloud & Infraestructura**: Oracle Cloud Infrastructure (OCI), Docker & Docker Compose.

---

## 📁 3. Estructura Simplificada del Proyecto

```
Test/
├── backend/                  # API REST en Java Spring Boot
├── frontend/                 # Interfaz Web en Vue 3 + Vite
├── notebooks/                # Experimentos, EDA y entrenamiento ML en Python
│   ├── data/                 # Datasets sintéticos en español
│   ├── eda.ipynb             # Exploración y visualización de datos
│   └── training.ipynb        # Entrenamiento y exportación ONNX
├── shared-models/            # Modelos serializados .onnx y metadatos JSON
├── docker-compose.yml        # Orquestación de contenedores locales
├── .gitignore                # Reglas de exclusión de archivos pesados/temporales
└── README.md                 # Documentación principal del proyecto
```

---

##  4. Endpoint Principal (`POST /analisis-financiero`)

### Entrada (Request Payload):
```json
{
  "ingreso_mensual": 4500,
  "nivel_endeudamiento": 25,
  "frecuencia_ahorro": "Media",
  "transacciones": [
    { "descripcion": "Supermercado", "valor": 420 },
    { "descripcion": "Combustible", "valor": 300 },
    { "descripcion": "Streaming", "valor": 40 }
  ]
}
```

###  Salida (Response Payload):
```json
{
  "perfil_financiero": "En observación",
  "probabilidad": 0.82,
  "resumen_gastos": {
    "alimentacion": 420,
    "transporte": 300,
    "entretenimiento": 40
  },
  "recomendaciones": [
    "Monitorear los gastos recurrentes de entretenimiento",
    "Aumentar la reserva financiera mensual"
  ]
}
```

---

## 5. Guía de Ejecución Rápida con Docker

### Requisitos previos:
- Tener instalado **Docker Desktop** (o Docker Engine en Linux).

### Iniciar el proyecto completo:
```bash
# 1. Clonar el repositorio y posicionarse en la carpeta del proyecto
git clone <URL_REPOSISTORIO>
cd Test/

# 2. Levantar todos los servicios en segundo plano
docker compose up -d
```

### Acceso a los servicios:
- 🎨 **Front-End (Vue.js)**: `http://localhost:8082`
- ⚙️ **Back-End (Spring Boot)**: `http://localhost:8081`
- 📊 **Data Science (Jupyter Notebook)**: `http://localhost:8888`
- 🗄️ **Base de Datos (PostgreSQL)**: `localhost:5433`

---

##  6. Equipo y Roles

| Nombre     | Rol |
| ---------- | -------------- |
| Gabriel Estrada | Backend developer |
| Cesar Maximiliano Chanan Romero | Backend developer |
| Joel Israel Escalante Garcia | Backend developer |
| Nicole Fernandez | Frontend |
| Christian Quidel | Data scientist |
| Esteban David Galdames | Data scientist |
| Starlyn Manuel Duarte Guzman | Data analyst |
| Oscar Alderete | Data engineer |

---

## 🗺️ 7. Roadmap del Proyecto

- [x] **Fase 1: Planeamiento & Arquitectura**: Definición del MVP, esquema de JSON e infraestructura Docker Compose.
- [ ] **Fase 2: Ciencia de Datos**: Dataset sintético, EDA (`eda.ipynb`) y exportación a `.onnx`.
- [ ] **Fase 3: Desarrollo de API & UI**: Implementación de endpoints REST en Spring Boot e interfaz web en Vue.
- [ ] **Fase 4: Despliegue en OCI**: Configuración de servicios en Oracle Cloud Infrastructure (Object Storage / Compute).
- [ ] **Fase 5: Verificación & Demo Day**: Pruebas integradas de 3 escenarios reales y presentación final.

---

## 📄 8. Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Consulta el archivo `LICENSE` para más información.
