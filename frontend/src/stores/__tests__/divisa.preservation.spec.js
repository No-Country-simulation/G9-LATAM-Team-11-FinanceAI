import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import fc from 'fast-check'
import { useDivisaStore } from '@/stores/divisa'

/**
 * Preservation Property Tests — Property 2
 *
 * These tests capture BASELINE behavior on UNFIXED code that must be preserved
 * after the fix is applied. They encode:
 *  - convertirDesdeUSD(monto) === monto * rate
 *  - convertirAUSD(monto) === monto / rate
 *  - Round-trip: convertirAUSD(convertirDesdeUSD(x)) ≈ x
 *  - API error fallback: tasas = {} and error = true
 *  - USD income stored unchanged (no conversion when moneda === 'USD')
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.5
 *
 * EXPECTED OUTCOME: All tests PASS on unfixed code (confirms baseline to preserve)
 */

vi.mock('@/services/divisas', () => ({
  obtenerTasasDeCambio: vi.fn(),
}))

import { obtenerTasasDeCambio } from '@/services/divisas'

// Arbitraries
const arbPositiveAmount = fc.double({
  min: 0.01,
  max: 1e9,
  noNaN: true,
  noDefaultInfinity: true,
})

const arbPositiveRate = fc.double({
  min: 0.001,
  max: 50000,
  noNaN: true,
  noDefaultInfinity: true,
})

const arbLetter = fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''))
const arbCurrencyCode = fc
  .tuple(arbLetter, arbLetter, arbLetter)
  .map(([a, b, c]) => a + b + c)
  .filter((code) => code !== 'USD')

describe('Preservation: USD Income Unchanged & Conversion Functions Correct & API Error Fallback', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.resetAllMocks()
  })

  /**
   * **Validates: Requirements 3.1, 3.5**
   *
   * Property: For any positive number `monto` and any valid rate > 0,
   * convertirDesdeUSD(monto) === monto * rate and convertirAUSD(monto) === monto / rate
   *
   * Observation on UNFIXED code:
   *   convertirDesdeUSD(100) with tasaActiva = 950 returns 95000
   *   convertirAUSD(95000) with tasaActiva = 950 returns 100
   */
  describe('Conversion functions produce correct arithmetic results', () => {
    it('property: convertirDesdeUSD(monto) === monto * rate for any positive monto and rate > 0', () => {
      fc.assert(
        fc.property(arbCurrencyCode, arbPositiveRate, arbPositiveAmount, (codigo, rate, monto) => {
          setActivePinia(createPinia())
          const store = useDivisaStore()
          store.tasas = { [codigo]: rate }
          store.monedaActiva = codigo

          const result = store.convertirDesdeUSD(monto)
          expect(result).toBeCloseTo(monto * rate, 5)
        }),
        { numRuns: 100 },
      )
    })

    it('property: convertirAUSD(monto) === monto / rate for any positive monto and rate > 0', () => {
      fc.assert(
        fc.property(arbCurrencyCode, arbPositiveRate, arbPositiveAmount, (codigo, rate, monto) => {
          setActivePinia(createPinia())
          const store = useDivisaStore()
          store.tasas = { [codigo]: rate }
          store.monedaActiva = codigo

          const result = store.convertirAUSD(monto)
          expect(result).toBeCloseTo(monto / rate, 5)
        }),
        { numRuns: 100 },
      )
    })
  })

  /**
   * **Validates: Requirements 3.1, 3.5**
   *
   * Property: Round-trip convertirAUSD(convertirDesdeUSD(x)) ≈ x within floating-point tolerance
   */
  describe('Round-trip conversion preserves value', () => {
    it('property: convertirAUSD(convertirDesdeUSD(x)) ≈ x within floating-point tolerance', () => {
      fc.assert(
        fc.property(arbCurrencyCode, arbPositiveRate, arbPositiveAmount, (codigo, rate, monto) => {
          setActivePinia(createPinia())
          const store = useDivisaStore()
          store.tasas = { [codigo]: rate }
          store.monedaActiva = codigo

          const converted = store.convertirDesdeUSD(monto)
          const roundTrip = store.convertirAUSD(converted)
          expect(roundTrip).toBeCloseTo(monto, 5)
        }),
        { numRuns: 100 },
      )
    })
  })

  /**
   * **Validates: Requirements 3.3**
   *
   * Property: When API throws error, tasas is {} and error is true (graceful fallback preserved)
   *
   * Observation on UNFIXED code: when API call throws, cargarTasas() sets tasas = {} and error = true
   */
  describe('API error fallback behavior preserved', () => {
    it('property: when API throws any error, tasas becomes {} and error becomes true', async () => {
      const arbErrorMessage = fc.string({ minLength: 1, maxLength: 50 })

      await fc.assert(
        fc.asyncProperty(arbErrorMessage, async (message) => {
          setActivePinia(createPinia())
          const store = useDivisaStore()

          obtenerTasasDeCambio.mockRejectedValueOnce(new Error(message))
          await store.cargarTasas()

          expect(store.tasas).toEqual({})
          expect(store.error).toBe(true)
          expect(store.cargando).toBe(false)
        }),
        { numRuns: 30 },
      )
    })
  })

  /**
   * **Validates: Requirements 3.2**
   *
   * Property: For any positive USD income, stored value equals input exactly
   * (no conversion applied when moneda === 'USD')
   *
   * When monedaActiva is 'USD', tasaActiva = 1, so convertirDesdeUSD and convertirAUSD
   * both return the input unchanged — this is the identity behavior that must be preserved.
   */
  describe('USD income stored unchanged (no conversion for USD)', () => {
    it('property: for any positive USD income, convertirDesdeUSD returns input exactly (identity)', () => {
      fc.assert(
        fc.property(arbPositiveAmount, (income) => {
          setActivePinia(createPinia())
          const store = useDivisaStore()
          // monedaActiva defaults to 'USD', tasaActiva = 1
          expect(store.monedaActiva).toBe('USD')
          expect(store.tasaActiva).toBe(1)

          // When moneda is USD, no conversion is applied
          const result = store.convertirDesdeUSD(income)
          expect(result).toBe(income)
        }),
        { numRuns: 100 },
      )
    })

    it('property: for any positive USD income, convertirAUSD returns input exactly (identity)', () => {
      fc.assert(
        fc.property(arbPositiveAmount, (income) => {
          setActivePinia(createPinia())
          const store = useDivisaStore()
          expect(store.monedaActiva).toBe('USD')
          expect(store.tasaActiva).toBe(1)

          // When moneda is USD, division by 1 returns same value
          const result = store.convertirAUSD(income)
          expect(result).toBe(income)
        }),
        { numRuns: 100 },
      )
    })
  })
})
