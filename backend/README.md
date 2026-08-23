# Backend de FinanceAI - API REST con Spring Boot y Java

Este directorio contiene el backend de FinanceAI, desarrollado en **Java 17** utilizando el framework **Spring Boot 3.2.5**. Su función es actuar como el núcleo de la aplicación: procesa las solicitudes del frontend, gestiona la persistencia en la base de datos MySQL, protege las contraseñas mediante algoritmos de cifrado y ejecuta directamente los modelos de inteligencia artificial (ONNX) para clasificar gastos y evaluar la salud financiera del usuario.

---

## Arquitectura y estructura del código

El proyecto sigue una arquitectura en capas que separa responsabilidades para facilitar el mantenimiento y la comprensión del código:

```text
src/main/java/G9_LATAM_Team_11_FinanceAI/
├── Controller/               # Capa de controladores: recibe las peticiones HTTP y devuelve respuestas en JSON
├── domain/
│   ├── Service/              # Capa de servicios: contiene la lógica de negocio, cálculos e inferencia IA
│   ├── usuario/              # Entidad JPA y modelo de datos para los usuarios
│   └── transaccion/          # Entidad JPA y modelo de datos para los movimientos de dinero
├── Repository/               # Interfaces de persistencia (Spring Data JPA) para consultar MySQL
├── DTO/                      # Objetos de transferencia de datos (Data Transfer Objects)
└── analisis_financiero/      # Entidad JPA para almacenar el historial de diagnósticos
```

### Explicación de las capas para el equipo
* **Controladores (`Controller`)**: Son la puerta de entrada de la aplicación web. Escuchan las solicitudes en rutas específicas (como `/usuario`, `/login` o `/analisis-financiero`) y devuelven respuestas con códigos de estado HTTP apropiados (`200 OK`, `201 Created`, `400 Bad Request`).
* **Servicios (`Service`)**: Es donde vive la lógica real del sistema. Por ejemplo, `AnalisisFinancieroService` calcula los porcentajes de gastos fijos y genera las recomendaciones, mientras que `DataScienceModelService` gestiona la carga de los modelos ONNX en memoria.
* **Repositorios (`Repository`)**: Interfaces que extienden de `JpaRepository`. Permiten guardar, buscar, actualizar y eliminar registros en la base de datos sin necesidad de escribir sentencias SQL manuales.
* **Objetos de transferencia (`DTO`)**: Son clases simples (definidas como `record` en Java moderno) que modelan exactamente los datos que viajan entre el frontend y el backend, evitando exponer innecesariamente las entidades internas de la base de datos.

---

## Base de datos y control de versiones con Flyway

El esquema de la base de datos no se crea de forma manual en MySQL, sino mediante **Flyway**, una herramienta de migraciones que ejecuta automáticamente los scripts SQL versionados ubicados en `src/main/resources/db/migration/` cada vez que la aplicación arranca:

* `V1__creacion-tabla-usuario.sql`: Crea la tabla `usuarios` para almacenar nombre, correo, contraseña cifrada, ingreso mensual y estado de la cuenta.
* `V2__alterar-campo-fecha-creacion-de-usuario.sql`: Ajusta la columna de auditoría temporal en la tabla de usuarios.
* `V3__creacion-tabla-transaccion.sql`: Crea la tabla `transacciones` vinculada a cada usuario, con monto, fecha, tipo de movimiento y categoría asignada.
* `V4__creacion-tabla-analisisfinanciero.sql`: Crea la tabla `analisis_financiero` para almacenar los diagnósticos de perfil ("Saludable", "En observacion", "En riesgo"), nivel de endeudamiento, nivel de ahorro y recomendaciones generadas.

> [!NOTE]
> Gracias a Flyway, todos los miembros del equipo que inicien el proyecto en Docker contarán siempre exactamente con las mismas tablas y columnas en su base de datos local.

---

## Inferencia de inteligencia artificial con ONNX Runtime

Para no depender de un servidor externo de Python en producción, el backend utiliza la librería nativa **ONNX Runtime** (`com.microsoft.onnxruntime:onnxruntime`). 

En la clase `DataScienceModelService`:
1. **Carga en memoria única**: Al iniciar la aplicación (`@PostConstruct`), se abren las sesiones de los modelos `modelo_transacciones.onnx` y `modelo_perfil.onnx`, y se lee el archivo `metadata.json` desde la carpeta configurada en `${SHARED_MODELS_PATH}`.
2. **Normalización de texto**: Antes de evaluar una descripción, se utiliza `java.text.Normalizer` para eliminar acentos y diacríticos (por ejemplo, convirtiendo "Cafetería" en "cafeteria"). Esto garantiza que el clasificador reconozca los términos correctamente.
3. **Clasificación de transacciones**: El texto normalizado se transforma en un tensor de tipo string (`string_input`) y el modelo devuelve la categoría correspondiente entre las 10 opciones disponibles.
4. **Inferencia de perfil financiero**: Se crea un vector numérico (`float_input`) con el formato `[ingreso_mensual, nivel_endeudamiento, ahorro_num]` para determinar si la situación es Saludable, En observación o En riesgo.

