import { useAnalisisFinancieroStore } from '@/stores/analisisFinanciero'
import { useUsuarioStore } from '@/stores/usuario'
import { enviarAnalisisFinanciero } from '@/services/analisis'

export function useAnalisisFinanciero() {
  const store = useAnalisisFinancieroStore()
  const usuarioStore = useUsuarioStore()

  async function enviarAnalisis() {
    store.setLoading(true)
    store.setError('')

    const transacciones = usuarioStore.transacciones
      .filter((transaccion) => transaccion.descripcion?.trim() && transaccion.monto != null)
      .map((transaccion) => ({
        descripcion: transaccion.descripcion.trim(),
        valor: Number(transaccion.monto),
      }))

    const payload = {
      ingreso_mensual: usuarioStore.ingresoDisponible,
      nivel_endeudamiento: calcularEndeudamiento(
        usuarioStore.transacciones,
        usuarioStore.ingresoDisponible,
      ),
      frecuencia_ahorro: store.frecuenciaAhorro,
      transacciones,
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

// El nivel de endeudamiento se deriva de las transacciones del mes y el ingreso mensual,
// no se pregunta al usuario (lo calcula el backend en el análisis real).
function calcularEndeudamiento(transacciones, ingreso) {
  const ahora = new Date()
  const gastoMes = transacciones
    .filter((transaccion) => {
      if (!transaccion.fecha) return false
      const fecha = new Date(transaccion.fecha)
      return (
        fecha.getMonth() === ahora.getMonth() &&
        fecha.getFullYear() === ahora.getFullYear()
      )
    })
    .reduce((total, transaccion) => total + Number(transaccion.monto || 0), 0)

  if (!ingreso || ingreso <= 0) return 0
  return Math.min(100, Math.round((gastoMes / Number(ingreso)) * 100))
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
