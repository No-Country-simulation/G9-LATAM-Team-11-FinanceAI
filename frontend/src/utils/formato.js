import { useDivisaStore } from '@/stores/divisa'

export function formatoMoneda(monto, fracciones = 2) {
  const divisaStore = useDivisaStore()
  const valor = Number(monto) || 0
  const convertido = divisaStore.convertirDesdeUSD(valor)
  const moneda = divisaStore.monedaActiva

  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: moneda,
      minimumFractionDigits: fracciones,
      maximumFractionDigits: fracciones,
    }).format(convertido)
  } catch {
    // Fallback: moneda inválida en localStorage → intentar con USD
    try {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: fracciones,
        maximumFractionDigits: fracciones,
      }).format(convertido)
    } catch {
      return `USD ${convertido.toFixed(fracciones)}`
    }
  }
}

export function formatoNumero(valor, fracciones = 0) {
  const numero = Number(valor) || 0
  return numero.toLocaleString(navigator.language || 'es', {
    minimumFractionDigits: fracciones,
    maximumFractionDigits: fracciones,
  })
}

export function formatoFecha(fecha) {
  if (!fecha) return ''
  const fechaObj = typeof fecha === 'string' ? new Date(`${fecha}T00:00:00`) : fecha
  return fechaObj.toLocaleDateString(navigator.language || undefined, { day: '2-digit', month: 'short' })
}

export function etiquetaMes(fecha) {
  return fecha.toLocaleDateString(navigator.language || undefined, { month: 'short' })
}
