# Informe de Estado y Correcciones Técnicas por Rol - FinanceAI

**Fecha:** 23 de agosto de 2026  
**Destinatarios:** Equipo de Desarrollo (DevOps, Backend, Frontend, Data Science)  
**Resumen:** Este documento consolida el estado del MVP, la evolución completa de la arquitectura Docker (desarrollo y producción para OCI), los problemas identificados y las correcciones técnicas aplicadas en cada área para estabilizar el sistema, interoperar los modelos de Inteligencia Artificial (ONNX) con Spring Boot y Vue 3, y maximizar la capacidad de generalización del procesamiento de lenguaje natural.

---

## 1. DevOps & Infraestructura

* **Actualización del contenedor Node (Frontend)**:
  * **Diagnóstico previo**: `docker-compose.yml` utilizaba `node:20-alpine`, incompatible con `package.json` (`node: ^22.18.0`), provocando fallos en pruebas de entorno web.
  * **Solución implementada**: Se actualizó la imagen a `node:22-alpine` y se inyectó `VITE_BACKEND_URL=http://backend:8080`.
* **Sincronización de ruta para modelos ONNX**:
  * **Solución implementada**: Se configuró la variable de entorno `SHARED_MODELS_PATH=/app/models` en el servicio `backend` dentro de `docker-compose.yml`, coincidente con el volumen montado `./shared-models:/app/models`.

---

## 2. Backend (Java 17 / Spring Boot)

* **Codificación y configuración de base de datos**:
  * **Solución implementada**: `application.properties` se guardó en codificación UTF-8 estricta y se corrigió la propiedad `spring.datasource.driver-class-name`.
* **Esquema de base de datos (Flyway V4)**:
  * **Solución implementada**: En `V4__creacion-tabla-analisisfinanciero.sql`, se ajustó la columna `nivel_ahorro` a `VARCHAR(50) NOT NULL` para almacenar correctamente las categorías de texto ("Alta", "Media", "Baja", "Ninguna").
* **Optimización e inferencia con ONNX Runtime**:
  * **Solución implementada**: En `DataScienceModelService.java`, se convirtieron las sesiones de inferencia en Singletons (`@PostConstruct` / `@PreDestroy`), se añadió normalización de texto y tildes (`java.text.Normalizer`) y se implementó la inferencia del perfil financiero (`modelo_perfil.onnx`).
* **Seguridad y autenticación**:
  * **Solución implementada**: Se integró `BCryptPasswordEncoder` en `UsuarioService.java` para cifrar contraseñas al crear usuarios y se habilitó el endpoint `POST /login` en `LoginController.java`.
* **Endpoint de Análisis Financiero**:
  * **Solución implementada**: En `AnalisisFinancieroController.java`, se habilitó `POST /analisis-financiero`, el cual ejecuta la inferencia con los modelos ONNX y retorna el perfil, la distribución de gastos y las recomendaciones dinámicas.
* **Flexibilización de transacciones**:
  * **Solución implementada**: En `TransacionService.java`, se eliminó el bloqueo que impedía ingresar transacciones si superaban el ingreso mensual, permitiendo modelar situaciones de sobreendeudamiento.

---

## 3. Frontend (Vue 3 / Vite)

* **Conexión de autenticación real**:
  * **Solución implementada**: En `src/composables/useUsuario.js`, se conectó el inicio de sesión contra el endpoint `POST /login` del backend.
* **Proxy de desarrollo en Docker**:
  * **Solución implementada**: En `vite.config.js`, se configuró el proxy hacia `http://backend:8080` y se habilitó `server.allowedHosts: true` para permitir peticiones dentro de la red interna de Docker.
* **Pruebas unitarias**:
  * **Solución implementada**: Se actualizaron las pruebas en `divisas.bug.spec.js` para validar la versión v2 de la API de Frankfurter (`/v2/rates`).

---

## 4. Data Science (Modelos ONNX y Datos)

* **Contrato de integración (`metadata.json` v2.0.0)**:
  * El backend consume dinámicamente los metadatos y tensores exportados:
    * `modelo_transacciones.onnx`: Recibe `string_input` y devuelve la categoría clasificada entre las 10 categorías acordadas.
    * `modelo_perfil.onnx`: Recibe `float_input` con el vector `[ingreso_mensual, nivel_endeudamiento, ahorro_num]` y clasifica en "Saludable", "En observacion" o "En riesgo".

