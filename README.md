# 💡 FinanceAI — Asistente Inteligente de Salud Financiera

Una solución inteligente para analizar el comportamiento y la salud financiera de usuarios a partir de sus transacciones, hábitos de consumo e indicadores financieros, transformando datos brutos en conocimiento claro y accionable.

---

## 🚀 1. Funcionalidades del MVP (Features)

- 🏷️ **Clasificación Automática de Gastos**: Categorización inteligente de transacciones en 9 categorías clave (*Alimentación, Transporte, Salud, Vivienda, Educación, Ocio, Servicios, Deudas, Ahorros*).
- 📊 **Evaluación del Perfil Financiero**: Catalogación del nivel de riesgo e higiene financiera del usuario en tres perfiles: **Saludable**, **En observación** o **En riesgo**, con cálculo de probabilidad.
- 💡 **Recomendaciones Personalizadas**: Generación automática de consejos simples y accionables para reducir gastos excesivos y mejorar la capacidad de ahorro.

---

## 🛠️ 2. Stack Tecnológico

- **Ciencia de Datos**: Python, Pandas, Scikit-Learn.
- **Back-End**: Java 17, Spring Boot.
- **Front-End**: Vue 3, Vite, HTML5, CSS3.
- **Cloud & Infraestructura**: Oracle Cloud Infrastructure (OCI), Docker & Docker Compose.

---

## 📁 3. Estructura Simplificada del Proyecto

```text
G9-LATAM-Team-11-FinanceAI/
├── backend/                  # API REST en Java Spring Boot
├── frontend/                 # Interfaz Web en Vue 3 + Vite
├── notebooks/                # EDA y entrenamiento ML en Python
│   ├── README.md             # Instrucciones específicas de Data Science
│   ├── requirements.txt      # Dependencias de Python
│   ├── simulation.ipynb      # Notebook de simulación de datos
│   └── training.ipynb        # Notebook de entrenamiento del modelo
├── shared-models/            # Modelos serializados .onnx y metadatos JSON
├── docker-compose.yml        # Orquestación de contenedores locales
├── .gitignore                # Reglas de exclusión de Git
└── README.md                 # Documentación principal
```

---

## 🔌 4. Endpoint Principal (`POST /analisis-financiero`)

### 📩 Entrada (Request Payload):
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

### 📤 Salida (Response Payload):
```json
{
  "perfil_financiero": "En observación",
  "probabilidad": 0.82,
  "resumen_gastos": {
    "Alimentacion": 420,
    "Transporte": 300,
    "Ocio": 40
  },
  "recomendaciones": [
    "Monitorear los gastos recurrentes de entretenimiento",
    "Aumentar la reserva financiera mensual"
  ]
}
```

---

## 🐳 5. Guía de Ejecución Rápida con Docker

### Requisitos previos:
* Tener instalado **Docker Desktop** (en Windows/Mac) o Docker Engine (en Linux).

### Iniciar el proyecto completo:
1. Clonar el repositorio y posicionarse en la carpeta del proyecto:
   ```bash
   git clone <URL_REPOSISTORIO>
   cd G9-LATAM-Team-11-FinanceAI/
   ```
2. Levantar todos los servicios en segundo plano:
   ```bash
   docker compose up -d
   ```

### Acceso a los servicios locales:
* 🎨 **Front-End (Vue.js)**: [http://localhost:8082](http://localhost:8082)
* ⚙️ **Back-End (Spring Boot)**: [http://localhost:8081](http://localhost:8081)
* 📊 **Data Science (Jupyter Lab)**: [http://localhost:8888](http://localhost:8888) (Ver paso de token abajo)
* 🗄️ **Base de Datos (PostgreSQL)**: `localhost:5433` (Solo accesible desde tu máquina)

---

## 🔒 6. Buenas Prácticas de Ciberseguridad Aplicadas

Hemos diseñado la infraestructura local siguiendo estándares de seguridad de desarrollo (*Secure by Design*):

1. **Bindeo Local Exclusivo (`127.0.0.1`)**: 
   Todos los puertos expuestos en `docker-compose.yml` están limitados explícitamente al host local (`127.0.0.1:PUERTO:PUERTO`). Esto evita que si trabajas en una red pública o Wi-Fi compartida, otros dispositivos de la red puedan acceder a tu base de datos PostgreSQL, tu Jupyter Lab o tu Backend en desarrollo.
2. **Postgres Seguro**: La base de datos no expone el puerto estándar `5432` directamente al host, sino el puerto mapeado `5433` y restringido a localhost, evitando escaneos de puertos automatizados habituales.
3. **Control de Acceso de Jupyter**: El entorno de Data Science exige por defecto un token seguro generado aleatoriamente para iniciar sesión, mitigando ejecuciones de código no autorizadas.
4. **Archivos Excluidos**: Archivos sensibles como `.env`, el archivo local `docker-compose.override.yml` están agregados a `.gitignore` para evitar fugas a repositorios públicos.

---

## 💻 7. Guía de Compatibilidad para Windows (Muy Importante)

Dado que todo el equipo trabaja sobre Windows, apliquen las siguientes directrices para evitar conflictos y errores de Docker:

### 7.1 Fin de Línea de Git (CRLF vs LF)
Windows usa por defecto caracteres `CRLF` (retorno de carro y salto de línea) al guardar archivos, mientras que Linux/Docker usa `LF`. Si editas scripts en Windows y se suben como `CRLF`, los contenedores Docker fallarán con el error: `bash: ...: /bin/sh^M: bad interpreter`.
* **Solución aplicada:** Hemos incluido un archivo `.gitattributes` en la raíz del repositorio que obliga a Git a tratar los archivos ejecutables (como `mvnw` o scripts `.sh`) usando siempre terminación `LF` al clonar. No debes configurar nada extra.

### 7.2 Ubicación del Proyecto (WSL2 File System)
* **Recomendación crítica:** Para optimizar la velocidad de Docker (hasta 10 veces más rápido) y evitar problemas de permisos de archivos de Windows, **clona este repositorio directamente dentro del sistema de archivos de WSL2** (ej. `/home/tu_usuario/proyectos/`) en lugar de hacerlo en la ruta de Windows (`C:\Users\...` o `/mnt/c/...`).
* Puedes acceder a la carpeta de WSL2 desde tu explorador de Windows abriendo la ruta `\\wsl$\`.

### 7.3 Permisos de Escritura en Volúmenes Compartidos
En Windows, los permisos se manejan de manera diferente a Linux. Si experimentas problemas donde Jupyter no puede escribir los modelos `.onnx` en `shared-models/`, asegúrate de correr tu terminal (Git Bash o PowerShell) como administrador al inicializar los contenedores por primera vez o verifica que Docker Desktop tenga habilitado el "gRPC FUSE" o "VirtioFS" en la pestaña de *File Sharing* en la configuración.
