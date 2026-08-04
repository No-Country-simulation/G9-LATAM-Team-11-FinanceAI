import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAnalisisFinancieroStore = defineStore('analisisFinanciero', () => {
  const ingresoMensual = ref(null)
  const nivelEndeudamiento = ref(null)
  const frecuenciaAhorro = ref('')
  const transacciones = ref([])
  const resultado = ref(null)
  const loading = ref(false)
  const error = ref('')

  const tieneResultado = computed(() => resultado.value !== null)

  function setDatosFinancieros(datos) {
    ingresoMensual.value = datos.ingresoMensual
    nivelEndeudamiento.value = datos.nivelEndeudamiento
    frecuenciaAhorro.value = datos.frecuenciaAhorro
  }

  function setTransacciones(lista) {
    transacciones.value = lista
  }

  function setResultado(res) {
    resultado.value = res
  }

  function setLoading(estado) {
    loading.value = estado
  }

  function setError(mensaje) {
    error.value = mensaje
  }

  function limpiarResultado() {
    resultado.value = null
    error.value = ''
  }

  return {
    ingresoMensual,
    nivelEndeudamiento,
    frecuenciaAhorro,
    transacciones,
    resultado,
    loading,
    error,
    tieneResultado,
    setDatosFinancieros,
    setTransacciones,
    setResultado,
    setLoading,
    setError,
    limpiarResultado,
  }
})
