# 🐳 FinanceAI — Entorno de Testing y Orquestación Docker

Esta rama está dedicada exclusivamente a la configuración, testing y estabilización de la infraestructura local multiplataforma utilizando Docker y Docker Compose en la fase de desarrollo.

---

## 🛠️ 1. Estructura de Contenedores y Puertos

El entorno local levanta 4 servicios interconectados dentro de la misma red de Docker:

* 🎨 **Front-End (Vue.js 3 + Vite)**: [http://localhost:8082](http://localhost:8082) (interno puerto `3000`)
* ⚙️ **Back-End (Spring Boot 4.1.0)**: [http://localhost:8081](http://localhost:8081) (interno puerto `8080`)
* 🗄️ **Base de Datos (MySQL 8.0)**: Mapeado localmente al puerto `3307` (interno puerto `3306`)
* 📊 **Ciencia de Datos (Jupyter Lab)**: [http://localhost:8888](http://localhost:8888) (puente a `shared-models/`)

---

## 🚀 2. Guía de Configuración y Arranque Rápido

Seguí estos pasos en orden para levantar el entorno local:

### Paso 1: Configurar archivos locales a partir de las plantillas
Dado que las credenciales y las configuraciones de desarrollo local no se suben a GitHub por seguridad, debés duplicar y renombrar los archivos plantilla en la raíz del proyecto (podés hacerlo visualmente desde tu explorador de archivos o con la terminal):

* **Variables de entorno:** Copiar `.env.example` y renombrarlo como `.env`
* **Overrides de Docker:** Copiar `docker-compose.override.yml.example` y renombrarlo como `docker-compose.override.yml`


### Paso 2: Construir y levantar los contenedores
Ejecutá el comando estándar de Docker Compose para compilar e iniciar los servicios en segundo plano:
```bash
docker compose up -d --build
```

### Paso 3: Monitorear el estado del Backend (opcional)
Podés verificar que el servidor de Java Spring Boot compile y se conecte a MySQL leyendo sus logs:
```bash
docker compose logs -f backend
```

---

## 🔧 3. Historial de Fixes Aplicados (Bitácora de DevOps)

Se han resuelto los siguientes problemas técnicos críticos en esta rama:

### 1. Fix: Error de permisos con el Maven Wrapper (`./mvnw: Permission denied`)
* **Problema:** En sistemas locales que montan volúmenes compartidos, el script `./mvnw` carecía de permisos de ejecución (`+x`), provocando un bucle de reinicios (Exit Code `126`) en el contenedor.
* **Solución:** Se modificó el archivo `docker-compose.override.yml.example` para utilizar el comando **`mvn`** global provisto nativamente por la imagen de Docker, el cual tiene permisos de ejecución nativos y es totalmente independiente de los archivos locales.

### 2. Fix: Optimización de velocidad en el arranque del Backend
* **Problema:** El backend utilizaba la imagen de JDK pura `eclipse-temurin:17-jdk` e instalaba Maven de forma dinámica en cada arranque, demorando de 1 a 3 minutos.
* **Solución:** Se actualizó la imagen base en `docker-compose.yml` a **`maven:3.9.6-eclipse-temurin-17`** (que incluye Maven preinstalado), reduciendo el arranque a segundos.

### 3. Fix: Homologación MySQL vs PostgreSQL y variables del `.env`
* **Problema:** Había confusión técnica en la documentación y archivos de configuración (se mencionaba Postgres y puertos locales 5433).
* **Solución:** Se estandarizó todo a MySQL 8.0, mapeando el puerto del host a `3307` para evitar colisiones y actualizando las variables en la plantilla `.env.example` a `DB_USER_M` y `DB_PASSWORD`.

### 4. Fix: Conectividad interna de Red y contraseña en `application.properties`
* **Problema:** El backend apuntaba a `localhost` (lo que falla en contenedores separados) y usaba la variable incorrecta `${DB_PASS}`.
* **Solución:** Se reconfiguró `application.properties` para apuntar a la red interna de Docker (`${DB_HOST}`) y mapear la contraseña con `${DB_PASSWORD}` de forma alineada con Docker Compose.

### 5. Fix: Consumo de recursos
* **Problema:** Al levantar el stack completo, la compilación de Java (Maven) y la base de datos MySQL pueden generar picos de consumo de CPU y consumir mucha memoria del sistema.
* **Solución:** Se agregaron límites estrictos de CPU y memoria en todos los servicios de [docker-compose.yml](./docker-compose.yml) (`deploy.resources.limits`) y se limitó la memoria interna de la JVM con `MAVEN_OPTS=-Xmx1024m -Xms512m` en el backend.

---

## 💡 4. Tip de Windows: Evitar que WSL2 devore tu RAM

En Windows, WSL2 (la máquina virtual donde corre Docker) tiende a consumir de forma ilimitada la RAM del sistema. Si a algún miembro del equipo se le sigue colgando la computadora, la solución definitiva es:

1. Abrir la carpeta de usuario en Windows (escribir `%USERPROFILE%` en el explorador de archivos).
2. Crear un archivo de texto llamado `.wslconfig` (asegúrate de que no termine en `.txt`).
3. Pegar la siguiente configuración para ponerle un tope máximo a Linux:
   ```ini
   [wsl2]
   memory=4GB
   processors=4
   ```
4. Abrir la terminal de Windows y reiniciar WSL con: `wsl --shutdown`.

