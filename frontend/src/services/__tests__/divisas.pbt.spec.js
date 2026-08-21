import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { transformarRespuestaV2 } from '../divisas.js'

describe('transformarRespuestaV2 - Property-Based Tests', () => {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  // Generador de código de moneda de 3 letras mayúsculas
  const codigoMonedaArb = fc
    .tuple(fc.constantFrom(...letras), fc.constantFrom(...letras), fc.constantFrom(...letras))
    .map(([a, b, c]) => a + b + c)

  // Generador de fecha como string YYYY-MM-DD (evita problemas con fc.date() e Invalid Date)
  const fechaArb = fc
    .tuple(
      fc.integer({ min: 2000, max: 2030 }),
      fc.integer({ min: 1, max: 12 }),
      fc.integer({ min: 1, max: 28 }),
    )
    .map(([y, m, d]) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`)

  // Generador de EntradaTasa válida
  const entradaTasaArb = fc.record({
    date: fechaArb,
    base: fc.constant('USD'),
    quote: codigoMonedaArb,
    rate: fc.double({ min: 0.0001, max: 100000, noNaN: true }),
  })

  /**
   * Propiedad 2: Exclusión de la moneda base del mapa
   *
   * Para cualquier array de entrada que contenga objetos donde quote === base
   * (e.g., quote: "USD" cuando base: "USD"), el mapa resultante de
   * transformarRespuestaV2 nunca debe contener la clave correspondiente a la
   * moneda base.
   *
   * **Validates: Requirements 2.2**
   */
  it('P2: el mapa resultante nunca contiene la clave de la moneda base', () => {
    // Generador que garantiza al menos una entrada con quote === base ("USD")
    const entradaBaseArb = fc.record({
      date: fechaArb,
      base: fc.constant('USD'),
      quote: fc.constant('USD'),
      rate: fc.double({ min: 0.0001, max: 100000, noNaN: true }),
    })

    const arrayConBaseArb = fc
      .tuple(
        fc.array(entradaTasaArb, { minLength: 0, maxLength: 30 }),
        fc.array(entradaBaseArb, { minLength: 1, maxLength: 5 }),
      )
      .map(([normales, bases]) => {
        // Mezclar entradas normales con entradas donde quote === base
        const combined = [...normales, ...bases]
        // Shuffle para que las posiciones varíen
        for (let i = combined.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[combined[i], combined[j]] = [combined[j], combined[i]]
        }
        return combined
      })

    fc.assert(
      fc.property(arrayConBaseArb, (entradas) => {
        const mapa = transformarRespuestaV2(entradas)
        // La moneda base (USD) nunca debe aparecer como clave en el mapa
        expect(mapa).not.toHaveProperty('USD')
      }),
      { numRuns: 100 },
    )
  })
})
