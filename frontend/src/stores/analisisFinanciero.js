import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAnalisisFinancieroStore = defineStore('analisisFinanciero', () => {
  const resultado = ref(null)
  const historial = ref([])
  const loading = ref(false)
  const error = ref('')

  const tieneResultado = computed(() => resultado.value !== null)

  function setResultado(res) {
    resultado.value = res
  }

  function setHistorial(lista) {
    historial.value = lista
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

  function limpiarResultado() {
    resultado.value = null
    error.value = ''
  }

  return {
    resultado,
    historial,
    loading,
    error,
    tieneResultado,
    setResultado,
    setHistorial,
    verAnalisis,
    setLoading,
    setError,
    limpiarResultado,
  }
})
