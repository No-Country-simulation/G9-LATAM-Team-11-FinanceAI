# Implementation Plan: Currency Conversion

## Overview

Implement multi-currency support in the FinanceAI frontend. The feature adds a currency service (Frankfurter API), a Pinia store for exchange rate state and conversion utilities, a currency selector component in the navbar, and modifications to `formatoMoneda` and `FormularioTransaccion` to apply conversions. All backend storage remains in USD; conversion is purely a frontend concern.

## Tasks

- [x] 1. Create currency service and store
  - [x] 1.1 Create `services/divisas.js` — Frankfurter API service
    - Create file `src/services/divisas.js`
    - Export async function `obtenerTasasDeCambio()` that calls `https://frankfurter.dev/v1/latest?base=USD` using a plain axios instance (no auth headers)
    - Return only the `rates` object from the response
    - _Requirements: 1.1, 1.2, 1.4_

  - [x] 1.2 Create `stores/divisa.js` — Pinia store with composition API
    - Create file `src/stores/divisa.js`
    - Define `useDivisaStore` using `defineStore('divisa', () => { ... })` pattern
    - Reactive state: `tasas` (ref, empty object), `monedaActiva` (ref, read from localStorage key `financeai:moneda` or default `'USD'`), `cargando` (ref, boolean), `error` (ref, boolean)
    - Computed: `monedasDisponibles` — sorted array of rate keys + `'USD'`; `tasaActiva` — `tasas[monedaActiva]` or 1 if USD or missing
    - Actions: `cargarTasas()` — fetches via service, sets state; `seleccionarMoneda(codigo)` — updates ref and localStorage; `convertirDesdeUSD(monto)` — multiply by `tasaActiva`; `convertirAUSD(monto)` — divide by `tasaActiva`
    - _Requirements: 1.2, 1.3, 1.5, 2.1, 2.2, 2.3, 2.4, 6.1, 6.2_

  - [x] 1.3 Write property tests for the divisa store
    - **Property 1: Currency preference round-trip via localStorage**
    - **Property 2: Rate map storage preserves all entries**
    - **Property 3: Available currencies equals API currencies plus USD**
    - **Property 4: Display conversion applies multiplication by rate**
    - **Property 5: Input conversion applies division by rate**
    - **Property 6: Conversion round-trip preserves value**
    - **Validates: Requirements 1.2, 2.1, 2.2, 2.4, 4.1, 5.1, 6.1, 6.2**

- [x] 2. Checkpoint — Verify service and store
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Create currency selector component and integrate into navbar
  - [x] 3.1 Create `components/nav/SelectorMoneda.vue`
    - Create file `src/components/nav/SelectorMoneda.vue`
    - Use `<script setup>` with `storeToRefs` from `useDivisaStore`
    - Render a `<select>` element bound to `monedaActiva` with options from `monedasDisponibles`
    - Disable select while `cargando` is true, showing only USD
    - Include accessible `<label class="sr-only">` for screen readers
    - Style with Tailwind classes matching existing nav UI (mono font, small text, rounded border)
    - Call `divisaStore.seleccionarMoneda(event.target.value)` on change
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.2 Add `SelectorMoneda` to `AppNav.vue`
    - Import `SelectorMoneda` in `AppNav.vue`
    - Render it inside the right-side `<div>` before the user name / logout button, only when `auth.sesionActiva` is true
    - _Requirements: 3.1_

  - [x] 3.3 Write property test for CurrencySelector ISO code format
    - **Property 8: Selector lists all available currencies as 3-letter ISO codes**
    - **Validates: Requirements 3.2, 6.3**

- [x] 4. Modify existing utilities and components for conversion
  - [x] 4.1 Modify `utils/formato.js` — add currency conversion to `formatoMoneda`
    - Import `useDivisaStore` from `@/stores/divisa`
    - Inside `formatoMoneda`, get the store, call `convertirDesdeUSD(valor)` to get converted amount
    - Use `Intl.NumberFormat` with `style: 'currency'` and the store's `monedaActiva` code instead of the hard-coded `$` prefix
    - Keep the existing `fracciones` parameter working
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 4.2 Write property test for formatoMoneda
    - **Property 7: FormatoMoneda displays active currency identifier**
    - **Validates: Requirements 4.2**

  - [x] 4.3 Modify `components/dashboard/FormularioTransaccion.vue` — convert input to USD
    - Import `useDivisaStore` and get the store instance
    - In the submit handler, call `divisaStore.convertirAUSD(form.monto)` and send the converted value to the backend
    - Add a small label or indicator next to the amount input showing the `monedaActiva` code so the user knows which currency they are entering
    - When `monedaActiva` is USD, no conversion is applied (dividing by rate 1)
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 5. Initialize exchange rates at app startup
  - [x] 5.1 Call `cargarTasas()` on application init
    - In `App.vue` (or the main router guard), import `useDivisaStore` and call `cargarTasas()` once after the app mounts
    - Ensure this runs exactly once per session, before authenticated views render
    - _Requirements: 1.1, 1.4, 1.5_

- [x] 6. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design
- Unit tests validate specific examples and edge cases
- The implementation language is JavaScript (Vue 3 + Pinia composition API)
- Spanish naming conventions must be followed, matching the existing codebase

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3", "3.1"] },
    { "id": 3, "tasks": ["3.2", "3.3", "4.1"] },
    { "id": 4, "tasks": ["4.2", "4.3", "5.1"] }
  ]
}
```
