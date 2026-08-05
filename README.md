# FinanceAI — Entorno de Testing y Orquestación Docker

Esta rama está dedicada exclusivamente a la configuración, testing y estabilización de la infraestructura local multiplataforma utilizando Docker y Docker Compose en la fase de desarrollo.

Cada contenedor está pensado y estructurado para que funcione y esté listo para que cada rol/sector del proyecto no tenga que preocuparse por docker, pero sí por sus tareas. Cualquier sugerencia es bien recibida.

Los contenedores se detendrán entre un inicio de sesión y el siguiente, de manera que deben arrancarse manualmente en cada reinicio (docker compose up -d). Esto está hecho así para evitar consumir recursos cuando no corresponda.

---

##  Estructura de Contenedores y Puertos

El entorno local levanta 4 servicios interconectados dentro de la misma red de Docker:

* 🎨 **Front-End (Vue.js 3 + Vite)**: [http://localhost:8082](http://localhost:8082) (interno puerto `3000`)
* ⚙️ **Back-End (Spring Boot)**: [http://localhost:8081](http://localhost:8081) (interno puerto `8080`)
* 🗄️ **Base de Datos (MySQL 8.0)**: Mapeado localmente al puerto `3307` (interno puerto `3306`)
* 📊 **Ciencia de Datos (Jupyter Lab)**: [http://localhost:8888](http://localhost:8888) (puente a `shared-models/`)

---

## Guía de Configuración y Arranque Rápido

Sigue estos pasos en orden para levantar el entorno local:

### Paso 1: Configurar archivos locales a partir de las plantillas
Dado que las credenciales y las configuraciones de desarrollo local no se suben a GitHub por seguridad, debés duplicar y renombrar los archivos plantilla en la raíz del proyecto (podés hacerlo visualmente desde tu explorador de archivos o con la terminal):

* **Variables de entorno:** Copiar `.env.example` y renombrarlo como `.env`
* **Overrides de Docker:** Copiar `docker-compose.override.yml.example` y renombrarlo como `docker-compose.override.yml`


### Paso 2: Construir y levantar los contenedores
Ejecuta el comando estándar de Docker Compose para compilar e iniciar los servicios en segundo plano:
```bash
docker compose up -d
```

### Opcional: Monitorear el estado del Backend
Podés verificar que el servidor de Java Spring Boot compile y se conecte a MySQL leyendo sus logs:
```bash
docker compose logs -f backend
```

---

## Historial de Fixes Aplicados (Bitácora de DevOps)

Se han resuelto los siguientes problemas técnicos críticos en esta rama:

### Error de permisos con el Maven Wrapper (`./mvnw: Permission denied`)
* **Problema:** En sistemas locales que montan volúmenes compartidos, el script `./mvnw` carecía de permisos de ejecución (`+x`), provocando un bucle de reinicios (Exit Code `126`) en el contenedor.
* **Solución:** Se modificó el archivo `docker-compose.override.yml.example` para utilizar el comando **`mvn`** global provisto nativamente por la imagen de Docker, el cual tiene permisos de ejecución nativos y es totalmente independiente de los archivos locales.

### Optimización de velocidad en el arranque del Backend
* **Problema:** El backend utilizaba la imagen de JDK pura `eclipse-temurin:17-jdk` e instalaba Maven de forma dinámica en cada arranque, demorando de 1 a 3 minutos.
* **Solución:** Se actualizó la imagen base en `docker-compose.yml` a **`maven:3.9.6-eclipse-temurin-17`** (que incluye Maven preinstalado), reduciendo el arranque a segundos.

### Homologación MySQL vs PostgreSQL y variables del `.env`
* **Problema:** Había confusión técnica en la documentación y archivos de configuración (se mencionaba Postgres y puertos locales 5433).
* **Solución:** Se estandarizó todo a MySQL 8.0, mapeando el puerto del host a `3307` para evitar colisiones y actualizando las variables en la plantilla `.env.example` a `DB_USER_M` y `DB_PASSWORD`.

### Conectividad interna de Red y contraseña en `application.properties`
* **Problema:** El backend apuntaba a `localhost` (lo que falla en contenedores separados) y usaba la variable incorrecta `${DB_PASS}`.
* **Solución:** Se reconfiguró `application.properties` para apuntar a la red interna de Docker (`${DB_HOST}`) y mapear la contraseña con `${DB_PASSWORD}` de forma alineada con Docker Compose.

### Consumo de recursos
* **Problema:** Al levantar el stack completo, la compilación de Java (Maven) y la base de datos MySQL pueden generar picos de consumo de CPU y consumir mucha memoria del sistema.
* **Solución:** Se agregaron límites estrictos de CPU y memoria en todos los servicios de [docker-compose.yml](./docker-compose.yml) (`deploy.resources.limits`) y se limitó la memoria interna de la JVM con `MAVEN_OPTS=-Xmx1024m -Xms512m` en el backend.

### Desactivación de reinicio automático de contenedores al arrancar el sistema
* **Problema:** La configuración `restart: always` levantaba automáticamente todos los contenedores en segundo plano cuando el desarrollador iniciaba sesión en su computadora, consumiendo memoria RAM y CPU innecesariamente en equipos de recursos limitados.
* **Solución:** Se actualizó la propiedad a `restart: "no"` en todos los servicios de [docker-compose.yml](./docker-compose.yml). Los contenedores ahora solo se inician con comandos explícitos (`docker compose up`) y no consumen recursos al prender la máquina.
