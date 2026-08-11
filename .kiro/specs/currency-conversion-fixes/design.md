# Currency Conversion Fixes — Bugfix Design

## Overview

FinanceAI's currency conversion feature is broken by two distinct bugs: (1) the Frankfurter API URL in `divisas.js` uses a dead domain (`frankfurter.dev`) that returns 404, preventing exchange rate loading entirely, and (2) the registration form collects monthly income without asking the user's currency, so non-USD values get stored as if they were USD. The fix involves correcting the API endpoint and adding a currency selector to registration step 2, converting the income to USD before persisting.

## Glossary

- **Bug_Condition (C)**: The union of two conditions — (a) the API URL resolves to a non-functional endpoint, or (b) a user registers income in a non-USD currency without specifying currency
- **Property (P)**: Exchange rates load correctly AND income is stored with proper USD conversion
- **Preservation**: All existing behaviors for USD-income users, mouse/keyboard interactions, login flow, display conversion functions, and API-down fallback must remain unchanged
- **`obtenerTasasDeCambio()`**: The function in `services/divisas.js` that calls the Frankfurter API
- **`useDivisaStore`**: Pinia store managing exchange rates, active currency, and conversion helpers
- **`registrarYEntrar(datos)`**: Composable method that sends registration payload to the backend

## Bug Details

### Bug Condition

The bug manifests in two independent scenarios:

1. **API URL Bug**: Every call to `obtenerTasasDeCambio()` fails because `https://frankfurter.dev/v1/latest` returns 404. This causes `tasas = {}` globally, making currency conversion impossible for all users.

2. **Registration Currency Bug**: When a user enters income in step 2 of registration, the form submits `ingresoMensual` as a raw number without any associated currency. The backend stores it as-is, but all downstream code treats it as USD.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { action: 'fetchRates' | 'register', url?: string, ingresoMensual?: number, moneda?: string }
  OUTPUT: boolean

  IF input.action == 'fetchRates' THEN
    RETURN input.url == 'https://frankfurter.dev/v1/latest'
  END IF

  IF input.action == 'register' THEN
    RETURN input.ingresoMensual > 0
           AND (input.moneda IS UNDEFINED OR input.moneda != 'USD')
           AND noConversionApplied(input.ingresoMensual)
  END IF

  RETURN false
END FUNCTION
```

### Examples

- **API Bug**: App mounts → `cargarTasas()` calls `https://frankfurter.dev/v1/latest?base=USD` → receives 404 → `tasas = {}` → currency selector shows only "USD"
- **Registration Bug**: User in Chile enters 1,500,000 (CLP) as income → system stores 1,500,000 as USD → financial analysis treats user as a millionaire
- **Registration Bug**: User in Argentina enters 800,000 (ARS) → stored as 800,000 USD → completely wrong budget calculations
- **Edge case (correct)**: User enters 5,000 and actually means USD → value should be stored as 5,000 USD unchanged

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Login flow (email/password authentication) must work exactly as before
- Users who select USD as their income currency must have their value stored without any conversion
- The divisa store's `convertirDesdeUSD()` and `convertirAUSD()` must continue to work identically
- The existing `SelectorMoneda.vue` component behavior in the nav must remain unchanged
- When Frankfurter API is unreachable, the system must still gracefully degrade to USD-only mode
- Demo mode entry must continue to work without requiring income currency

**Scope:**
All inputs that do NOT involve fetching exchange rates from the wrong URL or registering income without currency specification should be completely unaffected. This includes:
- Logging in with existing credentials
- Viewing transactions and dashboard
- Switching display currencies after login
- All backend API interactions other than user registration payload

## Hypothesized Root Cause

Based on the bug description, the most likely issues are:

1. **Incorrect API Domain**: The constant `FRANKFURTER_URL` in `services/divisas.js` is set to `'https://frankfurter.dev/v1/latest'`. The correct working endpoint is `'https://api.frankfurter.app/latest'` (different domain, different path structure — no `/v1` prefix).

2. **Missing Currency Field in Registration Form**: `LoginView.vue` step 2 only collects `ingresoMensual` as a number. There is no `<select>` or input for the user to specify which currency that amount is in.

3. **No Conversion at Registration Time**: The `registrar()` function in `LoginView.vue` passes `form.ingresoMensual` directly to `registrarYEntrar()` without any conversion. Even if we know the currency, no code converts it to USD before sending.

4. **Exchange Rates May Not Be Loaded During Registration**: `cargarTasas()` fires in `App.vue`'s `onMounted`, but the LoginView is the initial route. There's a race condition where the user may complete registration before rates finish loading, making conversion impossible.

## Correctness Properties

Property 1: Bug Condition - Frankfurter API Returns Valid Rates

_For any_ call to `obtenerTasasDeCambio()` when the network is available, the fixed function SHALL use the correct endpoint `https://api.frankfurter.app/latest?base=USD` and return a non-empty rates object containing valid currency codes and numeric exchange rates.

**Validates: Requirements 2.1, 2.2**

Property 2: Bug Condition - Income Stored as USD

_For any_ registration where the user specifies a non-USD currency and a positive income amount, the fixed registration flow SHALL convert the income to USD using the current exchange rate before storing it, so that `ingresoMensual` in the backend always represents a USD value.

**Validates: Requirements 2.3, 2.4**

Property 3: Preservation - USD Income Unchanged

_For any_ registration where the user selects USD as their income currency, the fixed registration flow SHALL store the income value directly without conversion, producing the same result as the original function.

**Validates: Requirements 3.2**

Property 4: Preservation - Existing Conversion Functions

_For any_ call to `convertirDesdeUSD(monto)` or `convertirAUSD(monto)` with loaded exchange rates, the fixed code SHALL produce exactly the same results as the original code, preserving all display conversion behavior.

