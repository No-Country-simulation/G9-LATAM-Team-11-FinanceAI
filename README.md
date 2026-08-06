# FinanceAI — Asistente Inteligente de Salud Financiera

Esta rama está dedicada exclusivamente al desarrollo de la fase de entrenamiento. Puede incluir tanto el notebook principal, como las versiones candidatas, borradores, etc.
Los outputs no se suben a github, sólo a OCI Object Storage.

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

## 3. Estructura simplificada de la rama

```
G9-LATAM-Team-11-FinanceAI/
├── backend/                  # API REST en Java Spring Boot
├── notebooks/                # Desarrollo de notebooks de simulación
│   ├── data/                 # Outputs de los notebooks (.csv y .json)
├── .gitignore                # Reglas de exclusión de archivos pesados/temporales
└── README.md                 # Documentación principal de la rama
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

## 8. Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Consulta el archivo `LICENSE` para más información.