---

## 5. Estado de Pruebas y Validación (Sesión 17 de agosto)

* **Frontend**: 35/35 pruebas unitarias aprobadas. Compilación de producción (`npm run build`) en 561 ms.
* **Backend**: 34 clases Java compiladas con éxito y pruebas de contexto Spring Boot aprobadas (`BUILD SUCCESS`).
* **Integración E2E**: Registro de usuario, login, categorización de transacciones con ONNX y análisis financiero probados exitosamente en vivo.

---

## 6. Informe de Integración de Ramas Recientes y Correcciones (20 de agosto de 2026)

**Destinatarios:** Equipos de Backend, Frontend, DevOps y Data Science  
**Objetivo:** Detallar las características incorporadas desde la rama `cambios-ramas-recientes`, los ajustes técnicos implementados para corregir incompatibilidades y los puntos clave sujetos a revisión u objeción por parte de cada área.

---

### A. Módulo Backend (Java 17 / Spring Boot)

#### Cambios incorporados desde la rama:
1. **Seguridad y JWT**: Se añadieron las dependencias `spring-boot-starter-security` y `io.jsonwebtoken:jjwt` (0.11.5). Se crearon las clases `TokenService`, `SecurityFilter` y `ConfiguracionesDeSeguridad` para autenticación *stateless* mediante Bearer token.
2. **Flujo de Login y Usuarios**: Se actualizó `LoginController` para retornar `LoginRespuestaDTO` (`token`, `idUsuario`, `nombre`, `email`) y `Usuario` ahora implementa `UserDetails`.
3. **Módulo de Perfil Financiero**: Se incorporó `PerfilController` (`/perfil/frecuencia-ahorro/{idUsuario}` y `/perfil/endeudamiento/{idUsuario}`) y el servicio `PerfilFinancieroService`.
4. **Orquestación de Análisis con IA**: Se incorporó en `AnalisisFinancieroService` la ejecución del pipeline completo: cálculo de métricas financieras -> inferencia con `modelo_perfil.onnx` -> generación de recomendaciones -> persistencia en base de datos.
5. **Reestructuración de paquetes**: La entidad `AnalisisFinanciero` se ubicó en el paquete `G9_LATAM_Team_11_FinanceAI.domain.analisis_financiero`.

#### Ajustes y correcciones técnicas aplicadas en la integración:
* **Preservación y parametrización de `OnnxInferenceService`**:
  * *Motivo*: La clase contenía rutas fijas (`shared-models/modelo_perfil.onnx` y `../shared-models/modelo_perfil.onnx`) y arrojaba una excepción en `@PostConstruct` que provocaba la caída inmediata del contenedor en Docker (donde los modelos se ubican en `/app/models`).
  * *Ajuste*: Se inyectó `@Value("${app.shared-models.path:./shared-models}")` y se envolvió la carga en un bloque de control para no interrumpir el arranque de Spring Boot.
* **Corrección de categoría en `PerfilFinancieroService`**:
  * *Motivo*: La consulta `countInversionesEnRango` buscaba la categoría `"Inversión"` (con tilde), mientras que el modelo ONNX y `metadata.json` clasifican las transacciones como `"Inversion"` (sin tilde). Esto provocaba que siempre devolviera 0 inversiones y la frecuencia de ahorro fuera siempre `NINGUNA`.
  * *Ajuste*: Se sincronizó el parámetro a `"Inversion"`.
* **Resiliencia en carga de metadatos (`DataScienceModelService`)**:
  * *Motivo*: El servicio buscaba `root.has("categorias")` en español, mientras que `metadata.json` define la clave `"categories"`.
  * *Ajuste*: Se implementó soporte dual para leer `"categories"` o `"categorias"`.
