import { computed } from 'vue'
import { useUsuarioStore } from '@/stores/usuario'

function mismoMes(fecha, anio, mes) {
  const d = new Date(`${fecha}T00:00:00`)
  return d.getFullYear() === anio && d.getMonth() === mes
}

function normalizarCategoria(categoria) {
  return String(categoria || 'otro')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function useDashboard() {
  const store = useUsuarioStore()
  const ahora = new Date()
  const anio = ahora.getFullYear()
  const mes = ahora.getMonth()

  const transaccionesArray = computed(() => Array.isArray(store.transacciones) ? store.transacciones : [])

  const gastoMes = computed(() =>
    transaccionesArray.value
      .filter((transaccion) => mismoMes(transaccion.fecha, anio, mes))
      .reduce((total, transaccion) => total + Number(transaccion.monto || 0), 0),
  )

  const ingreso = computed(() => Number(store.ingresoDisponible || 0))

  const ingresoOriginal = computed(() => Number(store.ingresoOriginal || store.ingresoDisponible || 0))

  // Saldo disponible = ingreso original - gasto del mes actual
  const saldoDisponible = computed(() => Math.max(0, ingresoOriginal.value - gastoMes.value))

  // Ahorro = transacciones de categoría "ahorros" del mes actual
  // (preparado para incluir remanente del mes anterior cuando backend lo implemente)
  const ahorroMes = computed(() => {
    const ahorroTransacciones = transaccionesArray.value
      .filter((t) => mismoMes(t.fecha, anio, mes) && normalizarCategoria(t.categoria) === 'ahorros')
      .reduce((sum, t) => sum + Number(t.monto || 0), 0)
    // TODO: sumar remanente mes anterior cuando backend exponga ese dato
    return ahorroTransacciones
  })

  const endeudamiento = computed(() => {
    // Usamos la constante de gastos fijos oficial (vivienda, servicios) para coincidir con el backend
    const base = Number(store.ingresoOriginal || store.ingresoDisponible || 0)
    if (!base) return 0

    const gastosFijos = transaccionesArray.value
      .filter((t) => mismoMes(t.fecha, anio, mes))
      .filter((t) => {
        const cat = normalizarCategoria(t.categoria)
        return cat === 'vivienda' || cat === 'servicios'
      })
      .reduce((sum, t) => sum + Number(t.monto || 0), 0)

    // Si existen gastos fijos, calcular % de endeudamiento fijos sobre ingreso; de lo contrario fallback a ratio de gasto general
    if (gastosFijos > 0) {
      return Math.min(100, Math.round((gastosFijos / base) * 100))
    }
    return Math.min(100, Math.round((gastoMes.value / base) * 100))
  })

  const porCategoria = computed(() => {
    const mapa = new Map()
    for (const transaccion of transaccionesArray.value) {
      const clave = normalizarCategoria(transaccion.categoria)
      mapa.set(clave, (mapa.get(clave) || 0) + Number(transaccion.monto || 0))
    }
    return [...mapa.entries()].sort((a, b) => b[1] - a[1])
  })

  const evolucionMensual = computed(() => {
    const lista = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(anio, mes - i, 1)
      const total = transaccionesArray.value
        .filter((transaccion) => mismoMes(transaccion.fecha, d.getFullYear(), d.getMonth()))
        .reduce((suma, transaccion) => suma + Number(transaccion.monto || 0), 0)
      lista.push({ mes: d, total })
    }
    return lista
  })

  const ultimasTransacciones = computed(() =>
    [...transaccionesArray.value]
      .sort((a, b) => new Date(`${b.fecha}T00:00:00`) - new Date(`${a.fecha}T00:00:00`))
      .slice(0, 5),
  )

  // Inversión = transacciones de categoría "inversion" del mes actual
  const inversionMes = computed(() =>
    transaccionesArray.value
      .filter((t) => mismoMes(t.fecha, anio, mes) && normalizarCategoria(t.categoria) === 'inversion')
      .reduce((sum, t) => sum + Number(t.monto || 0), 0),
  )

  return {
    gastoMes,
    ingreso,
    ingresoOriginal,
    saldoDisponible,
    ahorroMes,
    inversionMes,
    endeudamiento,
    porCategoria,
    evolucionMensual,
    ultimasTransacciones,
  }
}
