import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const CLAVE_HISTORIAL = 'financeai:historial-analisis'

function cargarHistorial() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_HISTORIAL)) ?? []
  } catch {
    return []
  }
}

function persistirHistorial(historial) {
  localStorage.setItem(CLAVE_HISTORIAL, JSON.stringify(historial))
}

export const useAnalisisFinancieroStore = defineStore('analisisFinanciero', () => {
  const resultado = ref(null)
  const historial = ref(cargarHistorial())
  const loading = ref(false)
  const error = ref('')

  const tieneResultado = computed(() => resultado.value !== null)

  function setResultado(res) {
    resultado.value = res

    // Agregar al historial con timestamp
    const entrada = {
      id: Date.now(),
      fecha: new Date().toISOString(),
      perfil_financiero: res.perfil_financiero,
      probabilidad: res.probabilidad,
      resumen_gastos: res.resumen_gastos,
      recomendaciones: res.recomendaciones,
    }
    historial.value = [entrada, ...historial.value].slice(0, 10) // Máximo 10 entradas
    persistirHistorial(historial.value)
  }

  function verAnalisis(id) {
    const entrada = historial.value.find((h) => h.id === id)
    if (entrada) {
      resultado.value = entrada
    }
  }

  function eliminarAnalisis(id) {
    historial.value = historial.value.filter((h) => h.id !== id)
    persistirHistorial(historial.value)
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

  function limpiarHistorial() {
    historial.value = []
    persistirHistorial([])
  }

  return {
    resultado,
    historial,
    loading,
    error,
    tieneResultado,
    setResultado,
    verAnalisis,
    eliminarAnalisis,
    setLoading,
    setError,
    limpiarResultado,
    limpiarHistorial,
  }
})
