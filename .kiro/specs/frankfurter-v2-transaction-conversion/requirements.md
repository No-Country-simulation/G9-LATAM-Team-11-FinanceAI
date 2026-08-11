# Documento de Requisitos

## Introducción

La integración con la API de Frankfurter para obtener tasas de cambio de divisas dejó de funcionar porque la URL del endpoint v1 (`https://api.frankfurter.app/latest`) retorna un error 404. La API migró a v2 con un nuevo dominio y formato de respuesta. Este feature corrige la integración actualizando el endpoint y adaptando el parseo de la respuesta, garantizando que las transacciones se conviertan correctamente a USD antes de enviarse al backend.

## Glosario

- **Servicio_Divisas**: Módulo del frontend (`src/services/divisas.js`) responsable de comunicarse con la API externa de Frankfurter y retornar tasas de cambio.
- **Store_Divisa**: Store de Pinia (`src/stores/divisa.js`) que almacena las tasas, gestiona la moneda activa del usuario y expone funciones de conversión.
- **Frankfurter_API_v2**: API pública de tasas de cambio disponible en `https://api.frankfurter.dev/v2/rates`.
- **Mapa_de_Tasas**: Objeto JavaScript de tipo `Record<string, number>` con formato `{ "EUR": 0.92, "GBP": 0.79, ... }` donde la clave es el código ISO de la moneda y el valor es la tasa respecto a USD.
- **Formulario_Transaccion**: Componente Vue (`FormularioTransaccion.vue`) donde el usuario registra gastos en su moneda local.
- **Conversion_a_USD**: Proceso de dividir un monto en moneda local entre la tasa correspondiente para obtener el equivalente en USD.

## Requisitos

### Requisito 1: Actualización del Endpoint de la API

**User Story:** Como desarrollador, quiero que el Servicio_Divisas use la URL correcta de Frankfurter v2, para que las tasas de cambio se obtengan exitosamente sin errores 404.

#### Criterios de Aceptación

1. THE Servicio_Divisas SHALL realizar peticiones HTTP GET al endpoint `https://api.frankfurter.dev/v2/rates` con el parámetro `base=USD`.
2. WHEN la Frankfurter_API_v2 responde con un HTTP 200 que contiene un array de objetos de tasas en el cuerpo JSON, THE Servicio_Divisas SHALL procesarlo y retornarlo como un Mapa_de_Tasas (Record<string, number> con al menos una entrada de moneda).
3. IF la Frankfurter_API_v2 retorna un código HTTP distinto a 200 o la conexión falla, THEN THE Servicio_Divisas SHALL re-lanzar la excepción sin transformarla para que el Store_Divisa la gestione.
4. IF la Frankfurter_API_v2 no responde dentro de 10 segundos, THEN THE Servicio_Divisas SHALL abortar la petición y lanzar una excepción de timeout.

### Requisito 2: Transformación de la Respuesta v2

**User Story:** Como desarrollador, quiero que el Servicio_Divisas transforme el formato de respuesta de v2 (array de objetos) al Mapa_de_Tasas esperado por el Store_Divisa, para que el resto de la aplicación funcione sin cambios.

#### Criterios de Aceptación

1. WHEN la Frankfurter_API_v2 responde con un array de objetos con formato `[{ "date", "base", "quote", "rate" }, ...]`, THE Servicio_Divisas SHALL transformar el array en un Mapa_de_Tasas donde cada clave es el valor del campo `quote` y cada valor es el campo numérico `rate`, produciendo exactamente una entrada por cada código `quote` distinto presente en el array (si existen duplicados, la última entrada del array prevalece).
2. THE Servicio_Divisas SHALL excluir del Mapa_de_Tasas resultante toda entrada cuyo campo `quote` sea igual al campo `base` (USD).
3. WHEN la Frankfurter_API_v2 responde con un array vacío (longitud 0), THE Servicio_Divisas SHALL retornar un Mapa_de_Tasas vacío (objeto sin propiedades).
4. FOR EACH objeto incluido en el Mapa_de_Tasas resultante, THE Servicio_Divisas SHALL garantizar que `mapaDeTasas[objeto.quote] === objeto.rate` (igualdad estricta numérica, sin pérdida de precisión por coerción de tipo).

### Requisito 3: Conversión de Transacciones a USD

**User Story:** Como usuario, quiero que mis gastos ingresados en moneda local se conviertan correctamente a USD antes de guardarse, para que mi información financiera sea consistente independientemente de la moneda de visualización.

#### Criterios de Aceptación

