import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const CLAVE_INGRESO = 'financeai:ingreso-original'

export const useUsuarioStore = defineStore('usuario', () => {
  const id = ref(null)
  const nombre = ref('')
  const ingresoDisponible = ref(null)
  // Ingreso mensual original declarado al registrarse (no varía con los gastos)
  const ingresoOriginal = ref(Number(localStorage.getItem(CLAVE_INGRESO)) || null)
  const transacciones = ref([])
  const resumenesMensuales = ref([])
  const cargando = ref(false)
  const error = ref('')

  const tieneSesion = computed(() => id.value !== null)
  const esDemo = computed(() => id.value === null || id.value === 0)

  function setUsuario(datos) {
    id.value = datos.id
    if (datos.nombre !== undefined) nombre.value = datos.nombre
    if (datos.ingresoDisponible !== undefined) ingresoDisponible.value = datos.ingresoDisponible
    if (datos.ingresoOriginal !== undefined) {
      ingresoOriginal.value = datos.ingresoOriginal
      localStorage.setItem(CLAVE_INGRESO, String(datos.ingresoOriginal))
    }
  }

  function setIngresoDisponible(monto) {
    ingresoDisponible.value = monto
  }

  function setTransacciones(lista) {
    transacciones.value = Array.isArray(lista) ? lista : []
  }

  function setResumenesMensuales(lista) {
    resumenesMensuales.value = Array.isArray(lista) ? lista : []
  }

  function setCargando(estado) {
    cargando.value = estado
  }

  function setError(mensaje) {
    error.value = mensaje
  }

  function limpiar() {
    id.value = null
    nombre.value = ''
    ingresoDisponible.value = null
    ingresoOriginal.value = null
    transacciones.value = []
    resumenesMensuales.value = []
    cargando.value = false
    error.value = ''
    localStorage.removeItem(CLAVE_INGRESO)
  }

  return {
    id,
    nombre,
    ingresoDisponible,
    ingresoOriginal,
    transacciones,
    resumenesMensuales,
    cargando,
    error,
    tieneSesion,
    esDemo,
    setUsuario,
    setIngresoDisponible,
    setTransacciones,
    setResumenesMensuales,
    setCargando,
    setError,
    limpiar,
  }
})
