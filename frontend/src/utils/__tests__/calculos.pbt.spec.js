/**
 * Property-Based Tests para los cálculos financieros locales de FinanceAI.
 * Usa fast-check para validar matemáticamente propiedades de los algoritmos
 * de endeudamiento, ratio de gastos y análisis mock.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import fc from 'fast-check'

// ─── Re-implementamos las funciones puras directamente (son helpers internos) ──
// Replicado de useAnalisisFinanciero.js para testear en aislamiento
function calcularEndeudamiento(transacciones, ingreso) {
  if (!ingreso || ingreso <= 0) return 0
  const gastosFijos = transacciones
    .filter((t) => {
      const c = String(t.categoria || 'otro').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      return c === 'vivienda' || c === 'servicios'
    })
    .reduce((total, t) => total + Number(t.monto || 0), 0)

  if (gastosFijos > 0) {
    return Math.min(100, Math.round((gastosFijos / ingreso) * 100))
  }
  const totalGastos = transacciones.reduce((total, t) => total + Number(t.monto || 0), 0)
  return Math.min(100, Math.round((totalGastos / ingreso) * 100))
}

function calcularResumenGastos(transacciones) {
  const porCategoria = {}
  for (const t of transacciones) {
    const categoria = t.categoria || 'otro'
    porCategoria[categoria] = (porCategoria[categoria] || 0) + Number(t.monto || 0)
  }
  return porCategoria
}

// ─── Generadores de Arbitrarios ────────────────────────────────────────────────
const ingresoPositivoArb = fc.double({ min: 1, max: 1_000_000, noNaN: true })

const categoriaArb = fc.constantFrom(
  'vivienda', 'servicios', 'alimentacion', 'transporte',
  'salud', 'ocio', 'educacion', 'otro'
)

const transaccionArb = fc.record({
  descripcion: fc.string({ minLength: 1, maxLength: 50 }),
  monto: fc.double({ min: 0.01, max: 100_000, noNaN: true }),
  fecha: fc.constant('2025-08-15'),
  categoria: categoriaArb,
})

const listaTransaccionesArb = fc.array(transaccionArb, { minLength: 1, maxLength: 30 })

// ─── Tests ─────────────────────────────────────────────────────────────────────
describe('Cálculos Financieros — Property-Based Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  /**
   * Propiedad 1: El endeudamiento con ingreso cero siempre es 0.
   * - Prevents division by zero in the debt calculation.
   */
  describe('Propiedad 1: Ingreso nulo o negativo → endeudamiento = 0', () => {
    const ingresoInvalidoArb = fc.oneof(
      fc.constant(0),
      fc.constant(-1),
      fc.constant(-100_000),
      fc.double({ max: 0, noNaN: true }),
    )

    it('calcularEndeudamiento retorna 0 para cualquier ingreso <= 0', () => {
      fc.assert(
        fc.property(listaTransaccionesArb, ingresoInvalidoArb, (txs, ingreso) => {
          const resultado = calcularEndeudamiento(txs, ingreso)
          expect(resultado).toBe(0)
        }),
        { numRuns: 200 },
      )
    })
  })

  /**
   * Propiedad 2: El endeudamiento siempre está en el rango [0, 100].
   * - Never exceeds 100% or goes below 0%.
   */
  describe('Propiedad 2: Endeudamiento siempre en [0, 100]', () => {
    it('calcularEndeudamiento siempre retorna un valor entre 0 y 100 inclusive', () => {
      fc.assert(
        fc.property(listaTransaccionesArb, ingresoPositivoArb, (txs, ingreso) => {
          const resultado = calcularEndeudamiento(txs, ingreso)
          expect(resultado).toBeGreaterThanOrEqual(0)
          expect(resultado).toBeLessThanOrEqual(100)
        }),
        { numRuns: 200 },
      )
    })
  })

  /**
   * Propiedad 3: El resumen de gastos por categoría siempre es finito y positivo.
   * - All summed amounts must be finite and non-negative.
   */
  describe('Propiedad 3: Resumen de gastos siempre produce valores finitos positivos', () => {
    it('calcularResumenGastos: todos los valores del mapa son finitos y >= 0', () => {
      fc.assert(
        fc.property(listaTransaccionesArb, (txs) => {
          const resumen = calcularResumenGastos(txs)
          for (const monto of Object.values(resumen)) {
            expect(Number.isFinite(monto)).toBe(true)
            expect(monto).toBeGreaterThanOrEqual(0)
          }
        }),
        { numRuns: 200 },
      )
    })
  })

  /**
   * Propiedad 4: La suma de resumenGastos coincide con el total de montos en las transacciones.
   * - Consistency between individual transactions and category aggregation.
   */
  describe('Propiedad 4: Suma de resumenGastos == suma total de transacciones', () => {
    it('los totales por categoría suman igual al total de todas las transacciones', () => {
      fc.assert(
        fc.property(listaTransaccionesArb, (txs) => {
          const resumen = calcularResumenGastos(txs)
          const sumaResumen = Object.values(resumen).reduce((s, v) => s + v, 0)
          const sumaTotal = txs.reduce((s, t) => s + Number(t.monto || 0), 0)
          // Comparación con tolerancia de punto flotante
          expect(Math.abs(sumaResumen - sumaTotal)).toBeLessThan(1e-6)
        }),
        { numRuns: 200 },
      )
    })
  })

  /**
   * Propiedad 5: El ratio gastos/ingreso es monótono.
   * - Si aumentamos el gasto total manteniendo el mismo ingreso, el endeudamiento no decrece.
   */
  describe('Propiedad 5: Endeudamiento es monotónico respecto al gasto', () => {
    it('duplicar el monto de cada transaccion no reduce el endeudamiento', () => {
      fc.assert(
        fc.property(listaTransaccionesArb, ingresoPositivoArb, (txs, ingreso) => {
          const endBase = calcularEndeudamiento(txs, ingreso)
          // Duplicamos los montos para simular mayor gasto
          const txsDobles = txs.map(t => ({ ...t, monto: t.monto * 2 }))
          const endDoble = calcularEndeudamiento(txsDobles, ingreso)
          expect(endDoble).toBeGreaterThanOrEqual(endBase)
        }),
        { numRuns: 100 },
      )
    })
  })
})
