import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import fc from 'fast-check'
import { useDivisaStore } from '@/stores/divisa'

// Mock the service module so tests don't hit the network
vi.mock('@/services/divisas', () => ({
  obtenerTasasDeCambio: vi.fn(),
}))

import { obtenerTasasDeCambio } from '@/services/divisas'

// Arbitrary: generates a valid 3-letter uppercase currency code (not 'USD')
const arbLetter = fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''))
const arbCurrencyCode = fc
  .tuple(arbLetter, arbLetter, arbLetter)
  .map(([a, b, c]) => a + b + c)
  .filter((code) => code !== 'USD')

// Arbitrary: generates a positive exchange rate (realistic range)
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

// Arbitrary: a finite number for amounts (includes negatives and zero)
const arbAmount = fc.double({ min: -1e9, max: 1e9, noNaN: true, noDefaultInfinity: true })

describe('useDivisaStore — Property-based tests', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  /**
   * Property 1: Currency preference round-trip via localStorage
   * Validates: Requirements 2.1, 2.2, 2.4
   *
   * For any valid currency code that exists in the available currencies list,
   * saving it via seleccionarMoneda(codigo) and then initializing a new store
   * instance should result in monedaActiva being equal to the saved code.
   */
  describe('Property 1: Currency preference round-trip via localStorage', () => {
    it('seleccionarMoneda persists and a new store reads the same code', () => {
      fc.assert(
        fc.property(arbCurrencyCode, (codigo) => {
          localStorage.clear()
          setActivePinia(createPinia())
          const store = useDivisaStore()

          // Set the rates so the code is "available"
          store.tasas = { [codigo]: 1.5 }

          // Select the currency
          store.seleccionarMoneda(codigo)

          // Verify localStorage was written
          expect(localStorage.getItem('financeai:moneda')).toBe(codigo)

          // Simulate a new session by creating a fresh pinia/store
          setActivePinia(createPinia())
          const newStore = useDivisaStore()
          expect(newStore.monedaActiva).toBe(codigo)
        }),
      )
    })
  })

  /**
   * Property 2: Rate map storage preserves all entries
   * Validates: Requirements 1.2
   *
   * For any valid rates map returned by the API, after cargarTasas() completes
   * successfully, the store's tasas object should contain every key-value pair
   * from the API response without modification.
   */
  describe('Property 2: Rate map storage preserves all entries', () => {
    it('cargarTasas stores all rate entries from the API response', async () => {
      await fc.assert(
        fc.asyncProperty(arbRatesMap, async (ratesMap) => {
          setActivePinia(createPinia())
          const store = useDivisaStore()

          obtenerTasasDeCambio.mockResolvedValueOnce(ratesMap)
          await store.cargarTasas()

          // Every key from the API should be in the store
          for (const [code, rate] of Object.entries(ratesMap)) {
            expect(store.tasas[code]).toBe(rate)
          }
          // No extra keys should be present
          expect(Object.keys(store.tasas).sort()).toEqual(Object.keys(ratesMap).sort())
        }),
      )
    })
  })

  /**
   * Property 3: Available currencies is a subset of MONEDAS_PRINCIPALES
   * Validates: Requirements 2.1, 2.2, 2.4
   *
   * For any rates map loaded into the store, monedasDisponibles should contain
   * only currencies from MONEDAS_PRINCIPALES that have a rate available (plus USD always).
   */
  describe('Property 3: Available currencies is a subset of MONEDAS_PRINCIPALES', () => {
    it('monedasDisponibles only contains whitelisted currencies with available rates', () => {
      fc.assert(
        fc.property(arbRatesMap, (ratesMap) => {
          setActivePinia(createPinia())
          const store = useDivisaStore()
          store.tasas = ratesMap

          const expected = store.MONEDAS_PRINCIPALES.filter(
            codigo => codigo === 'USD' || ratesMap[codigo] != null
          ).sort()
          expect(store.monedasDisponibles).toEqual(expected)
        }),
      )
    })

    it('includes USD even when rates map is empty', () => {
      setActivePinia(createPinia())
      const store = useDivisaStore()
      store.tasas = {}
      expect(store.monedasDisponibles).toEqual(['USD'])
    })
  })

  /**
   * Property 4: Display conversion applies multiplication by rate
   * Validates: Requirements 4.1
   *
   * For any USD amount and for any active currency with a known positive exchange
   * rate r, convertirDesdeUSD(amount) should return amount * r.
   */
  describe('Property 4: Display conversion applies multiplication by rate', () => {
    it('convertirDesdeUSD returns amount * tasaActiva', () => {
      fc.assert(
        fc.property(arbCurrencyCode, arbRate, arbAmount, (codigo, rate, amount) => {
          setActivePinia(createPinia())
          const store = useDivisaStore()
          store.tasas = { [codigo]: rate }
          store.monedaActiva = codigo

          const result = store.convertirDesdeUSD(amount)
          expect(result).toBeCloseTo(amount * rate, 5)
        }),
      )
    })

    it('convertirDesdeUSD returns the same amount when currency is USD', () => {
      fc.assert(
        fc.property(arbAmount, (amount) => {
          setActivePinia(createPinia())
          const store = useDivisaStore()
          store.monedaActiva = 'USD'

          const result = store.convertirDesdeUSD(amount)
          expect(result).toBe(amount)
        }),
      )
    })
  })

  /**
   * Property 5: Input conversion applies division by rate
   * Validates: Requirements 5.1
   *
   * For any local currency amount and for any active currency with a known positive
   * exchange rate r, convertirAUSD(amount) should return amount / r.
   */
  describe('Property 5: Input conversion applies division by rate', () => {
    it('convertirAUSD returns amount / tasaActiva', () => {
      fc.assert(
        fc.property(arbCurrencyCode, arbRate, arbAmount, (codigo, rate, amount) => {
          setActivePinia(createPinia())
          const store = useDivisaStore()
          store.tasas = { [codigo]: rate }
          store.monedaActiva = codigo

          const result = store.convertirAUSD(amount)
          expect(result).toBeCloseTo(amount / rate, 5)
        }),
      )
    })

    it('convertirAUSD returns the same amount when currency is USD', () => {
      fc.assert(
        fc.property(arbAmount, (amount) => {
          setActivePinia(createPinia())
          const store = useDivisaStore()
          store.monedaActiva = 'USD'

          const result = store.convertirAUSD(amount)
          expect(result).toBe(amount)
        }),
      )
    })
  })

  /**
   * Property 6: Conversion round-trip preserves value
   * Validates: Requirements 4.1, 5.1
   *
   * For any positive USD amount and any active currency with rate r > 0,
   * converting from USD to local and back to USD should produce the original
   * amount (within floating-point tolerance).
   */
  describe('Property 6: Conversion round-trip preserves value', () => {
    it('convertirDesdeUSD then convertirAUSD returns original amount', () => {
      const arbPositiveAmount = fc.double({
        min: 0.01,
        max: 1e9,
        noNaN: true,
        noDefaultInfinity: true,
      })

      fc.assert(
        fc.property(arbCurrencyCode, arbRate, arbPositiveAmount, (codigo, rate, amount) => {
          setActivePinia(createPinia())
          const store = useDivisaStore()
          store.tasas = { [codigo]: rate }
          store.monedaActiva = codigo

          const converted = store.convertirDesdeUSD(amount)
          const roundTrip = store.convertirAUSD(converted)
          expect(roundTrip).toBeCloseTo(amount, 5)
        }),
      )
    })
  })
})
