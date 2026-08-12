import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAnalisisFinancieroStore = defineStore('analisisFinanciero', () => {
  const frecuenciaAhorro = ref('')
  const resultado = ref(null)
  const loading = ref(false)
  const error = ref('')

  const tieneResultado = computed(() => resultado.value !== null)

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
    frecuenciaAhorro,
    resultado,
    loading,
    error,
    tieneResultado,
    setResultado,
    setLoading,
    setError,
    limpiarResultado,
  }
})
