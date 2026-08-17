# Frontend de FinanceAI - Interfaz web con Vue.js 3 y Vite

Este directorio contiene la aplicación cliente de FinanceAI, desarrollada con **Vue.js 3** (utilizando la Composition API con la sintaxis `<script setup>`), **Vite**, **Pinia** y **Tailwind CSS**. Proporciona una interfaz web moderna, responsiva e interactiva que permite a los usuarios gestionar sus finanzas cotidianas, visualizar gráficos de gastos y consultar su diagnóstico de salud financiera en tiempo real.

---

## Arquitectura y estructura del código

La estructura del código fuente se organiza dentro de la carpeta `src/`:

```text
src/
├── assets/                   # Archivos estáticos, estilos globales e imágenes
├── components/               # Componentes reutilizables de la interfaz
│   ├── base/                 # Botones, campos de texto, modales y tarjetas base
│   ├── dashboard/            # Tarjetas de resumen, balance y accesos rápidos
│   ├── nav/                  # Barra de navegación superior y menús
│   └── result/               # Gráficos y tarjetas de resultados del análisis
├── composables/              # Lógica reutilizable y gestión de estado (Vue Composables)
├── router/                   # Configuración de rutas y navegación con Vue Router
├── services/                 # Llamadas HTTP con Axios y clientes de APIs externas
├── stores/                   # Estado global con Pinia (datos del usuario autenticado)
├── views/                    # Vistas completas de la aplicación (páginas)
├── App.vue                   # Componente raíz de la aplicación
└── main.js                   # Punto de entrada principal y registro de plugins
```

---

## Vistas principales de la aplicación

* **Inicio de sesión y registro (`LoginView.vue`)**: Pantalla donde el usuario puede registrar una nueva cuenta indicando su ingreso mensual estimado o iniciar sesión con sus credenciales.
* **Panel principal (`DashboardView.vue`)**: Resumen financiero general que muestra el balance disponible, el total de ingresos y gastos del periodo y accesos rápidos a las funciones principales.
* **Gestión de transacciones (`TransaccionesView.vue`)**: Formulario para cargar nuevos movimientos (ingresos y gastos), junto con una tabla interactiva para filtrar transacciones por rango de fechas y visualizar las categorías asignadas.
* **Diagnóstico financiero (`AnalisisView.vue` y `ResultadoView.vue`)**: Módulo que envía las transacciones registradas al backend para procesar el perfil económico del usuario. Muestra gráficos de distribución de gastos por categoría (mediante Chart.js), una insignia de estado ("Saludable", "En observación" o "En riesgo") y una lista de recomendaciones prácticas personalizadas.

---

## Módulos y servicios de soporte

### 1. Gestión de estado y autenticación (`useUsuario.js`)
Administra los datos de la sesión actual, almacenando el nombre del usuario, su identificador único y el token de sesión generado por el backend al iniciar sesión.

### 2. Conversión de divisas (`useDivisas.js`)
Permite visualizar los montos en distintas monedas consultando las cotizaciones actualizadas a través del servicio público de la API de Frankfurter v2 (`https://api.frankfurter.dev/v2/rates`). Si la conexión a internet falla o el servicio no responde, el componente cuenta con un mecanismo de respaldo automático con cotizaciones de referencia para que la interfaz siga funcionando sin interrupciones.

### 3. Comunicación con el backend (Axios y Proxy de Vite)
Las peticiones HTTP hacia el backend se realizan a través de rutas relativas prefijadas con `/api`. En el entorno de desarrollo y dentro de Docker, el archivo `vite.config.js` redirige estas solicitudes automáticamente hacia el servidor de Spring Boot (`http://backend:8080`).

---

## Seguridad de credenciales en el cliente

* **Transmisión de contraseñas**: En cumplimiento de las buenas prácticas de seguridad, el frontend envía la contraseña en texto plano a través del canal de comunicación hacia el endpoint `/login` o `/usuario`.
* **Cero hashing en el cliente**: No se aplica ningún algoritmo de hash en el navegador web del usuario. La responsabilidad de calcular el hash seguro (`BCrypt`) recae exclusivamente en el backend, lo cual previene ataques de retransmisión (*replay attacks*) del hash.

---

## Comandos y desarrollo local

Para trabajar directamente en la carpeta del frontend sin levantar todo el stack de Docker:

### 1. Instalar dependencias
Asegúrate de contar con Node.js versión 22 o superior instalado en tu sistema:
```bash
npm install
```

### 2. Iniciar el servidor de desarrollo
Inicia el servidor local de Vite con recarga en caliente (*Hot Module Replacement*):
```bash
npm run dev
```
La aplicación estará disponible en [http://localhost:3000](http://localhost:3000) (o en `http://localhost:8082` cuando se ejecuta dentro del contenedor de Docker Compose).

### 3. Ejecutar pruebas unitarias
La suite de pruebas automatizadas utiliza **Vitest** para validar la lógica de cálculo de divisas, validaciones de formularios y composables:
```bash
npm test
```

### 4. Compilar para producción
Genera el paquete optimizado y minificado en la carpeta `dist/`:
```bash
npm run build
```

### 5. Revisar y formatear el código
Para ejecutar los análisis estáticos de código con ESLint y Oxlint:
```bash
npm run lint
```
Y para dar formato a los archivos con Prettier:
```bash
npm run format
```
