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

  it('should call https://api.frankfurter.app/latest with base=USD and return non-empty rates', async () => {
    // Set up axios mock to capture the URL being called
    const fakeRates = { EUR: 0.92, GBP: 0.79, CLP: 950.5, ARS: 870.2 }
    axios.get.mockResolvedValue({ data: { rates: fakeRates } })

    // Import the module fresh to get the actual URL it uses
    const { obtenerTasasDeCambio } = await import('@/services/divisas')

    await obtenerTasasDeCambio()

    // Assert: The function MUST call the correct URL
    expect(axios.get).toHaveBeenCalledWith(
      'https://api.frankfurter.app/latest',
      expect.objectContaining({ params: { base: 'USD' } }),
    )
  })

  /**
   * Property-based: For any set of currency rates returned by the API,
   * obtenerTasasDeCambio() should resolve with non-empty rates when using
   * the correct URL.
   *
   * This test uses fast-check to generate random rate maps and verifies
   * that the URL called is the correct one.
   */
  it('property: URL used by obtenerTasasDeCambio is https://api.frankfurter.app/latest for any rates response', async () => {
    const arbCurrencyCode = fc
      .stringMatching(/^[A-Z]{3}$/)
      .filter((c) => c !== 'USD')

    const arbRate = fc.double({ min: 0.001, max: 50000, noNaN: true, noDefaultInfinity: true })

    const arbRatesMap = fc
      .uniqueArray(arbCurrencyCode, { minLength: 1, maxLength: 10 })
      .chain((codes) =>
        fc.tuple(...codes.map(() => arbRate)).map((rates) => {
          const map = {}
          codes.forEach((code, i) => {
            map[code] = rates[i]
          })
          return map
        }),
      )

    await fc.assert(
      fc.asyncProperty(arbRatesMap, async (ratesMap) => {
        vi.resetAllMocks()
        axios.get.mockResolvedValue({ data: { rates: ratesMap } })

        const { obtenerTasasDeCambio } = await import('@/services/divisas')
        const result = await obtenerTasasDeCambio()

        // The URL must be the correct one
        const calledUrl = axios.get.mock.calls[0][0]
        expect(calledUrl).toBe('https://api.frankfurter.app/latest')

        // Result should be non-empty
        expect(Object.keys(result).length).toBeGreaterThan(0)
      }),
      { numRuns: 20 },
    )
  })
})