* **Corrección en `application.properties` y gestión de `TOKEN_SECRETO`**:
  * *Motivo*: Se corrigió la errata `spring.datasource.drive-class-name` por `spring.datasource.driver-class-name`. Asimismo, `TokenService.java` dependía obligatoriamente de la variable de entorno `${TOKEN_SECRETO}`, lo que provocaba que la aplicación fallara en local si el desarrollador no ejecutaba previamente `export TOKEN_SECRETO=...`.
  * *Ajuste*: Se configuró en `application.properties` y `TokenService.java` un valor por defecto seguro de más de 32 bytes (`api.security.secret=${TOKEN_SECRETO:FinanceAI_Secret_Key_Super_Segura_2026_JWT_Token_HS256_Min}`). De esta manera, si la variable está presente en el entorno o en Docker se utiliza, y si no se encuentra, la aplicación inicia sin errores.
* **Configuración de CORS y filtros en `ConfiguracionesDeSeguridad`**:
  * *Motivo*: Los orígenes CORS estaban restringidos a URLs rígidas de desarrollo local, lo que bloquearía el acceso desde `127.0.0.1` o IPs públicas en OCI.
  * *Ajuste*: Se configuró `setAllowedOriginPatterns`, se agregaron los métodos `PATCH` y `OPTIONS`, y se permitió explícitamente el acceso a `/error` para evitar conversiones indebidas a `403 Forbidden`.
* **Protección del filtro `SecurityFilter`**:
  * *Motivo*: Evitar que un token expirado o un usuario inexistente genere un error interno `500` no capturado en la cadena de filtros.
* **Formalización de migración Flyway (`V5`) y consistencia con `V4`**:
  * *Motivo*: El campo `nivel_ahorro` de `analisis_financiero` debe ser texto (`VARCHAR(50)`) para mapear el Enum `FrecuenciaAhorro` de Java. Si en una base de datos previa quedó como numérico (`DECIMAL`), requiere alteración. En lugar de ejecutar el comando `ALTER TABLE` a mano, debe gestionarse como migración versionada. Además, modificar retrospectivamente el archivo histórico `V4` rompe el *checksum* de Flyway en bases de datos ya inicializadas.
  * *Ajuste*: Se formalizó la instrucción `ALTER TABLE analisis_financiero MODIFY COLUMN nivel_ahorro VARCHAR(50);` en el script versionado `V5__alter-campo-nivel-ahorro-de-analisisfinanciero.sql`, preservando `V4` intacto en su definición original (`VARCHAR(50)`). De esta forma, bases de datos nuevas y existentes se actualizan automáticamente sin intervención manual.
* **Compatibilidad de rutas REST (`AnalisisFinancieroController`)**:
  * *Ajuste*: Se mapeó `@RequestMapping({"/analisisfinanciero", "/analisis-financiero"})` para responder a ambas convenciones de URL.
* **Limpieza de código obsoleto**:
  * *Ajuste*: Se eliminaron las clases y DTOs obsoletos del esquema anterior (`ItemTransaccionAnalisisDTO`, `ResultadoAnalisisDTO`, `SolicitudAnalisisDTO`, `DatosAutenticacionDTO`, `DatosTokenJWT` y la clase duplicada en el paquete antiguo).

---

### B. Módulo Frontend (Vue 3 / Vite)

#### Cambios incorporados desde la rama:
1. **Autenticación con JWT**: `stores/auth.js` y `composables/useUsuario.js` ahora almacenan y gestionan el token JWT recibido del backend.
2. **Interceptor HTTP**: `services/http.js` adjunta automáticamente el encabezado `Authorization: Bearer <token>` a cada solicitud.
3. **Manejo de transacciones por rango**: `services/transacciones.js` maneja respuestas `404` como arreglos vacíos cuando no existen transacciones en el rango consultado.
4. **Filtros temporales en Dashboard**: `views/DashboardView.vue` incorpora selector de rango (1M, 6M, 1A) para la evolución de gastos.
5. **Validación de fechas**: `components/dashboard/FormularioTransaccion.vue` restringe las fechas al mes en curso.

#### Ajustes y correcciones técnicas aplicadas en la integración:
* **Soporte polimórfico en `RecomendacionesLista.vue`**:
  * *Motivo*: El componente esperaba estrictamente un `Array` de recomendaciones, mientras que el DTO del backend (`RespuestaAnalisisFinancieroDTO`) retorna un `String` con las recomendaciones unificadas. Si se pasaba un string a un `v-for`, Vue iteraba carácter por carácter.
  * *Ajuste*: Se añadió una propiedad computada que procesa tanto listas (`Array`) como cadenas de texto (`String`), separando automáticamente por oraciones para renderizar viñetas limpias.