---

## Seguridad y cifrado de contraseñas

Por motivos de ciberseguridad:
* **Cero contraseñas en texto plano**: Cuando un usuario se registra a través de `UsuarioService`, la contraseña recibida se procesa con `BCryptPasswordEncoder` antes de guardarse en la columna `password` de MySQL.
* **Validación en el login**: Durante la autenticación en `LoginController`, el sistema recupera el usuario por correo electrónico y utiliza el método `matches(rawPassword, encodedPassword)` para comprobar la validez de las credenciales sin descifrar el hash.

---

## Catálogo de endpoints de la API

La API escucha en `http://localhost:8081` y ofrece los siguientes puntos de acceso:

### 1. Registrar un nuevo usuario
* **Método y ruta**: `POST /usuario`
* **Cuerpo de la petición (JSON)**:
  ```json
  {
    "nombre": "Ana Gomez",
    "email": "ana.gomez@example.com",
    "password": "miClaveSegura123",
    "ingresoMensual": 3500.00,
    "frecuenciaAhorro": "Alta"
  }
  ```
* **Respuesta exitosa (`201 Created`)**:
  ```json
  {
    "mensaje": "Usuario Ana Gomez registrado con éxito",
    "id": 1
  }
  ```

### 2. Iniciar sesión (Login)
* **Método y ruta**: `POST /login`
* **Cuerpo de la petición (JSON)**:
  ```json
  {
    "email": "ana.gomez@example.com",
    "password": "miClaveSegura123"
  }
  ```
* **Respuesta exitosa (`200 OK`)**:
  ```json
  {
    "id": 1,
    "nombre": "Ana Gomez",
    "email": "ana.gomez@example.com",
    "ingresoMensual": 3500.00,
    "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
  ```

### 3. Registrar una transacción
* **Método y ruta**: `POST /transaccion`
* **Cuerpo de la petición (JSON)**:
  ```json
  {
    "idUsuario": 1,
    "descripcion": "Supermercado Coto",
    "valor": 120.50,
    "fecha": "2026-08-17",
    "tipo": "Egreso"
  }
  ```
  *(Si se omite el campo `"categoria"`, el modelo NLP de ONNX la clasificará automáticamente como `Alimentacion`)*.
* **Respuesta exitosa (`201 Created`)**:
  ```json
  {
    "id": 1,
    "descripcion": "Supermercado Coto",
    "valor": 120.50,
    "categoria": "Alimentacion",
    "fecha": "2026-08-17",
    "tipo": "Egreso"
  }
  ```

### 4. Diagnóstico y análisis financiero
* **Método y ruta**: `POST /analisis-financiero`
* **Cuerpo de la petición (JSON)**:
  ```json
  {
    "idUsuario": 1,
    "ingresoMensual": 3500.00,
    "frecuenciaAhorro": "Alta",
    "transacciones": [
      { "descripcion": "Alquiler departamento", "valor": 800.00, "categoria": "Vivienda" },
      { "descripcion": "Factura de electricidad", "valor": 95.00, "categoria": "Servicios" },
      { "descripcion": "Cena restaurante", "valor": 110.00, "categoria": "Ocio" }
    ]
  }
  ```
* **Respuesta exitosa (`200 OK`)**:
  ```json
  {
    "perfil_financiero": "Saludable",
    "probabilidad": 0.88,
    "resumen_gastos": {
      "Vivienda": 800.00,
      "Servicios": 95.00,
      "Ocio": 110.00
    },
    "recomendaciones": [
      "Vivienda representa el 79% de tus gastos totales. Establece un presupuesto límite mensual para esta categoría.",
      "Tu perfil financiero es sólido y equilibrado. Evalúa destinar excedentes a instrumentos de inversión o fondos de emergencia."
    ]
  }
  ```

### 5. Consultar usuario y sus transacciones
* **Método y ruta**: `GET /usuario/{id}`
* **Respuesta exitosa (`200 OK`)**: Retorna los datos del usuario junto con la lista histórica de sus transacciones asociadas.

---

## Ejecución y desarrollo local

### Opción A: A través de Docker Compose (Recomendado)
El contenedor de backend compila y arranca automáticamente dentro de la red del proyecto:
```bash
docker compose up -d backend
```

Para ver la salida de la consola de Spring Boot:
```bash
docker compose logs -f backend
```

### Opción B: Ejecución nativa con Maven
Si dispones de Java 17 instalado en tu sistema local y la base de datos MySQL está encendida en el puerto `3307`:

En Linux o macOS:
```bash
./mvnw spring-boot:run
```

En Windows (PowerShell o CMD):
```powershell
.\mvnw.cmd spring-boot:run
```

Para ejecutar las pruebas automatizadas del backend:
```bash
./mvnw test
```
