import { describe, it, expect, vi, beforeEach } from 'vitest'
import fc from 'fast-check'
import axios from 'axios'

/**
 * Pruebas de integración para Frankfurter API v2
 */

vi.mock('axios')

describe('Integración API Frankfurter v2: obtenerTasasDeCambio', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('debe invocar https://api.frankfurter.dev/v2/rates con base=USD y retornar mapa de tasas', async () => {
    const fakeData = [
      { date: '2026-08-22', base: 'USD', quote: 'EUR', rate: 0.92 },
      { date: '2026-08-22', base: 'USD', quote: 'GBP', rate: 0.79 },
      { date: '2026-08-22', base: 'USD', quote: 'CLP', rate: 950.5 },
      { date: '2026-08-22', base: 'USD', quote: 'ARS', rate: 870.2 },
    ]
    axios.get.mockResolvedValue({ data: fakeData })

    const { obtenerTasasDeCambio } = await import('@/services/divisas')
    const result = await obtenerTasasDeCambio()

    expect(axios.get).toHaveBeenCalledWith(
      'https://api.frankfurter.dev/v2/rates',
      expect.objectContaining({ params: { base: 'USD' } }),
    )
    expect(result.EUR).toBe(0.92)
    expect(result.ARS).toBe(870.2)
    expect(result.CLP).toBe(950.5)
  })

  it('propiedad: la URL utilizada es https://api.frankfurter.dev/v2/rates', async () => {
    const arbCurrencyCode = fc
      .stringMatching(/^[A-Z]{3}$/)
      .filter((c) => c !== 'USD')

    const arbRate = fc.double({ min: 0.001, max: 50000, noNaN: true, noDefaultInfinity: true })

    const arbEntries = fc
      .uniqueArray(arbCurrencyCode, { minLength: 1, maxLength: 10 })
      .chain((codes) =>
        fc.tuple(...codes.map(() => arbRate)).map((rates) => {
          return codes.map((code, i) => ({
            base: 'USD',
            quote: code,
            rate: rates[i],
          }))
        }),
      )

    await fc.assert(
      fc.asyncProperty(arbEntries, async (entries) => {
        vi.resetAllMocks()
        axios.get.mockResolvedValue({ data: entries })

        const { obtenerTasasDeCambio } = await import('@/services/divisas')
        const result = await obtenerTasasDeCambio()

        const calledUrl = axios.get.mock.calls[0][0]
        expect(calledUrl).toBe('https://api.frankfurter.dev/v2/rates')
        expect(Object.keys(result).length).toBeGreaterThan(0)
      }),
      { numRuns: 20 },
    )
  })
})