* **Compatibilidad de nombres en `ResultadoView.vue`**:
  * *Ajuste*: Se habilitó lectura tanto de `perfil_financiero` como de `perfilFinanciero`.

---

### C. Módulo DevOps & Infraestructura

* **Configuración de variables de entorno**: `docker-compose.yml` en la raíz contiene las variables `TOKEN_SECRETO`, `SHARED_MODELS_PATH` y la configuración de puertos acotados a `127.0.0.1`.
* **Descarte de archivos redundantes**: Se descartaron el archivo `pom.xml` erróneo en la raíz (que declaraba una versión inexistente `4.1.0`) y el `docker-compose.yml` secundario ubicado dentro de `frontend/`.

---

### D. Puntos de Consulta / Objeción para los Equipos

1. **Equipo de Backend**:
   - **Consolidación de servicios ONNX**: Actualmente existen `DataScienceModelService` (utilizado por los controladores para predicción de categorías y perfil) y `OnnxInferenceService` (preservado a solicitud). Se sugiere evaluar si en una siguiente iteración conviene unificarlos en un único servicio.
2. **Equipo de Frontend & Backend**:
   - **Formato de recomendaciones**: Favor de revisar si prefieren que la API devuelva las recomendaciones como una lista de strings (`List<String>`) en lugar de un único string consolidado (`String`), o si la adaptación polimórfica actual en el frontend satisface los requerimientos del equipo.

---

## 7. Informe de Estabilización, Población Idempotente y Licenciamiento (21 de agosto de 2026)

**Destinatarios:** Equipo de Desarrollo (Backend, Frontend, Data Science, DevOps)  
**Objetivo:** Consolidar los ajustes aplicados para la población definitiva de datos 2025-2026, soporte dual de endpoints en Backend, correcciones de CORS/Preflight y formalización de la licencia MIT.

---

### A. Población Idempotente y Migración Flyway `V6`
* **Dataset móvil de 365 días (2025-2026)**: Se actualizó el pipeline en `notebooks/poblar_db.ipynb` y `notebooks/data/poblar_datos.sql` con 10 usuarios y 6.000 transacciones con fechas del 22 de agosto de 2025 al 21 de agosto de 2026.
* **Formalización en Flyway (`V6__poblar_datos_prueba.sql`)**: Se incorporó el semillero oficial en la migración `V6` utilizando cláusulas `INSERT IGNORE INTO` para asegurar su ejecución idempotente sin fallos por duplicidad de claves primarias.
* **Cifrado de contraseñas de prueba**: Se corrigió el hash estático simulado de `poblar_db.ipynb` por un hash real generado con BCrypt (`$2a$10$kJio4J2CJgvbQPtXPLW2Mu2bsmJaTlG1Vij9Hy2jnRok6qTVz/W7a`), permitiendo que todos los usuarios de prueba inicien sesión con la contraseña `password123`.

---

### B. Módulo Backend & Endpoints REST
* **Soporte dual en `/transaccion/rangos`**: En `TransaccionController.java`, se incorporó soporte tanto para `POST` (con `@RequestBody` JSON) como para `GET` (con `@ModelAttribute`), evitando el error `405 Method Not Allowed` durante la carga inicial del usuario en el frontend.
* **Completitud del CRUD de transacciones (`DELETE /transaccion/{id}`)**: Se integraron los métodos `@DeleteMapping("/{id}")` en `TransaccionController.java` y `eliminaTransaciones` / `eliminarTransaccion` en `TransacionService.java` para dar soporte al modal de confirmación de borrado en el frontend.
* **Permisos Preflight CORS (`OPTIONS`)**: En `ConfiguracionesDeSeguridad.java`, se habilitó explícitamente `.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()` y patrones de origen amplios (`http://localhost:*`, `http://127.0.0.1:*`) para asegurar la negociación de cabeceras en navegadores.

---

