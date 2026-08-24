# FinanceAI - Frontend Application

<div align="center">

![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4fc08d?style=for-the-badge&logo=vue.js)
![Pinia](https://img.shields.io/badge/Pinia-2.x-yellow?style=for-the-badge&logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-5.x-646cff?style=for-the-badge&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38bdf8?style=for-the-badge&logo=tailwindcss)
![Vitest](https://img.shields.io/badge/Vitest-1.x-729b1b?style=for-the-badge&logo=vitest)

**Interfaz de usuario interactiva y responsiva de FinanceAI, desarrollada como una Single Page Application (SPA) con Vue 3 y una experiencia visual premium.**

</div>

---

## 📌 Tabla de Contenidos
1. [Descripción General](#-descripción-general)
2. [Estructura del Directorio](#-estructura-del-directorio)
3. [Flujo de Datos y Estados (Pinia)](#-flujo-de-datos-y-estados-pinia)
4. [Lógica de Negocio (Composables)](#-lógica-de-negocio-composables)
5. [Estilizado y Diseño (CSS)](#-estilizado-y-diseño-css)
6. [Pruebas Unitarias](#-pruebas-unitarias)
7. [Instalación y Uso Local](#-instalación-y-uso-local)

---

## 🎨 Descripción General

La interfaz de usuario de **FinanceAI** está diseñada bajo principios modernos de UX, ofreciendo un panel financiero interactivo en modo oscuro con acabados de glassmorphism y transiciones fluidas. 

### Características Destacadas del Frontend:
* **Dashboard Analítico**: Resúmenes en tiempo real de saldo disponible, gastos mensuales, gastos fijos y ahorros acumulados.
* **Clasificación Predictiva Directa**: Los formularios interactúan con el backend para categorizar los gastos automáticamente a medida que el usuario los registra.
* **Control de Divisas Integrado**: Un selector de monedas que permite visualizar todo el dashboard y los reportes en la divisa preferida (USD, ARS, CLP, EUR, BRL, etc.) realizando la conversión de tasas al vuelo.
* **Modo Demo**: Acceso interactivo completo pre-poblado con datos simulados y variables locales para explorar la app sin necesidad de registrarse.

---

## 📂 Estructura del Directorio

El código del cliente se organiza en base a una separación clara de responsabilidades:

```text
frontend/
├── public/                 # Recursos estáticos (Logotipos, favicon.png, etc.)
├── src/
│   ├── assets/             # Hojas de estilo globales (main.css y variables base.css)
│   ├── components/         # Componentes reutilizables
│   │   ├── base/           # Componentes atómicos (Botones, Tags, cargadores)
│   │   ├── dashboard/      # Paneles, KPIs, modales y formularios de gastos
│   │   ├── nav/            # Barra de navegación, footer y menú móvil
│   │   └── result/         # Gráficos y medidores de salud financiera
│   ├── composables/        # Hooks lógicos con estado (useDashboard, useUsuario)
│   ├── layouts/            # Plantillas de estructura (AppLayout)
│   ├── router/             # Definición de rutas y Guards de seguridad (index.js)
│   ├── services/           # Clientes HTTP axios para consumo de endpoints
│   ├── stores/             # Stores de Pinia (auth, usuario, divisa)
│   ├── utils/              # Funciones auxiliares de formateo y validación
│   ├── views/              # Vistas principales de pantalla (Dashboard, Login, 404)
│   ├── App.vue             # Componente raíz del árbol de Vue
│   └── main.js             # Punto de entrada y registro de plugins
├── vite.config.js          # Configuración del servidor de desarrollo y proxy
└── package.json            # Scripts de ejecución y librerías declaradas
```

---

## 🔄 Flujo de Datos y Estados (Pinia)

La aplicación gestiona su estado de forma distribuida en tres almacenes principales:

1. **`auth.js`**:
   * Administra el token JWT de seguridad y el identificador del usuario activo.
   * Restablece de forma segura el inicio de sesión automático y el modo demo (`id: 0`) al recargar.
2. **`usuario.js`**:
   * Almacena la información de perfil (nombre, ingresos mensuales) e historial completo de transacciones y sueldos.
   * Provee los métodos para actualizar los sueldos e integrar el remanente/sobrante histórico del mes anterior.
3. **`divisa.js`**:
   * Almacena las tasas de cambio de divisas consumidas desde la API.
   * Realiza conversiones dinámicas automáticas entre cualquier par de monedas.

---

## ⚙️ Lógica de Negocio (Composables)

Extraemos la lógica compleja del componente en hooks personalizados (`composables`) con estado para facilitar su reutilización y testing:

* **`useUsuario.js`**: Controla el ciclo de vida del usuario (registro, login, deslogueo) y la carga de datos de demo o del servidor.
* **`useDashboard.js`**: Realiza los cálculos financieros agregados del mes actual (suma de gastos, cálculo de saldo disponible transaccional, remanente de ahorro y categorización mensual).
* **`useTransacciones.js`**: Orquesta la creación, edición y eliminación de gastos, coordinando la actualización de los estados en la base de datos y la recarga en Pinia.

---

## 🎨 Estilizado y Diseño (CSS)

El aspecto estético premium se logra combinando **Tailwind CSS** con estilos vanilla organizados:
* **[base.css](file:///home/iwiwih/Projects/G9-LATAM-Team-11-FinanceAI/frontend/src/assets/base.css)**: Define los tokens del sistema de diseño (colores de la paleta Neo-Onice, radios de borde, fuentes y animaciones sutiles).
* **[main.css](file:///home/iwiwih/Projects/G9-LATAM-Team-11-FinanceAI/frontend/src/assets/main.css)**: Centraliza la normalización estética de elementos nativos (como inputs, selects, calendarios y estilos para autofill o placeholders de formularios).

---

## 🧪 Pruebas Unitarias

El proyecto cuenta con un conjunto robusto de pruebas unitarias implementadas con **Vitest** y **Property-Based Testing** (`fast-check`) para asegurar que las conversiones monetarias y las operaciones de redondeo matemático mantengan una precisión absoluta ante cualquier entrada de datos:

Para ejecutar la suite de pruebas localmente:
```sh
npm run test
```

---

## 🚀 Instalación y Uso Local

Si deseas ejecutar o compilar únicamente el frontend de manera aislada (sin utilizar el orquestador principal de Docker):

### Requisitos Previos:
* Tener instalado **Node.js** (versión 20 o superior recomendado) y **npm**.

### Pasos:

1. **Instalar dependencias**:
   ```sh
   npm install
   ```

2. **Ejecutar en modo desarrollo**:
   Inicia el servidor local de Vite con Hot-Reload (por defecto en `http://localhost:3000` o mapeado al puerto expuesto):
   ```sh
   npm run dev
   ```

3. **Construir para producción**:
   Compila y optimiza la aplicación generando el bundle estático en la carpeta `dist/`:
   ```sh
   npm run build
   ```

4. **Validar formato y errores estáticos (Linting)**:
   ```sh
   npm run lint
   ```