1. WHEN el usuario registra una transacción en el Formulario_Transaccion con un monto mayor a 0 y la moneda activa distinta de USD, THE Store_Divisa SHALL convertir el monto de la moneda activa a USD dividiendo el monto entre la tasa activa (que debe ser un número mayor a 0).
2. IF la moneda activa es USD, THEN THE Store_Divisa SHALL retornar el monto sin modificación (la tasa activa es 1).
3. IF la tasa activa para la moneda seleccionada no está disponible (tasas vacías o moneda sin tasa registrada), THEN THE Store_Divisa SHALL usar un valor por defecto de 1 y el Store_Divisa SHALL tener el estado de error en verdadero, indicando que la conversión no pudo realizarse con una tasa real.
4. FOR ALL montos positivos y tasas positivas, `convertirDesdeUSD(convertirAUSD(monto))` SHALL retornar un valor igual al monto original con una diferencia absoluta menor a 1e-10 (tolerancia de punto flotante para la propiedad round-trip de conversión).

### Requisito 4: Compatibilidad de la Interfaz Pública del Store

**User Story:** Como desarrollador, quiero que la interfaz pública del Store_Divisa permanezca sin cambios, para que los componentes que consumen las tasas no requieran modificaciones.

#### Criterios de Aceptación

1. THE Store_Divisa SHALL exponer las propiedades `tasas`, `monedaActiva`, `cargando`, `error`, `monedasDisponibles` y `tasaActiva` con los mismos tipos y comportamientos actuales.
2. THE Store_Divisa SHALL exponer las funciones `cargarTasas`, `seleccionarMoneda`, `convertirDesdeUSD`, `convertirAUSD` y `convertirMonedaAUSD` con las mismas firmas actuales.
3. WHEN la carga de tasas falla, THE Store_Divisa SHALL establecer `tasas` como un objeto vacío y `error` como `true`.

### Requisito 5: Manejo de Errores y Resiliencia

**User Story:** Como usuario, quiero que la aplicación maneje gracefully los fallos de la API de tasas, para que pueda seguir usándola aunque las tasas no estén disponibles.

#### Criterios de Aceptación

1. IF la Frankfurter_API_v2 no está disponible o retorna un error (fallo de red, timeout, o código de respuesta distinto a 2xx), THEN THE Store_Divisa SHALL establecer `tasas` como objeto vacío `{}`, establecer `error` en `true`, y usar un factor de conversión de 1 para todas las operaciones de conversión (fallback sin conversión).
2. WHILE el Store_Divisa tiene `error` en `true`, THE Store_Divisa SHALL retornar valores numéricos válidos (no `undefined`, `NaN`, ni `Infinity`) desde las funciones `convertirDesdeUSD`, `convertirAUSD` y `convertirMonedaAUSD`, aplicando el factor de conversión de fallback (1) para que el usuario pueda continuar registrando transacciones.
3. WHEN el Store_Divisa tiene `tasas` vacío y el usuario selecciona una moneda distinta a USD, THE Store_Divisa SHALL computar `tasaActiva` como 1 (fallback) y `convertirMonedaAUSD` SHALL usar el factor 1 para la moneda solicitada, en lugar de retornar `undefined` o `NaN`.
4. WHILE el Store_Divisa tiene `error` en `true`, THE Store_Divisa SHALL exponer el estado `error` como `true` para que la capa de UI pueda mostrar una indicación visual al usuario de que las tasas de cambio no están disponibles.
5. WHEN el usuario invoca `cargarTasas` después de un fallo previo y la Frankfurter_API_v2 responde exitosamente, THEN THE Store_Divisa SHALL reemplazar el objeto `tasas` con las tasas recibidas, establecer `error` en `false`, y las funciones de conversión SHALL usar las tasas reales en lugar del factor de fallback.

### Requisito 6: Conversión Stateless por Código de Moneda

**User Story:** Como usuario en el formulario de registro, quiero que mi ingreso mensual se convierta a USD usando el código de moneda que seleccioné, para que mi perfil almacene el valor correcto independientemente de la moneda elegida.

#### Criterios de Aceptación

1. WHEN se invoca `convertirMonedaAUSD` con un monto numérico mayor que 0 y un código de moneda de 3 letras mayúsculas que existe en el Mapa_de_Tasas con una tasa mayor que 0, THE Store_Divisa SHALL retornar el resultado de dividir el monto entre la tasa correspondiente a ese código, sin modificar el estado de `monedaActiva`.
2. WHEN se invoca `convertirMonedaAUSD` con el código "USD", THE Store_Divisa SHALL retornar el monto sin modificación ni cálculo alguno, independientemente del contenido del Mapa_de_Tasas.
3. IF se invoca `convertirMonedaAUSD` con un código de moneda que no existe como clave en el Mapa_de_Tasas (incluyendo `undefined` o cadena vacía), THEN THE Store_Divisa SHALL retornar el monto original sin modificación, sin producir `NaN`, `Infinity` ni lanzar una excepción.
4. IF se invoca `convertirMonedaAUSD` con un monto que no es un número finito positivo (por ejemplo 0, negativo, `null` o `undefined`), THEN THE Store_Divisa SHALL retornar 0.