### C. Módulo Frontend (Vue 3 / Vite)
* **Configuración del servidor de desarrollo (`vite.config.js`)**: Se reactivó `server.allowedHosts: true` para permitir peticiones dentro de redes de contenedores Docker.
* **Componentes y vistas actualizadas**:
  * `TransaccionesView.vue`: CRUD completo con paginación de 15 registros por página, modales de edición (con conversor de divisa en tiempo real) y borrado.
  * `ResultadoView.vue` y `GaugeChart.vue`: Visualización de indicadores semicirculares (*Gauges*) para endeudamiento, ahorro y gasto/ingreso, junto a la tarjeta de mayor gasto y recomendaciones personalizadas.
  * `DashboardView.vue`: Tarjetas de KPI reactivas, reloj en vivo y conmutador temporal (1M, 6M, 1A).

---

### D. Gobernanza y Licenciamiento
* **Licencia MIT**: Se creó el archivo formal `LICENSE` en la raíz del repositorio con los derechos de autor para el año 2026 a nombre de `FinanceAI Team - G9 LATAM Team 11` y se añadió el identificador `"license": "MIT"` en `frontend/package.json`.

---

## 8. Informe de Optimización de Recursos y Blindaje de Producción para OCI Free Tier (21 de agosto de 2026)

**Destinatarios:** Equipo de Desarrollo (DevOps, Backend, Frontend, Data Science)  
**Objetivo:** Consolidar la arquitectura de producción contenerizada, el blindaje de seguridad (*hardening*) y el informe de consumo de recursos adaptado a las restricciones de Oracle Cloud Infrastructure (OCI Always Free).

---

### A. Arquitectura Multi-Etapa y Despliegue de Producción (DevOps)
* **Contenerización Multi-Etapa (*Multi-stage Builds*)**:
  * `backend/Dockerfile`: Compilación en primera fase con Maven (`maven:3.9.6-eclipse-temurin-17`) y empaquetado final sobre una imagen mínima JRE (`eclipse-temurin:17-jre-alpine`). Se configuró la ejecución bajo un usuario de sistema sin privilegios (`appuser`).
  * `frontend/Dockerfile`: Compilación de la SPA con `node:22-alpine` y despliegue de los estáticos resultantes sobre un servidor web ligero `nginx:alpine`.
* **Proxy Inverso Nginx (`frontend/nginx.conf`)**:
  * Nginx sirve los estáticos de Vue en el puerto 80 y actúa como proxy inverso hacia el backend (`location /api/ -> http://backend:8080/`), eliminando la necesidad de habilitar CORS en la API y unificando el punto de acceso.
* **Orquestador Productivo (`docker-compose.prod.yml`)**:
  * Se retiró la exposición del puerto 3306 de MySQL hacia Internet, manteniendo la base de datos completamente aislada dentro de la red interna de Docker.
  * Se establecieron límites estrictos de CPU y memoria RAM por contenedor para garantizar estabilidad en instancias de 1 GB de RAM.
  * Se creó la plantilla `.env.prod.example` para gestionar secretos en el servidor sin versionarlos en Git.

---

### B. Blindaje de Seguridad y Perfil de Producción (Backend)
* **Perfil estricto de Spring Boot (`application-prod.properties`)**:
  * Se eliminó el valor por defecto (*fallback*) público de la clave JWT (`api.security.secret=${TOKEN_SECRETO}`), forzando a que la aplicación falle en el arranque si no se inyecta una variable de entorno segura en el servidor.
  * Se desactivó la impresión de consultas SQL (`spring.jpa.show-sql=false`) y se ajustaron los niveles de registro (`logging.level.org.springframework=WARN`, `logging.level.G9_LATAM_Team_11_FinanceAI=INFO`) para prevenir la fuga de credenciales e información financiera en logs.
* **Cabeceras de Seguridad HTTP (Nginx)**:
  * Se integraron los encabezados `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection: 1; mode=block` y `Referrer-Policy: no-referrer-when-downgrade` en `nginx.conf`.

---

### C. Medición Empírica de Recursos (Benchmark en Tiempo Real)
Se ejecutó un análisis en vivo de la infraestructura de producción mediante `docker stats`:

