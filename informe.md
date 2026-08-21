# Informe de Estado y Correcciones Técnicas por Rol - FinanceAI

**Fecha:** 17 de agosto de 2026  
**Destinatarios:** Equipo de Desarrollo (DevOps, Backend, Frontend, Data Science)  
**Resumen:** Este documento consolida el estado del MVP, los problemas identificados y las correcciones técnicas aplicadas e integradas en esta sesión para estabilizar el sistema e interoperar los modelos de Inteligencia Artificial (ONNX) con Spring Boot y Vue 3.

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

