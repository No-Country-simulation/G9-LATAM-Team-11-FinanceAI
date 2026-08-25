import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { obtenerTasasDeCambio } from '@/services/divisas'

const CLAVE_MONEDA = 'financeai:moneda'

export const useDivisaStore = defineStore('divisa', () => {
  /**
   * Whitelist de monedas principales del mundo (enfocada en usuarios LATAM).
   */
  const MONEDAS_PRINCIPALES = [
    'USD', 'EUR', 'GBP', 'JPY', 'CLP', 'ARS', 'BRL',
    'MXN', 'CAD', 'AUD', 'CNY', 'CHF', 'COP', 'PEN',
  ]

  const tasas = ref({})
  const monedaActiva = ref(localStorage.getItem(CLAVE_MONEDA) || 'USD')
  const cargando = ref(false)
  const error = ref(false)

  const monedasDisponibles = computed(() => {
    const disponibles = MONEDAS_PRINCIPALES.filter(
      codigo => codigo === 'USD' || tasas.value[codigo] != null
    )
    // Asegurar que la moneda activa siempre esté presente aunque la API falle
    if (!disponibles.includes(monedaActiva.value)) {
      disponibles.push(monedaActiva.value)
    }
    return disponibles.sort()
  })

  const tasaActiva = computed(() => {
    if (monedaActiva.value === 'USD') return 1
    return tasas.value[monedaActiva.value] ?? 1
  })

  async function cargarTasas() {
    cargando.value = true
    error.value = false
    try {
      tasas.value = await obtenerTasasDeCambio()
      // Fallback si la moneda activa no está en la whitelist
      if (!MONEDAS_PRINCIPALES.includes(monedaActiva.value)) {
        seleccionarMoneda('USD')
      }
    } catch {
      tasas.value = {}
      error.value = true
    } finally {
      cargando.value = false
    }
  }

  function seleccionarMoneda(codigo) {
    monedaActiva.value = codigo
    localStorage.setItem(CLAVE_MONEDA, codigo)
  }

  function convertirDesdeUSD(monto) {
    if (!Number.isFinite(monto)) return 0
    return monto * tasaActiva.value
  }

  function convertirAUSD(monto) {
    if (!Number.isFinite(monto)) return 0
    return monto / tasaActiva.value
  }

  function convertirMonedaAUSD(monto, codigoMoneda) {
    if (!Number.isFinite(monto) || monto <= 0) return 0
    if (codigoMoneda === 'USD') return monto
    const tasa = tasas.value[codigoMoneda]
    if (!tasa || tasa <= 0) return monto
    return monto / tasa
  }

  return {
    tasas,
    monedaActiva,
    cargando,
    error,
    monedasDisponibles,
    tasaActiva,
    cargarTasas,
    seleccionarMoneda,
    convertirDesdeUSD,
    convertirAUSD,
    convertirMonedaAUSD,
    MONEDAS_PRINCIPALES,
  }
})
