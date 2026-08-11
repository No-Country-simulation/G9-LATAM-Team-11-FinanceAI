# Design Document: Currency Conversion

## Architecture Overview

The currency conversion feature follows the existing frontend architecture: a dedicated service for API calls, a Pinia store for state management, and composable/utility integration for conversion logic. The feature introduces three new modules and modifies two existing ones.

```
┌────────────────────────────────┐
│        CurrencySelector        │  (new component in AppNav)
└────────────┬───────────────────┘
             │ reads/writes
┌────────────▼───────────────────┐
│        useDivisaStore          │  (new Pinia store)
│  - monedaActiva                │
│  - tasas (rates map)           │
│  - cargando (loading)          │
│  - monedasDisponibles          │
│  - convertirDesdeUSD(monto)    │
│  - convertirAUSD(monto)        │
└──────┬─────────────────┬───────┘
       │ init             │ used by
┌──────▼──────┐   ┌──────▼───────────────────┐
│ divisas.js  │   │ formato.js (modified)     │
│ (service)   │   │ FormularioTransaccion.vue │
└─────────────┘   └──────────────────────────┘
```

## Components

### 1. CurrencyService — `services/divisas.js`

Responsible for fetching exchange rates from the Frankfurter API. Uses a separate axios instance (no auth headers needed) since this is a public external API unrelated to the backend.

```javascript
import axios from 'axios'

const FRANKFURTER_URL = 'https://frankfurter.dev/v1/latest'

/**
 * Fetches latest exchange rates with USD as base currency.
 * @returns {Promise<Record<string, number>>} Map of currency code → rate
 */
export async function obtenerTasasDeCambio() {
  const { data } = await axios.get(FRANKFURTER_URL, {
    params: { base: 'USD' },
  })
  return data.rates
}
```

### 2. CurrencyStore — `stores/divisa.js`

Pinia store using the composition API pattern (matching `auth.js` and `usuario.js`). Manages exchange rates, active currency, loading state, and provides conversion utilities.

```javascript
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { obtenerTasasDeCambio } from '@/services/divisas'

const CLAVE_MONEDA = 'financeai:moneda'

export const useDivisaStore = defineStore('divisa', () => {
  const tasas = ref({})
  const monedaActiva = ref(localStorage.getItem(CLAVE_MONEDA) || 'USD')
  const cargando = ref(false)
  const error = ref(false)

  const monedasDisponibles = computed(() => {
    const codigos = Object.keys(tasas.value)
    if (!codigos.includes('USD')) codigos.unshift('USD')
    return codigos.sort()
  })

  const tasaActiva = computed(() => {
    if (monedaActiva.value === 'USD') return 1
    return tasas.value[monedaActiva.value] ?? 1
  })

  async function cargarTasas() {
    cargando.value = true
    error.value = false
    try {
      tasas.value = await obtenerTasasDeCambio()
    } catch {
      tasas.value = {}
      error.value = true
    } finally {
      cargando.value = false
    }
  }

  function seleccionarMoneda(codigo) {
    monedaActiva.value = codigo
    localStorage.setItem(CLAVE_MONEDA, codigo)
  }

  function convertirDesdeUSD(monto) {
    return monto * tasaActiva.value
  }

  function convertirAUSD(monto) {
    return monto / tasaActiva.value
  }

  return {
    tasas,
    monedaActiva,
    cargando,
    error,
    monedasDisponibles,
    tasaActiva,
    cargarTasas,
    seleccionarMoneda,
    convertirDesdeUSD,
    convertirAUSD,
  }
})
```

### 3. CurrencySelector — `components/nav/SelectorMoneda.vue`

A `<select>` dropdown rendered in AppNav. Reads from and writes to `useDivisaStore`.

```vue
<script setup>
import { storeToRefs } from 'pinia'
import { useDivisaStore } from '@/stores/divisa'

const divisaStore = useDivisaStore()
const { monedaActiva, monedasDisponibles, cargando } = storeToRefs(divisaStore)

function cambiar(event) {
  divisaStore.seleccionarMoneda(event.target.value)
}
</script>

<template>
  <label class="sr-only" for="selector-moneda">Moneda</label>
  <select
    id="selector-moneda"
    :value="monedaActiva"
    :disabled="cargando"
    class="rounded border border-edge bg-surface px-2 py-1 text-xs font-mono text-muted"
    @change="cambiar"
  >
    <option v-if="cargando" value="USD">USD</option>
    <option v-for="codigo in monedasDisponibles" :key="codigo" :value="codigo">
      {{ codigo }}
    </option>
  </select>
</template>
```

### 4. Modified — `utils/formato.js`

The `formatoMoneda` function gains awareness of the active currency. It imports the store to get the active rate and currency code, applies conversion, and uses `Intl.NumberFormat` for locale-aware symbol display.

```javascript
import { useDivisaStore } from '@/stores/divisa'

export function formatoMoneda(monto, fracciones = 2) {
  const divisaStore = useDivisaStore()
  const valor = Number(monto) || 0
  const convertido = divisaStore.convertirDesdeUSD(valor)
  const moneda = divisaStore.monedaActiva

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: moneda,
    minimumFractionDigits: fracciones,
    maximumFractionDigits: fracciones,
  }).format(convertido)
}
```

### 5. Modified — `components/dashboard/FormularioTransaccion.vue`

Before submitting a transaction, the entered amount is converted from active currency to USD using `convertirAUSD()`. A label shows the active currency code next to the amount input.

Key change in the `enviar()` function:

