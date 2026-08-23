import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUsuarioStore = defineStore('usuario', () => {
  const id = ref(null)
  const nombre = ref('')
  const ingresoDisponible = ref(null)
  const transacciones = ref([])
  const cargando = ref(false)
  const error = ref('')

  const tieneSesion = computed(() => id.value !== null)

  function setUsuario(datos) {
    id.value = datos.id
    if (datos.nombre !== undefined) nombre.value = datos.nombre
    if (datos.ingresoDisponible !== undefined) ingresoDisponible.value = datos.ingresoDisponible
  }

  function setIngresoDisponible(monto) {
    ingresoDisponible.value = monto
  }

  function setTransacciones(lista) {
    transacciones.value = lista
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
    transacciones.value = []
    cargando.value = false
    error.value = ''
  }

  return {
    id,
    nombre,
    ingresoDisponible,
    transacciones,
    cargando,
    error,
    tieneSesion,
    setUsuario,
    setIngresoDisponible,
    setTransacciones,
    setCargando,
    setError,
    limpiar,
  }
})