**Validates: Requirements 3.1, 3.5**

Property 5: Preservation - Graceful Fallback on API Error

_For any_ scenario where the Frankfurter API is unreachable (network error, timeout, server error), the fixed code SHALL continue to set `tasas = {}` and `error = true`, preserving the existing USD-only fallback behavior.

**Validates: Requirements 3.3**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `frontend/src/services/divisas.js`

**Function**: `obtenerTasasDeCambio()`

**Specific Changes**:
1. **Fix API URL**: Change `FRANKFURTER_URL` from `'https://frankfurter.dev/v1/latest'` to `'https://api.frankfurter.app/latest'`

---

**File**: `frontend/src/views/LoginView.vue`

**Function**: Registration form (step 2) and `registrar()`

**Specific Changes**:
2. **Import divisa store**: Add `import { useDivisaStore } from '@/stores/divisa'` and initialize it in `<script setup>`
3. **Add currency field to form**: Add `monedaIngreso: 'USD'` to the reactive `form` object
4. **Ensure rates are loaded**: Call `divisaStore.cargarTasas()` when entering step 2 (if not already loaded) to handle the race condition where rates haven't finished loading from App.vue
5. **Add currency selector UI**: Add a `<select>` element next to the income input in step 2 that shows `monedasDisponibles` from the divisa store, bound to `form.monedaIngreso`
6. **Convert income before submission**: In `registrar()`, if `form.monedaIngreso !== 'USD'`, temporarily set `monedaActiva` to the user's selected currency and use `convertirAUSD(form.ingresoMensual)` — or compute directly: `form.ingresoMensual / tasas[form.monedaIngreso]` — before passing to `registrarYEntrar()`

---

**File**: `frontend/src/stores/divisa.js` (optional enhancement)

**Specific Changes**:
7. **Add direct conversion helper**: Consider adding a `convertirMonedaAUSD(monto, codigoMoneda)` function that doesn't depend on `monedaActiva`, making it safe to call from registration without side effects on the global display currency

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that mock axios to simulate the 404 response from the wrong URL, and tests that trace the registration data flow to confirm income is sent without conversion. Run these tests on the UNFIXED code to observe the failures.

**Test Cases**:
1. **API 404 Test**: Call `obtenerTasasDeCambio()` with the current URL → expect 404 failure (will fail on unfixed code because the URL is wrong)
2. **Store Empty After Fetch**: Call `cargarTasas()` → expect `tasas` to be `{}` and `error` to be `true` (demonstrates bug on unfixed code)
3. **Registration No Currency**: Mount LoginView, complete step 2 with income 1,000,000 → observe that no currency field exists and value is sent raw (demonstrates bug)
4. **Race Condition Test**: Navigate directly to login route → check if `monedasDisponibles` has more than just USD before registration completes (may fail)

**Expected Counterexamples**:
- `obtenerTasasDeCambio()` throws AxiosError with status 404
- Registration payload contains `{ ingresoMensual: 1500000 }` without any currency conversion
- Possible causes: wrong domain in FRANKFURTER_URL, no currency selector in form, no conversion logic

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  IF input.action == 'fetchRates' THEN
    result := obtenerTasasDeCambio_fixed()
    ASSERT result IS Object
    ASSERT Object.keys(result).length > 0
    ASSERT all values in result are positive numbers
  END IF

  IF input.action == 'register' AND input.moneda != 'USD' THEN
    storedIncome := registrar_fixed(input.ingresoMensual, input.moneda)
    expectedUSD := input.ingresoMensual / tasas[input.moneda]
    ASSERT storedIncome == expectedUSD
  END IF
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  IF input.action == 'register' AND input.moneda == 'USD' THEN
    ASSERT registrar_fixed(input) == registrar_original(input)
  END IF

  IF input.action == 'convert' THEN
    ASSERT convertirDesdeUSD_fixed(input.monto) == convertirDesdeUSD_original(input.monto)
    ASSERT convertirAUSD_fixed(input.monto) == convertirAUSD_original(input.monto)
  END IF
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many random income values and currencies to verify conversion correctness
- It catches floating-point edge cases that manual tests might miss
- It provides strong guarantees that USD-income users are unaffected

**Test Plan**: Observe behavior on UNFIXED code first for USD registrations and conversion functions, then write property-based tests capturing that behavior.

**Test Cases**:
1. **USD Registration Preservation**: Register with USD income → verify stored value equals input value exactly
2. **Conversion Function Preservation**: Call `convertirDesdeUSD` and `convertirAUSD` with various amounts → verify results unchanged
3. **Login Flow Preservation**: Login with existing credentials → verify no income-related changes required
4. **API Error Fallback Preservation**: Simulate network error → verify `tasas = {}` and `error = true` behavior unchanged

### Unit Tests

- Test `obtenerTasasDeCambio()` calls the correct URL (mock axios, verify URL parameter)
- Test that `cargarTasas()` populates `tasas` and `monedasDisponibles` when API responds correctly
- Test currency conversion math: `income / rate == expected USD` for known rate values
- Test registration form shows currency selector in step 2
- Test that USD-selected registration sends income without conversion

### Property-Based Tests

- Generate random positive income amounts and random currencies from available list → verify `income / rate` produces expected USD value (within floating-point tolerance)
- Generate random amounts → verify `convertirAUSD(convertirDesdeUSD(x))` ≈ x (round-trip property)
- Generate random income values with `moneda = 'USD'` → verify stored value equals input exactly

### Integration Tests

- Test full registration flow: enter income in CLP → verify backend receives correctly converted USD value
- Test that exchange rates are available by the time user reaches step 2 (race condition handling)
- Test that selecting a currency in registration does NOT affect the global `monedaActiva` display setting