* **Consumo de Memoria RAM:**
  * **Frontend (Nginx Alpine):** ~18 MB (Límite: 100 MB).
  * **Backend (Spring Boot JRE 17):** ~196 MB (Límite: 600 MB).
  * **Base de Datos (MySQL 8.0):** ~365 MB (Límite: 400 MB).
  * **Total activo:** **~580 MB** (dejando más de 400 MB libres para el sistema operativo en una instancia de 1.024 MB).
* **Consumo de CPU:** ~0% a 2% en estado de reposo, con picos de 10% a 30% en inferencias y 100% durante los primeros 5-8 segundos de inicialización de Hibernate/Flyway.
* **Espacio en Disco:** ~2.1 GB requeridos entre imágenes y volúmenes (apenas un 1% de los 200 GB asignados por OCI Always Free).

---

### D. Auditoría y Benchmark de Modelos de Lenguaje (Data Science)
* Se evaluaron de forma aislada los modelos ONNX generados mediante baterías de pruebas ciegas:
  * **Modelo B (Elegido):** 93.9% de exactitud en casos cotidianos, 58 KB de peso y un vocabulario hiper-optimizado de 762 términos clave.
  * **Modelo A:** 78.8% de exactitud y 320 KB.
  * **Modelo C:** 75.8% de exactitud y 235 KB (degradado por sobreajuste léxico debido a ruido estocástico en identificadores numéricos).

---

## 9. Informe de Reestructuración Docker (Dev & Prod), Compatibilidad ONNX C++ y Generalización de Modelos de IA (22 y 23 de agosto de 2026)

**Destinatarios:** Equipo de Desarrollo (DevOps, Backend, Data Science, Frontend)  
**Objetivo:** Documentar la reestructuración completa de los entornos Docker (desarrollo, producción y overrides), la resolución del error de carga nativa en ONNX Runtime Java, y la evolución del modelo de procesamiento de lenguaje natural hacia una cobertura léxica regional con 2.961 términos.

---

### A. DevOps, Infraestructura y Entornos Docker

1. **Resolución de incompatibilidad de biblioteca nativa C++ en ONNX Runtime (`libonnxruntime4j_jni.so`)**:
   * **Diagnóstico previo**: Al desplegar el backend en contenedores basados en Alpine Linux (`eclipse-temurin:17-jre-alpine`), la biblioteca estándar de C utilizada por el sistema operativo es `musl libc`. El motor nativo de ONNX Runtime (`onnxruntime4j`) requiere `glibc` y símbolos de la biblioteca estándar de C++ de GNU (`libstdc++`). Esto provocaba un error de enlace dinámico (`java.lang.UnsatisfiedLinkError: /tmp/onnxruntime4j_jni...: Error relocating ... symbol not found`) que impedía la carga de `modelo_transacciones.onnx` y `modelo_perfil.onnx` en tiempo de ejecución.
   * **Solución implementada**: En `backend/Dockerfile` (Etapa 2), se migró la imagen de ejecución a `eclipse-temurin:17-jre` (basada en Ubuntu/Debian), la cual incluye soporte nativo completo para `glibc`. Se mantuvo la seguridad del contenedor ejecutando bajo un usuario sin privilegios (`appuser`) y se configuró la memoria inicial y máxima de la JVM con `-Xms256m -Xmx512m`.

