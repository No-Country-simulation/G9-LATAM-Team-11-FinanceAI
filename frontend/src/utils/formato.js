export function formatoMoneda(monto, fracciones = 2) {
  const valor = Number(monto) || 0
  return `$${valor.toLocaleString('es-AR', {
    minimumFractionDigits: fracciones,
    maximumFractionDigits: fracciones,
  })}`
}

export function formatoNumero(valor, fracciones = 0) {
  const numero = Number(valor) || 0
  return numero.toLocaleString('es-AR', {
    minimumFractionDigits: fracciones,
    maximumFractionDigits: fracciones,
  })
}

export function formatoFecha(fecha) {
  if (!fecha) return ''
  const fechaObj = typeof fecha === 'string' ? new Date(`${fecha}T00:00:00`) : fecha
  return fechaObj.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
}

export function etiquetaMes(fecha) {
  return fecha.toLocaleDateString('es-AR', { month: 'short' })
}
