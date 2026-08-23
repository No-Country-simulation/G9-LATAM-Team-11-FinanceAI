import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import fc from 'fast-check'
import { useDivisaStore } from '@/stores/divisa'

/**
 * Bug Condition Exploration Test — Property 1(b): Registration Currency Conversion
 *
 * Validates: Requirements 1.3, 1.4
 *
 * This test verifies that for any positive income amount and non-USD currency,
 * the registration flow converts income to USD before storing.
 *
 * On UNFIXED code, the `registrar()` function in LoginView.vue sends
 * `form.ingresoMensual` directly without conversion, and the form has no
 * `monedaIngreso` field. This test MUST FAIL — confirming the bug exists.
 *
 * Since we cannot easily test the full Vue component registration flow with
 * property-based testing, we test the divisa store's conversion capability
 * and simulate what the registration SHOULD do: convert non-USD income to USD.
 *
 * EXPECTED OUTCOME: FAIL on unfixed code (proves bug exists)
 */

vi.mock('@/services/divisas', () => ({
  obtenerTasasDeCambio: vi.fn(),
}))

import { obtenerTasasDeCambio } from '@/services/divisas'

describe('Bug Condition: Registration with non-USD income should convert to USD', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.resetAllMocks()
  })

  /**
   * Property: For any positive income and non-USD currency with a known rate,
   * the store SHOULD provide a `convertirMonedaAUSD(monto, codigo)` function
   * that converts income to USD without mutating monedaActiva.
   *
   * On unfixed code, this function does NOT exist, so the test will fail.
   * This proves the bug: there's no way to convert income at registration time
   * without side effects on the global display currency.
   */
  it('property: store exposes convertirMonedaAUSD(monto, codigo) for stateless conversion at registration', () => {
    const arbCurrencyCode = fc
      .stringMatching(/^[A-Z]{3}$/)
      .filter((c) => c !== 'USD')

    const arbRate = fc.double({ min: 0.001, max: 50000, noNaN: true, noDefaultInfinity: true })
    const arbIncome = fc.double({ min: 0.01, max: 1e9, noNaN: true, noDefaultInfinity: true })

    fc.assert(
      fc.property(arbCurrencyCode, arbRate, arbIncome, (codigo, rate, income) => {
        setActivePinia(createPinia())
        const store = useDivisaStore()
        store.tasas = { [codigo]: rate }

        // The store MUST expose a convertirMonedaAUSD function
        expect(typeof store.convertirMonedaAUSD).toBe('function')

        // It should convert income to USD: income / rate
        const convertedToUSD = store.convertirMonedaAUSD(income, codigo)
        expect(convertedToUSD).toBeCloseTo(income / rate, 5)

        // It should NOT mutate monedaActiva (no side effects)
        expect(store.monedaActiva).toBe('USD')
      }),
      { numRuns: 50 },
    )
  })

  /**
   * Property: For any positive USD income, convertirMonedaAUSD should return
   * the value unchanged (no conversion needed).
   */
  it('property: convertirMonedaAUSD returns income unchanged when currency is USD', () => {
    const arbIncome = fc.double({ min: 0.01, max: 1e9, noNaN: true, noDefaultInfinity: true })

    fc.assert(
      fc.property(arbIncome, (income) => {
        setActivePinia(createPinia())
        const store = useDivisaStore()

        // The store MUST expose convertirMonedaAUSD
        expect(typeof store.convertirMonedaAUSD).toBe('function')

        const result = store.convertirMonedaAUSD(income, 'USD')
        expect(result).toBe(income)
      }),
      { numRuns: 30 },
    )
  })

  /**
   * This test demonstrates that without the fix, cargarTasas() always fails
   * because the URL is wrong, leaving tasas = {} and error = true.
   * With rates empty, no currency conversion is possible at registration time.
   */
  it('cargarTasas fails due to wrong URL, leaving no rates for conversion', async () => {
    obtenerTasasDeCambio.mockRejectedValue(new Error('Request failed with status code 404'))

    const store = useDivisaStore()
    await store.cargarTasas()

    // This confirms the bug: tasas is empty, error is true
    expect(store.tasas).toEqual({})
    expect(store.error).toBe(true)

    // With empty tasas, there's no way to convert non-USD income
    // The store SHOULD have convertirMonedaAUSD but on unfixed code it doesn't
    expect(typeof store.convertirMonedaAUSD).toBe('function')
  })
})
