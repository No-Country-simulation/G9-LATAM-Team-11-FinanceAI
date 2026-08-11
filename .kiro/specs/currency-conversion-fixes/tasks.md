# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Frankfurter API URL Returns 404 & Registration Lacks Currency Conversion
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate both bugs exist
  - **Scoped PBT Approach**: Two scoped properties:
    - (a) `obtenerTasasDeCambio()` uses URL `https://frankfurter.dev/v1/latest` which returns 404 → `cargarTasas()` yields `tasas = {}` and `error = true`
    - (b) Registration with non-USD income submits raw value without conversion
  - **Test file**: `frontend/src/services/__tests__/divisas.bug.spec.js` and `frontend/src/stores/__tests__/divisa.bug.spec.js`
  - Test that `obtenerTasasDeCambio()` calls the correct URL (`https://api.frankfurter.app/latest`) and returns non-empty rates (from Bug Condition in design: `isBugCondition(input)` where `input.url == 'https://frankfurter.dev/v1/latest'`)
  - Test that for any positive income amount and non-USD currency, the registration flow converts income to USD before storing (from Bug Condition: `input.moneda != 'USD' AND noConversionApplied`)
  - Use fast-check to generate random positive income amounts and currency codes
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found: `obtenerTasasDeCambio()` uses wrong URL; `registrar()` sends raw income without conversion
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - USD Income Unchanged & Conversion Functions Correct & API Error Fallback
  - **IMPORTANT**: Follow observation-first methodology
  - **Test file**: `frontend/src/stores/__tests__/divisa.preservation.spec.js`
  - Observe on UNFIXED code: `convertirDesdeUSD(100)` with `tasaActiva = 950` returns `95000`
  - Observe on UNFIXED code: `convertirAUSD(95000)` with `tasaActiva = 950` returns `100`
  - Observe on UNFIXED code: when API call throws, `cargarTasas()` sets `tasas = {}` and `error = true`
  - Write property-based test with fast-check: for any positive number `monto` and any valid rate > 0, `convertirDesdeUSD(monto) === monto * rate` and `convertirAUSD(monto) === monto / rate`
  - Write property-based test: round-trip `convertirAUSD(convertirDesdeUSD(x))` ≈ x within floating-point tolerance
  - Write property-based test: when API throws error, `tasas` is `{}` and `error` is `true` (graceful fallback preserved)
  - Write property-based test: for any positive USD income, stored value equals input exactly (no conversion applied when moneda === 'USD')
  - Verify all tests pass on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [x] 3. Fix currency conversion bugs

  - [x] 3.1 Fix the Frankfurter API URL in `divisas.js`
    - Change `FRANKFURTER_URL` from `'https://frankfurter.dev/v1/latest'` to `'https://api.frankfurter.app/latest'`
    - This is a one-line constant change in `frontend/src/services/divisas.js`
    - _Bug_Condition: isBugCondition(input) where input.url == 'https://frankfurter.dev/v1/latest'_
    - _Expected_Behavior: obtenerTasasDeCambio() returns non-empty rates object from correct endpoint_
    - _Preservation: API error fallback behavior unchanged (tasas = {}, error = true on network error)_
    - _Requirements: 2.1, 2.2_

  - [x] 3.2 Add `convertirMonedaAUSD(monto, codigoMoneda)` helper to `frontend/src/stores/divisa.js`
    - Add a stateless conversion function that converts any currency amount to USD using loaded rates
    - Implementation: `return codigoMoneda === 'USD' ? monto : monto / tasas.value[codigoMoneda]`
    - Export it from the store's return object
    - This avoids mutating `monedaActiva` during registration
    - _Bug_Condition: Registration needs conversion without side effects on global display currency_
    - _Expected_Behavior: convertirMonedaAUSD(monto, codigo) returns monto / tasas[codigo] for non-USD, monto for USD_
    - _Preservation: Existing convertirDesdeUSD() and convertirAUSD() remain unchanged_
    - _Requirements: 2.4, 3.5_

  - [x] 3.3 Add currency selector to registration step 2 in `LoginView.vue`
    - Import `useDivisaStore` from `'@/stores/divisa'` and initialize in `<script setup>`
    - Add `monedaIngreso: 'USD'` field to the reactive `form` object
    - Call `divisaStore.cargarTasas()` inside `siguientePaso()` when transitioning to step 2 (ensures rates available)
    - Add `<select>` element bound to `form.monedaIngreso` next to the income input, populated with `divisaStore.monedasDisponibles`
    - _Bug_Condition: isBugCondition(input) where input.moneda IS UNDEFINED and ingresoMensual > 0_
    - _Expected_Behavior: User must select currency; monedasDisponibles shown in selector_
    - _Preservation: USD remains default selection; login flow and demo mode unaffected_
    - _Requirements: 2.2, 2.3_

  - [x] 3.4 Convert income to USD before submission in `registrar()` function
    - In `registrar()`, compute final income: if `form.monedaIngreso !== 'USD'`, use `divisaStore.convertirMonedaAUSD(form.ingresoMensual, form.monedaIngreso)`, otherwise use `form.ingresoMensual` directly
    - Pass the converted value as `ingresoMensual` to `registrarYEntrar()`
    - _Bug_Condition: noConversionApplied(input.ingresoMensual) when moneda != 'USD'_
    - _Expected_Behavior: storedIncome == ingresoMensual / tasas[moneda] for non-USD currencies_
    - _Preservation: USD income stored as-is (no conversion applied when moneda === 'USD')_
    - _Requirements: 2.3, 2.4, 3.2_

  - [x] 3.5 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Frankfurter API Returns Valid Rates & Income Correctly Converted
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior (correct URL, non-empty rates, income conversion)
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.6 Verify preservation tests still pass
    - **Property 2: Preservation** - USD Income Unchanged & Conversion Functions Correct & API Error Fallback
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all preservation tests still pass after fix (no regressions to conversion functions, USD registration, or error fallback)
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [x] 4. Checkpoint - Ensure all tests pass
  - Run full test suite: `npm run test` from `frontend/` directory
  - Verify bug condition tests pass (fix confirmed)
  - Verify preservation tests pass (no regressions)
  - Verify build still succeeds: `npm run build` from `frontend/`
  - Ensure all tests pass, ask the user if questions arise.
