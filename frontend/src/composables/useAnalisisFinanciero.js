import { useAnalisisFinancieroStore } from '@/stores/analisisFinanciero'
import { enviarAnalisisFinanciero } from '@/services/analisis'

export function useAnalisisFinanciero() {
  const store = useAnalisisFinancieroStore()

  async function enviarAnalisis() {
    store.setLoading(true)
    store.setError('')

    const payload = {
      ingreso_mensual: store.ingresoMensual,
      nivel_endeudamiento: store.nivelEndeudamiento,
      frecuencia_ahorro: store.frecuenciaAhorro,
      transacciones: store.transacciones
        .filter((transaccion) => transaccion.descripcion?.trim() && transaccion.valor != null)
        .map((transaccion) => ({
          descripcion: transaccion.descripcion.trim(),
          valor: Number(transaccion.valor),
        })),
    }

    try {
      const resultado = await enviarAnalisisFinanciero(payload)
      store.setResultado(resultado)
      return resultado
    } catch (error) {
      store.setError(mensajeError(error))
      throw error
    } finally {
      store.setLoading(false)
    }
  }

  return { enviarAnalisis }
}

function mensajeError(error) {
  if (error?.code === 'ECONNABORTED') {
    return 'El servidor tardó demasiado en responder. Intenta de nuevo.'
  }
  if (error?.request) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.'
  }
  if (error?.response) {
    return 'El servidor no pudo procesar el análisis. Intenta de nuevo.'
  }
  return 'Ocurrió un error inesperado. Intenta de nuevo.'
}
