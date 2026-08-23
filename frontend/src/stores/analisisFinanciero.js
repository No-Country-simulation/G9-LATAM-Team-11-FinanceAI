import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAnalisisFinancieroStore = defineStore('analisisFinanciero', () => {
  const resultado = ref(null)
  const historial = ref([])
  const frecuenciaAhorro = ref(null)
  const endeudamientoBackend = ref(null)
  const loading = ref(false)
  const error = ref('')

  const tieneResultado = computed(() => resultado.value !== null)

  function setResultado(res) {
    resultado.value = res
  }

  function setHistorial(lista) {
    historial.value = lista
  }

  function setFrecuenciaAhorro(frecuencia) {
    frecuenciaAhorro.value = frecuencia
  }

  function setEndeudamientoBackend(valor) {
    endeudamientoBackend.value = valor !== null && valor !== undefined ? Number(valor) : null
  }

  function verAnalisis(id) {
    const entrada = historial.value.find((h) => h.id === id)
    if (entrada) {
      resultado.value = entrada
    }
  }

  function setLoading(estado) {
    loading.value = estado
  }

  function setError(mensaje) {
    error.value = mensaje
  }

  function reset() {
    resultado.value = null
    historial.value = []
    frecuenciaAhorro.value = null
    endeudamientoBackend.value = null
    loading.value = false
    error.value = ''
  }

  function limpiarResultado() {
    resultado.value = null
    error.value = ''
  }

  return {
    resultado,
    historial,
    frecuenciaAhorro,
    endeudamientoBackend,
    loading,
    error,
    tieneResultado,
    setResultado,
    setHistorial,
    setFrecuenciaAhorro,
    setEndeudamientoBackend,
    verAnalisis,
    setLoading,
    setError,
    limpiarResultado,
    reset,
  }
})