```javascript
const divisaStore = useDivisaStore()

async function enviar() {
  // ... validation ...
  const montoUSD = divisaStore.convertirAUSD(form.monto)
  await crearTransaccion({
    descripcion: form.descripcion.trim(),
    monto: montoUSD,
    categoria: form.categoria,
    fecha: form.fecha,
  })
  // ...
}
```

## Interfaces

### CurrencyService API

| Function | Parameters | Returns |
|----------|-----------|---------|
| `obtenerTasasDeCambio()` | none | `Promise<Record<string, number>>` — e.g. `{ EUR: 0.92, GBP: 0.79, ... }` |

### CurrencyStore (useDivisaStore)

| Member | Type | Description |
|--------|------|-------------|
| `tasas` | `Ref<Record<string, number>>` | Raw rates map from API |
| `monedaActiva` | `Ref<string>` | Active ISO currency code |
| `cargando` | `Ref<boolean>` | True while fetching rates |
| `error` | `Ref<boolean>` | True if fetch failed |
| `monedasDisponibles` | `ComputedRef<string[]>` | Sorted list of available codes (always includes USD) |
| `tasaActiva` | `ComputedRef<number>` | Current rate for active currency (1 for USD) |
| `cargarTasas()` | `() => Promise<void>` | Fetches rates, updates state |
| `seleccionarMoneda(codigo)` | `(string) => void` | Sets active currency, persists to localStorage |
| `convertirDesdeUSD(monto)` | `(number) => number` | Multiplies by active rate |
| `convertirAUSD(monto)` | `(number) => number` | Divides by active rate |

### LocalStorage Keys

| Key | Value | Purpose |
|-----|-------|---------|
| `financeai:moneda` | ISO 4217 code string (e.g., `"EUR"`) | Persists currency preference |

## Data Models

### Exchange Rates (Frankfurter API response)

```typescript
interface FrankfurterResponse {
  base: string         // "USD"
  date: string         // "2024-01-15"
  rates: Record<string, number>  // { "EUR": 0.92, "GBP": 0.79, ... }
}
```

### Store State

```typescript
interface DivisaState {
  tasas: Record<string, number>   // currency code → rate relative to USD
  monedaActiva: string            // active ISO code
  cargando: boolean               // loading flag
  error: boolean                  // fetch failure flag
}
```

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Frankfurter API timeout/network error | `tasas` stays empty, `error` set to true, `tasaActiva` returns 1, all amounts display in USD |
| Frankfurter API returns invalid JSON | Same as network error (axios will throw) |
| Active currency not found in tasas map | `tasaActiva` falls back to 1, amounts show unconverted |
| localStorage unavailable | `monedaActiva` defaults to `'USD'`, preference not persisted (graceful degradation) |
| Division by zero in convertirAUSD | Impossible — `tasaActiva` returns `tasas[code] ?? 1`, so minimum value is rates from ECB (always > 0) |

## Initialization Flow

1. App mounts (`App.vue` or router guard)
2. `useDivisaStore().cargarTasas()` is called once
3. Store reads `localStorage('financeai:moneda')` → sets `monedaActiva`
4. Store sets `cargando = true`, fetches from Frankfurter API
5. On success: `tasas` populated, `cargando = false`
6. On failure: `tasas = {}`, `error = true`, `cargando = false`
7. All components reactively use `tasaActiva` for conversion

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Currency preference round-trip via localStorage

*For any* valid currency code that exists in the available currencies list, saving it via `seleccionarMoneda(codigo)` and then initializing a new store instance should result in `monedaActiva` being equal to the saved code.

**Validates: Requirements 2.1, 2.2, 2.4**

### Property 2: Rate map storage preserves all entries

*For any* valid rates map returned by the Frankfurter API (a non-empty object of string→positive number entries), after `cargarTasas()` completes successfully, the store's `tasas` object should contain every key-value pair from the API response without modification.

**Validates: Requirements 1.2**

### Property 3: Available currencies equals API currencies plus USD

*For any* rates map loaded into the store (including an empty map), `monedasDisponibles` should contain exactly the set of currency codes from the rates map keys unioned with `{'USD'}`, and no other codes.

**Validates: Requirements 6.1, 6.2**

### Property 4: Display conversion applies multiplication by rate

*For any* USD amount and *for any* active currency with a known positive exchange rate `r`, `convertirDesdeUSD(amount)` should return a value equal to `amount * r`.

**Validates: Requirements 4.1**

### Property 5: Input conversion applies division by rate

*For any* local currency amount and *for any* active currency with a known positive exchange rate `r`, `convertirAUSD(amount)` should return a value equal to `amount / r`.

**Validates: Requirements 5.1**

### Property 6: Conversion round-trip preserves value

*For any* positive USD amount and *for any* active currency with rate `r > 0`, converting from USD to local (`amount * r`) and then back to USD (`result / r`) should produce a value equal to the original amount (within floating-point tolerance).

**Validates: Requirements 4.1, 5.1**

### Property 7: FormatoMoneda displays active currency identifier

*For any* active currency code in the available currencies list, the output of `formatoMoneda(amount)` should contain either the ISO currency code or the locale-appropriate currency symbol for that currency.

**Validates: Requirements 4.2**

### Property 8: Selector lists all available currencies as 3-letter ISO codes

*For any* set of currencies loaded from the API, every entry in `monedasDisponibles` should be a string of exactly 3 uppercase ASCII letters conforming to ISO 4217 format.

**Validates: Requirements 3.2, 6.3**
