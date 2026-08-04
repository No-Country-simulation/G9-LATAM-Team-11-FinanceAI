import { useAnalisisFinancieroStore } from '@/stores/analisisFinanciero'
import { useUsuarioStore } from '@/stores/usuario'
import { enviarAnalisisFinanciero } from '@/services/analisis'

export function useAnalisisFinanciero() {
  const store = useAnalisisFinancieroStore()
  const usuarioStore = useUsuarioStore()

  async function enviarAnalisis() {
    store.setLoading(true)
    store.setError('')

    const payload = {
      ingreso_mensual: usuarioStore.ingresoDisponible,
      nivel_endeudamiento: store.nivelEndeudamiento,
      frecuencia_ahorro: store.frecuenciaAhorro,
      transacciones: usuarioStore.transacciones
        .filter((transaccion) => transaccion.descripcion?.trim() && transaccion.monto != null)
        .map((transaccion) => ({
          descripcion: transaccion.descripcion.trim(),
          valor: Number(transaccion.monto),
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