2. **Diferenciación estricta de entornos Docker**:
   * **Entorno de Desarrollo (`docker-compose.yml`)**:
     * **Base de Datos (`financeai_db`)**: Imagen `mysql:8.0`. El puerto se mapeó a `127.0.0.1:3307:3306` para evitar colisiones con instancias locales de MySQL que puedan estar ejecutándose en el puerto 3306 del host.
     * **Backend (`financeai_backend`)**: Imagen `maven:3.9.6-eclipse-temurin-17`. Montaje de volumen en vivo `./backend:/app` y `./shared-models:/app/models`, ejecutando `mvn spring-boot:run` con límites de recursos amplios (2 CPUs, 2048 MB RAM) para facilitar compilaciones incrementales en caliente.
     * **Frontend (`financeai_frontend`)**: Imagen `node:22-alpine`. Montaje en vivo `./frontend:/app` con ejecución de `npm run dev` en el puerto `127.0.0.1:8082:3000`, configurado con `VITE_BACKEND_URL=http://backend:8080`.
     * **Ciencia de Datos (`financeai_datascience`)**: Construcción basada en `notebooks/Dockerfile` sobre `jupyter/scipy-notebook:latest`, con preinstalación de dependencias científicas (`scikit-learn`, `skl2onnx`, `onnxruntime`, `faker`, `pandas`, `numpy`). Expuesto en `127.0.0.1:8888:8888` para permitir la experimentación interactiva.
   * **Entorno de Producción (`docker-compose.prod.yml`)**:
     * **Base de Datos (`financeai_db_prod`)**: Sin puertos expuestos al exterior, aislada en la red interna de Docker. Límites de recursos fijados en 0.8 CPU y 400 MB RAM.
     * **Backend (`financeai_backend_prod`)**: Construcción multi-etapa optimizada con montaje de modelos en modo solo lectura (`./shared-models:/app/models:ro`), perfil `SPRING_PROFILES_ACTIVE=prod` y límites de 1.0 CPU y 600 MB RAM.
     * **Frontend (`financeai_frontend_prod`)**: Construcción multi-etapa con Node 22 (compilación de estáticos con `VITE_BACKEND_URL=/api`) y servidor web Nginx Alpine sirviendo estáticos y actuando como proxy inverso (`location /api/ -> http://backend:8080/`). Es el único servicio con puerto público expuesto (`80:80`).
   * **Plantilla de Overrides Locales (`docker-compose.override.yml.example`)**:
     * Se incorporó una plantilla versionada para que los desarrolladores puedan crear su propio `docker-compose.override.yml` (ignorado en Git), resolviendo problemas de permisos en sistemas Linux/Mac y habilitando la detección de cambios en caliente de Vite con el parámetro `--host 0.0.0.0`.

3. **Inyección en cascada de variables de entorno**:
   * Se configuraron variables de entorno con valores de reserva (*fallbacks*) en `docker-compose.yml` y `docker-compose.prod.yml` (`${DB_USER:-${DB_USER_M:-dev_user}}`, `${JWT_SECRET:-${TOKEN_SECRETO:...}}`), garantizando que los contenedores puedan levantarse inmediatamente con valores seguros por defecto o sobrescribirse mediante un archivo `.env`.

---

### B. Backend y Consistencia de Semillas

* **Corrección de hashes BCrypt en `V6__poblar_datos_prueba.sql` y `poblar_db.ipynb`**:
  * Se reemplazó el hash de prueba previo por el hash generado formalmente por BCrypt (`$2a$10$kJio4J2CJgvbQPtXPLW2Mu2bsmJaTlG1Vij9Hy2jnRok6qTVz/W7a`), permitiendo que todos los usuarios del dataset de prueba inicien sesión con la credencial estándar `password123`.

---

### C. Data Science: Generalización Léxica e Inferencia ONNX

1. **Diagnóstico del modelo de transacciones previo**:
   * **Memorización vs. Generalización**: El modelo anterior alcanzaba 93.8% de precisión en términos memorizados, pero caía a **56.2% en datos no vistos**, colapsando sistemáticamente hacia la clase `Electrodomesticos` (25 de 35 fallos).
   * **Ruido en etiquetas**: El cuaderno `1_simulation.ipynb` contenía un bloque de inyección de ruido de etiquetas (10% de transacciones con categoría permutada al azar) que imponía un techo artificial al clasificador.

2. **Ampliación léxica y adaptaciones implementadas**:
   * **Integración del corpus regional**: Se unificaron 2.671 comercios de América Latina (extraídos de los 200 archivos JSON del proyecto) y se mapearon a las 10 categorías oficiales, sin añadir columnas de país ni modificar el esquema de base de datos.
   * **Descripciones funcionales genéricas**: Se añadieron frases descriptivas en cada categoría ("compra de viveres", "consulta odontologica", "mantenimiento del inmueble", "constitucion plazo fijo", etc.).
   * **Prefijos transaccionales bancarios**: Se implementó una distribución probabilística de prefijos reales (`debito `, `transferencia a `, `pago `, `cargo por `, `pos `, `consumo `) y se eliminó la sustitución arbitraria de letras (`replace('a', 'q')`), alcanzando un vocabulario final de **2.961 términos únicos**.
   * **Desactivación del ruido de etiquetas**: Se comentaron las líneas de permutación de categorías en `1_simulation.ipynb`.

