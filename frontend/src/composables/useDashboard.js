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

  const gastoMes = computed(() =>
    store.transacciones
      .filter((transaccion) => mismoMes(transaccion.fecha, anio, mes))
      .reduce((total, transaccion) => total + Number(transaccion.monto || 0), 0),
  )

  const ingreso = computed(() => Number(store.ingresoDisponible || 0))

  const ahorroMes = computed(() => Math.max(0, ingreso.value - gastoMes.value))

  const endeudamiento = computed(() => {
    if (!ingreso.value) return 0
    return Math.min(100, Math.round((gastoMes.value / ingreso.value) * 100))
  })

  const porCategoria = computed(() => {
    const mapa = new Map()
    for (const transaccion of store.transacciones) {
      const clave = normalizarCategoria(transaccion.categoria)
      mapa.set(clave, (mapa.get(clave) || 0) + Number(transaccion.monto || 0))
    }
    return [...mapa.entries()].sort((a, b) => b[1] - a[1])
  })

  const evolucionMensual = computed(() => {
    const lista = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(anio, mes - i, 1)
      const total = store.transacciones
        .filter((transaccion) => mismoMes(transaccion.fecha, d.getFullYear(), d.getMonth()))
        .reduce((suma, transaccion) => suma + Number(transaccion.monto || 0), 0)
      lista.push({ mes: d, total })
    }
    return lista
  })

  const ultimasTransacciones = computed(() =>
    [...store.transacciones]
      .sort((a, b) => new Date(`${b.fecha}T00:00:00`) - new Date(`${a.fecha}T00:00:00`))
      .slice(0, 5),
  )

  return {
    gastoMes,
    ingreso,
    ahorroMes,
    endeudamiento,
    porCategoria,
    evolucionMensual,
    ultimasTransacciones,
  }
}
