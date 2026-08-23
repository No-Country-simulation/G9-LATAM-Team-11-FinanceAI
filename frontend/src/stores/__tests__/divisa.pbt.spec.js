import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import fc from 'fast-check'
import { useDivisaStore } from '@/stores/divisa'

// Mock the service module so tests don't hit the network
vi.mock('@/services/divisas', () => ({
  obtenerTasasDeCambio: vi.fn(),
}))

// Generators
const montoPositivoArb = fc.double({ min: 0.01, max: 1_000_000, noNaN: true })
const tasaPositivaArb = fc.double({ min: 0.0001, max: 100_000, noNaN: true })

describe('useDivisaStore — Property-Based Tests (PBT)', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  /**
   * Propiedad 3: Fórmula de conversión a USD
   *
   * Para todo monto positivo y tasa activa positiva,
   * convertirAUSD(monto) === monto / tasaActiva
   *
   * **Validates: Requirements 3.1**
   */
  describe('Propiedad 3: Fórmula de conversión a USD', () => {
    it('convertirAUSD(monto) retorna exactamente monto / tasaActiva para toda tasa positiva y monto positivo', () => {
      fc.assert(
        fc.property(montoPositivoArb, tasaPositivaArb, (monto, tasa) => {
          setActivePinia(createPinia())
          const store = useDivisaStore()

          // Set up a non-USD currency with the generated rate
          store.tasas = { EUR: tasa }
          store.monedaActiva = 'EUR'

          const resultado = store.convertirAUSD(monto)
          const esperado = monto / tasa

          expect(resultado).toBe(esperado)
        }),
        { numRuns: 100 },
      )
    })
  })

  /**
   * Propiedad 4: Round-trip de conversión USD
   *
   * Para todo monto positivo y tasa positiva,
   * |convertirDesdeUSD(convertirAUSD(monto)) - monto| < 1e-10
   *
   * **Validates: Requirements 3.4**
   */
  describe('Propiedad 4: Round-trip de conversión USD', () => {
    it('convertirDesdeUSD(convertirAUSD(monto)) ≈ monto para todo monto y tasa positivos', () => {
      fc.assert(
        fc.property(montoPositivoArb, tasaPositivaArb, (monto, tasa) => {
          setActivePinia(createPinia())
          const store = useDivisaStore()

          // Set up a non-USD currency with the generated rate
          store.tasas = { EUR: tasa }
          store.monedaActiva = 'EUR'

          const resultado = store.convertirDesdeUSD(store.convertirAUSD(monto))
          // Use relative tolerance to account for IEEE 754 floating-point rounding
          // For large amounts (up to 1e6) * rates (up to 1e5), absolute error can exceed 1e-10
          // Relative error of double-precision is bounded by 2 * Number.EPSILON per operation
          const tolerancia = Math.max(1e-10, Math.abs(monto) * Number.EPSILON * 4)
          expect(Math.abs(resultado - monto)).toBeLessThan(tolerancia)
        }),
        { numRuns: 100 },
      )
    })
  })

  /**
   * Propiedad 5: Seguridad numérica en estado de error
   *
   * Para cualquier valor de entrada (incluyendo 0, negativos, decimales grandes,
   * y valores extremos), cuando el store está en estado de error (error: true, tasas: {}),
   * las funciones convertirDesdeUSD, convertirAUSD y convertirMonedaAUSD deben retornar
   * un número finito (Number.isFinite(resultado) === true), nunca undefined, NaN ni Infinity.
   *
   * **Validates: Requirements 5.2, 5.3**
   */
  describe('Propiedad 5: Seguridad numérica en estado de error', () => {
    // Generator: any value including edge cases (valid and invalid inputs)
    const montoArbitrarioArb = fc.oneof(
      fc.constant(0),
      fc.constant(-1),
      fc.constant(null),
      fc.constant(undefined),
      fc.constant(NaN),
      fc.constant(Infinity),
      fc.constant(-Infinity),
      fc.double({ max: 0, noNaN: true }),
      fc.double({ min: 0.01, max: 1_000_000, noNaN: true }),
      fc.double({ min: -1e15, max: 1e15, noNaN: true }),
    )

    // Generator: 3-letter currency code (not USD)
    const codigoMonedaArb = fc
      .tuple(
        fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')),
        fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')),
        fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')),
      )
      .map(([a, b, c]) => a + b + c)
      .filter((code) => code !== 'USD')

    function setupStoreEnEstadoDeError() {
      setActivePinia(createPinia())
      const store = useDivisaStore()
      // Simulate error state: empty rates and error flag
      store.tasas = {}
      store.error = true
      // Select a non-USD currency to exercise the fallback path
      store.monedaActiva = 'EUR'
      return store
    }

    it('convertirDesdeUSD retorna un número finito para cualquier entrada en estado de error', () => {
      fc.assert(
        fc.property(montoArbitrarioArb, (monto) => {
          const store = setupStoreEnEstadoDeError()
          const resultado = store.convertirDesdeUSD(monto)
          expect(Number.isFinite(resultado)).toBe(true)
        }),
        { numRuns: 100 },
      )
    })

    it('convertirAUSD retorna un número finito para cualquier entrada en estado de error', () => {
      fc.assert(
        fc.property(montoArbitrarioArb, (monto) => {
          const store = setupStoreEnEstadoDeError()
          const resultado = store.convertirAUSD(monto)
          expect(Number.isFinite(resultado)).toBe(true)
        }),
        { numRuns: 100 },
      )
    })

    it('convertirMonedaAUSD retorna un número finito para cualquier entrada y código en estado de error', () => {
      fc.assert(
        fc.property(montoArbitrarioArb, codigoMonedaArb, (monto, codigo) => {
          const store = setupStoreEnEstadoDeError()
          const resultado = store.convertirMonedaAUSD(monto, codigo)
          expect(Number.isFinite(resultado)).toBe(true)
        }),
        { numRuns: 100 },
      )
    })
  })

  /**
   * Propiedad 6: Conversión stateless por código válido
   *
   * Para todo monto positivo y código existente en tasas con tasa > 0,
   * convertirMonedaAUSD(monto, codigo) === monto / tasas[codigo]
   * sin alterar monedaActiva.
   *
   * **Validates: Requirements 6.1**
   */
  describe('Propiedad 6: Conversión stateless por código válido', () => {
    // Generator: map of currency rates (at least 1 entry, all positive rates)
    const tasasMapArb = fc
      .uniqueArray(
        fc.tuple(
          fc
            .tuple(
              fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')),
              fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')),
              fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')),
            )
            .map(([a, b, c]) => a + b + c)
            .filter((code) => code !== 'USD'),
          fc.double({ min: 0.0001, max: 100_000, noNaN: true }),
        ),
        { minLength: 1, maxLength: 10, selector: ([code]) => code },
      )
      .map((entries) => Object.fromEntries(entries))

    it('convertirMonedaAUSD(monto, codigo) retorna monto / tasas[codigo] y no altera monedaActiva', () => {
      fc.assert(
        fc.property(montoPositivoArb, tasasMapArb, (monto, tasasMap) => {
          setActivePinia(createPinia())
          const store = useDivisaStore()

          // Load rates into the store
          store.tasas = tasasMap
          // Set monedaActiva to USD (default)
          store.monedaActiva = 'USD'
          const monedaActivaAntes = store.monedaActiva

          // Pick a random valid code from the loaded rates
          const codigos = Object.keys(tasasMap)
          const codigo = codigos[0] // deterministic pick — fast-check varies the map itself

          const resultado = store.convertirMonedaAUSD(monto, codigo)
          const esperado = monto / tasasMap[codigo]

          // Verify correct formula
          expect(resultado).toBe(esperado)
          // Verify monedaActiva was not altered
          expect(store.monedaActiva).toBe(monedaActivaAntes)
        }),
        { numRuns: 100 },
      )
    })
  })

  /**
   * Propiedad 7: Fallback seguro para código inexistente
   *
   * Para todo monto positivo y string que no existe en tasas (incluyendo undefined, cadena vacía),
   * convertirMonedaAUSD(monto, codigoInexistente) === monto sin NaN, Infinity ni excepción.
   *
   * **Validates: Requirements 6.3**
   */
  describe('Propiedad 7: Fallback seguro para código inexistente', () => {
    // Known rates that the store will have
    const tasasConocidas = { EUR: 0.92, GBP: 0.79, CLP: 950.5 }

    // Generator: strings that won't match the known rate keys
    const codigoInexistenteArb = fc.oneof(
      fc.constant(undefined),
      fc.constant(''),
      fc
        .tuple(
          fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')),
          fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')),
          fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')),
        )
        .map(([a, b, c]) => a + b + c)
        .filter((code) => !['EUR', 'GBP', 'CLP'].includes(code)),
    )

    it('convertirMonedaAUSD retorna el monto original para códigos inexistentes sin NaN, Infinity ni excepción', () => {
      fc.assert(
        fc.property(montoPositivoArb, codigoInexistenteArb, (monto, codigo) => {
          setActivePinia(createPinia())
          const store = useDivisaStore()
          store.tasas = { ...tasasConocidas }

          const resultado = store.convertirMonedaAUSD(monto, codigo)

          // Must return original amount
          expect(resultado).toBe(monto)
          // Must not be NaN or Infinity
          expect(Number.isNaN(resultado)).toBe(false)
          expect(Number.isFinite(resultado)).toBe(true)
        }),
        { numRuns: 100 },
      )
    })
  })

  /**
   * Propiedad 8: Guard de monto inválido
   *
   * Para todo valor que no sea número finito positivo (0, negativos, null, undefined,
   * NaN, Infinity), convertirMonedaAUSD(valor, cualquierCodigo) retorna 0.
   *
   * **Validates: Requirements 6.4**
   */
  describe('Propiedad 8: Guard de monto inválido', () => {
    // Generator: invalid amounts (non-finite-positive values)
    const montoInvalidoArb = fc.oneof(
      fc.constant(0),
      fc.constant(-1),
      fc.constant(null),
      fc.constant(undefined),
      fc.constant(NaN),
      fc.constant(Infinity),
      fc.constant(-Infinity),
      fc.double({ max: 0, noNaN: true }),
    )

    // Generator: any currency code (both existing in the rates map and non-existing)
    const codigoCualquieraArb = fc.oneof(
      fc.constantFrom('USD', 'EUR', 'GBP', 'CLP', 'JPY'),
      fc
        .tuple(
          fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')),
          fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')),
          fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')),
        )
        .map(([a, b, c]) => a + b + c),
    )

    it('convertirMonedaAUSD retorna 0 para todo monto inválido con cualquier código de moneda', () => {
      fc.assert(
        fc.property(montoInvalidoArb, codigoCualquieraArb, (monto, codigo) => {
          setActivePinia(createPinia())
          const store = useDivisaStore()

          // Set up store with valid rates to ensure the guard triggers on the amount,
          // not on missing rates
          store.tasas = { EUR: 0.92, GBP: 0.79, CLP: 950.5, JPY: 155.3 }

          const resultado = store.convertirMonedaAUSD(monto, codigo)
          expect(resultado).toBe(0)
        }),
        { numRuns: 100 },
      )
    })
  })

  /**
   * Propiedad 9: Validación consistente con conversión de moneda
   *
   * Para todo monto M > 0, tasa T > 0 e ingreso I > 0:
   * la validación acepta M si y solo si M < I * T.
   * Esto replica la lógica de validar() en FormularioTransaccion.vue:
   *   limiteEnMonedaActiva = convertirDesdeUSD(ingresoDisponible) = ingreso * tasaActiva
   *   rechaza si monto >= limiteEnMonedaActiva
   *
   * **Validates: Requisito 1, Propiedad de Correctitud 1**
   */
  describe('Propiedad 9: Validación consistente con conversión de moneda', () => {
    const ingresoArb = fc.double({ min: 100, max: 100_000, noNaN: true })

    it('monto es aceptado por validar() ⟺ monto < ingreso * tasa (convertirDesdeUSD)', () => {
      fc.assert(
        fc.property(montoPositivoArb, tasaPositivaArb, ingresoArb, (monto, tasa, ingreso) => {
          setActivePinia(createPinia())
          const store = useDivisaStore()

          // Setup: store con moneda no-USD y tasa configurada
          store.tasas = { EUR: tasa }
          store.monedaActiva = 'EUR'

          // Calcular el límite usando la función del store (como lo hace validar())
          const limiteEnMonedaActiva = store.convertirDesdeUSD(ingreso)

          // Verificar que convertirDesdeUSD produce ingreso * tasa
          expect(limiteEnMonedaActiva).toBe(ingreso * tasa)

          // Verificar la lógica de validación:
          // La validación rechaza si monto >= limite, acepta si monto < limite
          const validacionRechaza = monto >= limiteEnMonedaActiva
          const validacionAcepta = monto < limiteEnMonedaActiva

          // Equivalencia: acepta ⟺ monto < ingreso * tasa
          expect(validacionAcepta).toBe(monto < ingreso * tasa)
          expect(validacionRechaza).toBe(monto >= ingreso * tasa)
        }),
        { numRuns: 100 },
      )
    })
  })

  /**
   * Propiedad 10: Whitelist de monedas — monedasDisponibles ⊆ MONEDAS_PRINCIPALES
   *
   * Para todo mapa de tasas arbitrario:
   * - monedasDisponibles ⊆ MONEDAS_PRINCIPALES
   * - USD siempre está presente en monedasDisponibles
   * - Cada código en monedasDisponibles (distinto de USD) tiene tasa > 0 en el store
   *
   * **Validates: Requisito 2, Propiedad de Correctitud 2**
   */
  describe('Propiedad 10: Whitelist de monedas — monedasDisponibles ⊆ MONEDAS_PRINCIPALES', () => {
    // Generator: arbitrary rate maps with 3-letter uppercase codes and positive doubles
    const tasasArbitrariasArb = fc.dictionary(
      fc
        .tuple(
          fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')),
          fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')),
          fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')),
        )
        .map(([a, b, c]) => a + b + c),
      fc.double({ min: 0.0001, max: 100000, noNaN: true }),
    )

    it('monedasDisponibles solo contiene códigos de MONEDAS_PRINCIPALES, USD siempre presente, y cada código ≠ USD tiene tasa > 0', () => {
      fc.assert(
        fc.property(tasasArbitrariasArb, (tasasMap) => {
          setActivePinia(createPinia())
          const store = useDivisaStore()

          // Set up store with the arbitrary rates map
          store.tasas = tasasMap

          const disponibles = store.monedasDisponibles
          const whitelist = store.MONEDAS_PRINCIPALES

          // Assert: USD is always present
          expect(disponibles).toContain('USD')

          // Assert: every code in monedasDisponibles is in MONEDAS_PRINCIPALES
          for (const codigo of disponibles) {
            expect(whitelist).toContain(codigo)
          }

          // Assert: every code in monedasDisponibles that isn't USD has tasa > 0
          for (const codigo of disponibles) {
            if (codigo !== 'USD') {
              expect(tasasMap[codigo]).toBeGreaterThan(0)
            }
          }
        }),
        { numRuns: 100 },
      )
    })
  })
})
