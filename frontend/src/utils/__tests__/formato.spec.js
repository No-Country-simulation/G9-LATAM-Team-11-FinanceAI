import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import fc from 'fast-check'
import { useDivisaStore } from '@/stores/divisa'
import { formatoMoneda } from '@/utils/formato'

// Mock the service module so tests don't hit the network
vi.mock('@/services/divisas', () => ({
  obtenerTasasDeCambio: vi.fn(),
}))

// Real ISO 4217 currency codes that Intl.NumberFormat recognizes
const REAL_CURRENCIES = [
  'EUR', 'GBP', 'JPY', 'ARS', 'BRL', 'CAD', 'CHF', 'CNY',
  'AUD', 'MXN', 'KRW', 'INR', 'SEK', 'NOK', 'DKK', 'PLN',
  'CZK', 'HUF', 'TRY', 'ZAR', 'NZD', 'SGD', 'HKD', 'THB',
]

// Map of ISO codes to their possible display representations (symbol or code)
// Intl.NumberFormat with es-AR locale will use one of these for each currency
function getExpectedIdentifiers(code) {
  const symbols = {
    EUR: ['EUR', '€'],
    GBP: ['GBP', '£'],
    JPY: ['JPY', '¥'],
    ARS: ['ARS', '$'],
    BRL: ['BRL', 'R$'],
    CAD: ['CAD', 'CA$', '$'],
    CHF: ['CHF'],
    CNY: ['CNY', 'CN¥', '¥'],
    AUD: ['AUD', 'AU$', '$'],
    MXN: ['MXN', 'MX$', '$'],
    KRW: ['KRW', '₩'],
    INR: ['INR', '₹'],
    SEK: ['SEK', 'kr'],
    NOK: ['NOK', 'kr'],
    DKK: ['DKK', 'kr'],
    PLN: ['PLN', 'zł'],
    CZK: ['CZK', 'Kč'],
    HUF: ['HUF', 'Ft'],
    TRY: ['TRY', '₺'],
    ZAR: ['ZAR', 'R'],
    NZD: ['NZD', 'NZ$', '$'],
    SGD: ['SGD', 'SG$', '$'],
    HKD: ['HKD', 'HK$', '$'],
    THB: ['THB', '฿', '๏'],
    USD: ['USD', '$', 'US$'],
  }
  return symbols[code] || [code]
}

// Arbitrary: picks a real ISO currency code from the list
const arbRealCurrency = fc.constantFrom(...REAL_CURRENCIES)

// Arbitrary: a positive exchange rate (realistic range)
const arbRate = fc.double({ min: 0.001, max: 10000, noNaN: true, noDefaultInfinity: true })

// Arbitrary: a finite positive amount for formatting
const arbAmount = fc.double({ min: 0.01, max: 1e7, noNaN: true, noDefaultInfinity: true })

describe('formatoMoneda — Property-based tests', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  /**
   * Property 7: FormatoMoneda displays active currency identifier
   * Validates: Requirements 4.2
   *
   * For any active currency code in the available currencies list, the output of
   * formatoMoneda(amount) should contain either the ISO currency code or the
   * locale-appropriate currency symbol for that currency.
   */
  describe('Property 7: FormatoMoneda displays active currency identifier', () => {
    it('output contains either the ISO code or the currency symbol for the active currency', () => {
      fc.assert(
        fc.property(arbRealCurrency, arbRate, arbAmount, (codigo, rate, amount) => {
          setActivePinia(createPinia())
          const store = useDivisaStore()

          // Set up the store with the currency
          store.tasas = { [codigo]: rate }
          store.monedaActiva = codigo

          // Call formatoMoneda
          const result = formatoMoneda(amount)

          // The result should contain either the ISO code or the symbol
          const expectedIdentifiers = getExpectedIdentifiers(codigo)
          const containsIdentifier = expectedIdentifiers.some((id) => result.includes(id))

          expect(containsIdentifier).toBe(true)
        }),
      )
    })

    it('output contains USD identifier when active currency is USD', () => {
      fc.assert(
        fc.property(arbAmount, (amount) => {
          setActivePinia(createPinia())
          const store = useDivisaStore()
          store.monedaActiva = 'USD'

          const result = formatoMoneda(amount)

          const expectedIdentifiers = getExpectedIdentifiers('USD')
          const containsIdentifier = expectedIdentifiers.some((id) => result.includes(id))

          expect(containsIdentifier).toBe(true)
        }),
      )
    })
  })
})
