# Plan de Implementación: Frankfurter v2 Transaction Conversion

## Visión General

Migrar el servicio de divisas de Frankfurter API v1 (endpoint muerto) a v2, adaptando la transformación de la respuesta (array → mapa) y añadiendo guards defensivos en la función `convertirMonedaAUSD` del store. Se incluyen property-based tests con fast-check para validar las 8 propiedades de corrección del diseño.

## Tareas

- [x] 1. Actualizar el servicio de divisas con endpoint v2 y transformación
  - [x] 1.1 Implementar `transformarRespuestaV2` y actualizar `obtenerTasasDeCambio` en `src/services/divisas.js`
    - Cambiar `FRANKFURTER_URL` a `https://api.frankfurter.dev/v2/rates`
    - Agregar constante `TIMEOUT_MS = 10000`
    - Crear función exportada `transformarRespuestaV2(entradas)` que convierte array v2 a mapa `{ quote: rate }`, excluyendo entradas donde `quote === base` y aplicando last-wins para duplicados
    - Actualizar `obtenerTasasDeCambio()` para usar el timeout y llamar a `transformarRespuestaV2(data)` en lugar de `data.rates`
    - _Requisitos: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4_

  - [x] 1.2 Escribir property test para transformación array-a-mapa (Propiedad 1)
    - **Propiedad 1: Transformación array-a-mapa preserva datos (last-wins)**
    - Generar arrays arbitrarios de `{ date, base, quote, rate }` con posibles duplicados de `quote`
    - Verificar que el mapa resultante contiene exactamente una entrada por cada `quote` distinto, con el `rate` de la última ocurrencia
    - Archivo: `src/services/__tests__/divisas.pbt.spec.js`
    - **Valida: Requisitos 2.1, 2.4**

  - [x] 1.3 Escribir property test para exclusión de moneda base (Propiedad 2)
    - **Propiedad 2: Exclusión de la moneda base del mapa**
    - Generar arrays que incluyan objetos donde `quote === base` (e.g., `quote: "USD"`)
    - Verificar que el mapa resultante nunca contiene la clave de la moneda base
    - Archivo: `src/services/__tests__/divisas.pbt.spec.js`
    - **Valida: Requisito 2.2**

- [x] 2. Agregar guard defensivo en `convertirMonedaAUSD` del store
  - [x] 2.1 Modificar `convertirMonedaAUSD` en `src/stores/divisa.js`
    - Agregar guard para monto inválido (no finito positivo) → retornar 0
    - Mantener shortcut para `codigoMoneda === 'USD'` → retornar monto
    - Agregar guard para tasa no encontrada o <= 0 → retornar monto original
    - Solo si pasa todos los guards: retornar `monto / tasa`
    - _Requisitos: 6.1, 6.2, 6.3, 6.4_

  - [x] 2.2 Escribir property test para fórmula de conversión a USD (Propiedad 3)
    - **Propiedad 3: Fórmula de conversión a USD**
    - Para todo monto positivo y tasa activa positiva, verificar `convertirAUSD(monto) === monto / tasaActiva`
    - Archivo: `src/stores/__tests__/divisa.pbt.spec.js`
    - **Valida: Requisito 3.1**

  - [x] 2.3 Escribir property test para round-trip de conversión USD (Propiedad 4)
    - **Propiedad 4: Round-trip de conversión USD**
    - Para todo monto positivo y tasa positiva, verificar `|convertirDesdeUSD(convertirAUSD(monto)) - monto| < 1e-10`
    - Archivo: `src/stores/__tests__/divisa.pbt.spec.js`
    - **Valida: Requisito 3.4**

  - [x] 2.4 Escribir property test para seguridad numérica en estado de error (Propiedad 5)
    - **Propiedad 5: Seguridad numérica en estado de error**
    - Configurar store con `tasas = {}` y `error = true`
    - Para todo valor de entrada (0, negativos, extremos), verificar que `convertirDesdeUSD`, `convertirAUSD` y `convertirMonedaAUSD` retornan `Number.isFinite(resultado) === true`
    - Archivo: `src/stores/__tests__/divisa.pbt.spec.js`
    - **Valida: Requisitos 5.2, 5.3**

  - [x] 2.5 Escribir property test para conversión stateless por código válido (Propiedad 6)
    - **Propiedad 6: Conversión stateless por código válido**
    - Para todo monto positivo y código existente en tasas con tasa > 0, verificar `convertirMonedaAUSD(monto, codigo) === monto / tasas[codigo]` sin alterar `monedaActiva`
    - Archivo: `src/stores/__tests__/divisa.pbt.spec.js`
    - **Valida: Requisito 6.1**

  - [x] 2.6 Escribir property test para fallback de código inexistente (Propiedad 7)
    - **Propiedad 7: Fallback seguro para código inexistente**
    - Para todo monto positivo y string que no existe en tasas (incluyendo `undefined`, cadena vacía), verificar que retorna monto original sin `NaN`, `Infinity` ni excepción
    - Archivo: `src/stores/__tests__/divisa.pbt.spec.js`
    - **Valida: Requisito 6.3**

  - [x] 2.7 Escribir property test para guard de monto inválido (Propiedad 8)
    - **Propiedad 8: Guard de monto inválido**
    - Para todo valor que no sea número finito positivo (0, negativos, null, undefined, NaN, Infinity), verificar que `convertirMonedaAUSD(valor, cualquierCodigo)` retorna 0
    - Archivo: `src/stores/__tests__/divisa.pbt.spec.js`
    - **Valida: Requisito 6.4**

- [x] 3. Checkpoint - Verificar implementación y tests
  - Ensure all tests pass, ask the user if questions arise.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- El framework de test (vitest + fast-check) ya está configurado en el proyecto
- La interfaz pública del store no cambia — los componentes consumidores no requieren modificación
- Los property tests usan mínimo 100 iteraciones por propiedad según lo especificado en el diseño

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7"] }
  ]
}
```
