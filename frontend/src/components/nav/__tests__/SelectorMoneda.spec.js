import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import fc from 'fast-check'
import { useDivisaStore } from '@/stores/divisa'

// Mock the service module so tests don't hit the network
vi.mock('@/services/divisas', () => ({
  obtenerTasasDeCambio: vi.fn(),
}))

// Arbitrary: generates a valid 3-letter uppercase currency code (not 'USD')
const arbLetter = fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''))
const arbCurrencyCode = fc
  .tuple(arbLetter, arbLetter, arbLetter)
  .map(([a, b, c]) => a + b + c)
  .filter((code) => code !== 'USD')

// Arbitrary: generates a positive exchange rate
const arbRate = fc.double({ min: 0.001, max: 10000, noNaN: true, noDefaultInfinity: true })

// Arbitrary: generates a rates map (non-empty object of code → positive rate)
const arbRatesMap = fc
  .uniqueArray(arbCurrencyCode, { minLength: 1, maxLength: 20 })
  .chain((codes) =>
    fc.tuple(...codes.map(() => arbRate)).map((rates) => {
      const map = {}
      codes.forEach((code, i) => {
        map[code] = rates[i]
      })
      return map
    }),
  )

describe('SelectorMoneda — Property-based tests', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  /**
   * Property 8: Selector lists all available currencies as 3-letter ISO codes
   * Validates: Requirements 3.2, 6.3
   *
   * For any set of currencies loaded from the API, every entry in
   * monedasDisponibles should be a string of exactly 3 uppercase ASCII letters
   * conforming to ISO 4217 format.
   */
  describe('Property 8: Selector lists all available currencies as 3-letter ISO codes', () => {
    it('every entry in monedasDisponibles is exactly 3 uppercase ASCII letters', () => {
      const ISO_CODE_REGEX = /^[A-Z]{3}$/

      fc.assert(
        fc.property(arbRatesMap, (ratesMap) => {
          setActivePinia(createPinia())
          const store = useDivisaStore()
          store.tasas = ratesMap

          for (const codigo of store.monedasDisponibles) {
            expect(codigo).toMatch(ISO_CODE_REGEX)
            expect(codigo).toHaveLength(3)
          }
        }),
      )
    })

    it('monedasDisponibles contains only 3-letter codes even with empty rates', () => {
      const store = useDivisaStore()
      store.tasas = {}

      // Only USD should be present and it should be a valid ISO code
      expect(store.monedasDisponibles).toEqual(['USD'])
      expect(store.monedasDisponibles[0]).toMatch(/^[A-Z]{3}$/)
    })
  })
})
