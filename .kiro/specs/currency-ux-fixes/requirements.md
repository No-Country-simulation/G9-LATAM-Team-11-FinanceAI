# Bugfix Requirements: currency-ux-fixes

## Introducción

Se reportaron 3 bugs relacionados con la funcionalidad de conversión de divisas y la experiencia de usuario del selector de moneda. El primer bug causa que la validación de monto en el formulario de transacciones rechace gastos válidos al comparar moneda local contra USD sin conversión. El segundo bug muestra 30+ monedas en el selector cuando solo las principales son relevantes para usuarios LATAM. El tercero es un problema de layout donde el selector de moneda está apilado con el nombre de usuario y botón "Salir" en el header.

## Glosario

- **monedaActiva**: La moneda seleccionada por el usuario para visualización (e.g., CLP, USD, EUR)
- **ingresoDisponible**: Ingreso mensual del usuario almacenado en USD en el backend
- **tasaActiva**: Tasa de cambio de la moneda activa respecto a USD
- **whitelist**: Lista predefinida de monedas principales permitidas en el selector
- **convertirDesdeUSD**: Función del store de divisa que multiplica un monto en USD por la tasaActiva

## Requisitos

### Requisito 1: Validación de monto debe considerar conversión de moneda

**User Story:** Como usuario, quiero que la validación del formulario de gastos compare correctamente mi monto en moneda local contra mi ingreso disponible convertido a la misma moneda, para que no me rechace gastos que sí puedo costear.

**Comportamiento observado:** Al registrar un gasto de 15000 CLP, el formulario muestra "El monto debe ser menor que tu ingreso disponible" aunque el ingreso disponible (~CLP 498,473) es mayor que 15000 CLP.

**Causa raíz:** En `FormularioTransaccion.vue`, la función `validar()` compara `form.monto >= ingresoDisponible.value` directamente. El `ingresoDisponible` está almacenado en USD (del backend), pero `form.monto` está en la moneda activa (CLP). Cuando CLP está seleccionado, 15000 (CLP) se compara contra ~500 (USD). 15000 > 500 → falla la validación incorrectamente.

**Condición del bug:** La validación falla cuando `form.monto` en moneda local > `ingresoDisponible` en USD, incluso si el monto convertido a USD < ingresoDisponible.

#### Criterios de Aceptación

1. WHEN el usuario ingresa un monto en la moneda activa, THEN la validación SHALL comparar el monto contra `convertirDesdeUSD(ingresoDisponible)` en lugar de comparar directamente contra `ingresoDisponible` en USD.
2. WHEN la moneda activa es USD, THEN la comparación SHALL ser directa (sin conversión) ya que ambos valores están en USD.
3. WHEN el monto convertido a USD es menor que ingresoDisponible, THEN la validación SHALL permitir el registro del gasto.
4. WHEN el monto convertido a USD es mayor o igual a ingresoDisponible, THEN la validación SHALL mostrar el mensaje de error.

### Requisito 2: Selector de moneda debe mostrar solo monedas principales

**User Story:** Como usuario latinoamericano, quiero ver solo las monedas principales del mundo en el selector, para encontrar rápidamente mi moneda sin buscar entre 30+ opciones.

**Comportamiento observado:** El selector de moneda muestra TODAS las monedas que retorna Frankfurter (30+), dificultando encontrar las relevantes.

**Causa raíz:** `monedasDisponibles` en el store de divisa simplemente retorna `Object.keys(tasas.value)` sin filtrar.

#### Criterios de Aceptación

1. THE selector de moneda SHALL mostrar únicamente las siguientes monedas: USD, EUR, GBP, JPY, CLP, ARS, BRL, MXN, CAD, AUD, CNY, CHF, COP, PEN.
2. THE computed `monedasDisponibles` SHALL filtrar las tasas cargadas del API para retornar solo las monedas de la whitelist que tengan tasa disponible.
3. WHEN la moneda activa del usuario no está en la whitelist, THEN el store SHALL hacer fallback a USD.
4. THE lista de monedas SHALL estar ordenada alfabéticamente.

### Requisito 3: Selector de moneda debe reubicarse fuera del área de usuario

**User Story:** Como usuario, quiero que el selector de moneda tenga más espacio visual y no esté apilado con mi nombre y el botón de cerrar sesión, para una mejor experiencia de navegación.

**Comportamiento observado:** El selector está en el mismo div que el nombre de usuario y botón "Salir", todo queda muy apilado y comprimido.

**Comportamiento deseado:** Mover el selector a la zona de navegación central (junto a Dashboard, Transacciones, Análisis) para darle más espacio visual.

#### Criterios de Aceptación

1. THE componente SelectorMoneda SHALL ubicarse en la zona de navegación central del header (junto a los enlaces Dashboard, Transacciones, Análisis).
2. THE área derecha del header SHALL contener solamente el nombre del usuario y el botón "Salir".
3. THE selector SHALL estar visible solo cuando el usuario tiene sesión activa.
4. THE selector SHALL estar oculto en móviles al igual que los enlaces de navegación (`hidden md:flex`).

## Propiedades de Correctitud

### Propiedad 1: Consistencia de validación con conversión
Para todo monto M en moneda activa y todo ingresoDisponible I en USD: la validación acepta M si y solo si `M / tasaActiva < I` (equivalente a `M < I * tasaActiva`).

### Propiedad 2: Whitelist de monedas es subconjunto de tasas disponibles
Para toda lista retornada por `monedasDisponibles`: cada código pertenece a la whitelist Y tiene tasa > 0 en el store (excepto USD que siempre se incluye).

### Propiedad 3: Independencia del selector respecto al área de usuario
El componente SelectorMoneda no es descendiente del div que contiene el nombre de usuario y botón "Salir".
