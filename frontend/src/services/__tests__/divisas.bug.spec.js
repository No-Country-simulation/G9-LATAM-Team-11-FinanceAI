import { describe, it, expect, vi, beforeEach } from 'vitest'
import fc from 'fast-check'
import axios from 'axios'

/**
 * Bug Condition Exploration Test — Property 1(a): Frankfurter API URL
 *
 * Validates: Requirements 1.1, 1.2
 *
 * This test verifies that `obtenerTasasDeCambio()` calls the CORRECT endpoint
 * (`https://api.frankfurter.app/latest`) and returns non-empty rates.
 *
 * On UNFIXED code, `FRANKFURTER_URL` is `https://frankfurter.dev/v1/latest` which
 * returns HTTP 404, so this test MUST FAIL — confirming the bug exists.
 *
 * EXPECTED OUTCOME: FAIL on unfixed code (proves bug exists)
 */

vi.mock('axios')

describe('Bug Condition: obtenerTasasDeCambio uses correct Frankfurter URL', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should call https://api.frankfurter.dev/v2/rates with base=USD and return non-empty rates', async () => {
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
  })

  it('property: URL used by obtenerTasasDeCambio is https://api.frankfurter.dev/v2/rates for any rates response', async () => {
    const arbCurrencyCode = fc
      .stringMatching(/^[A-Z]{3}$/)
      .filter((c) => c !== 'USD')

    const arbRate = fc.double({ min: 0.001, max: 50000, noNaN: true, noDefaultInfinity: true })

    const arbRatesArray = fc
      .uniqueArray(arbCurrencyCode, { minLength: 1, maxLength: 10 })
      .chain((codes) =>
        fc.tuple(...codes.map(() => arbRate)).map((rates) =>
          codes.map((code, i) => ({
            date: '2026-08-22',
            base: 'USD',
            quote: code,
            rate: rates[i],
          })),
        ),
      )

    await fc.assert(
      fc.asyncProperty(arbRatesArray, async (entries) => {
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