3. **Calibración y resolución de convergencia en `3_training.ipynb`**:
   * **Ponderación de clases**: Se incorporó `class_weight='balanced'` en `LogisticRegression` para preservar el recall de categorías con menor volumen transaccional.
   * **Ampliación de la grilla de búsqueda**: Se amplió `GridSearchCV` a `max_features: [2000, 3000, 4000]`, bigramas `ngram_range: [(1, 1), (1, 2)]` y filtros de frecuencia `max_df: [0.75, 0.85]`, totalizando 36 combinaciones y 108 entrenamientos internos con `cv=3`.
   * **Eliminación de `ConvergenceWarning`**: Se establecieron los parámetros `max_iter=1000` y `tol=1e-3` en el optimizador L-BFGS, garantizando convergencia matemática estable y reduciendo el tiempo de ajuste a 48 segundos.

4. **Resultados empíricos obtenidos**:
   * **Exactitud en Validación Cruzada (`GridSearchCV`)**: **98.65%** (parámetros óptimos: `max_features=4000`, `C=1.0`, unigramas).
   * **Exactitud en Test Set**: **98.0% - 99.0%** (F1-score ponderado de 0.99).
   * **Generalización en términos ciegos no vistos (80 casos)**: Subió de **56.2% a 72.5% (+16.3 puntos porcentuales)**.
   * **Desglose de generalización por categoría**:
     * Salud: **100.0%** (8/8)
     * Inversión: **87.5%** (7/8)
     * Servicios: **87.5%** (7/8)
     * Electrodomésticos: **87.5%** (7/8)
     * Alimentación: **75.0%** (6/8)
     * Transporte: **75.0%** (6/8)
     * Vivienda: **75.0%** (6/8)
     * Educación: **62.5%** (5/8)
     * Ocio: **50.0%** (4/8)
     * Vestimenta: **25.0%** (2/8)

5. **Gobernanza de metadatos y serialización**:
   * **`shared-models/modelo_transacciones.onnx`**: Actualizado a 233.9 KB (231.2 KB base 10), con entrada `string_input` (`String[1][1]`) y salida `output_label` (`String`).
   * **`shared-models/modelo_perfil.onnx`**: Serializado en 1.17 KB, con entrada `float_input` (`float[1][3]`) y salida `output_label` (`String`).
   * **`shared-models/metadata.json`**: Versión 2.0.0 sincronizada con las 10 categorías y los 3 perfiles oficiales para consumo directo de Spring Boot.

---

### D. Backend: Módulo de Resumen Mensual, Historial de Sueldo y Migración Flyway `V7`

1. **Migración Flyway `V7__Creacion-tablas-historialsueldo-y-resumenmensual.sql`**:
   * Se crearon las tablas `historial_sueldo` (para auditoría de cambios salariales con `sueldo_anterior`, `sueldo_nuevo`, `fecha_modificacion`) y `resumen_mensual` (con `anio`, `mes`, `sueldo_base`, `sobrante_mes_anterior`, `gastado_en_el_mes`, `sobrante_final`).
2. **Servicios y Tareas Programadas (*Schedulers*)**:
   * Se incorporó `ResumenMensualService` y la infraestructura en `infra/scheduler/` para el cálculo automático y cierre contable mensual del balance de los usuarios.
3. **Validación de Usuarios**:
   * Se integró `UsuarioValidacionService` para centralizar las reglas de negocio en la gestión de perfiles e ingresos.

---

### E. Frontend: Mejoras en Vistas de Análisis, Dashboard y Transacciones

1. **Gestión de Análisis Financiero (`views/AnalisisView.vue` y `stores/analisisFinanciero.js`)**:
   * Optimización del flujo reactivo para solicitar el análisis mensual y renderizar recomendaciones personalizadas junto a los indicadores de salud financiera.
2. **Dashboard y Formato (`views/DashboardView.vue`, `utils/formato.js`)**:
   * Actualización del formateo numérico y de divisas para consistencia regional, junto al refresco automático de métricas e historial de transacciones.




