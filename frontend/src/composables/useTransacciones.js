import { useUsuarioStore } from '@/stores/usuario'
import {
  crearTransaccion as crearTransaccionApi,
  actualizarTransaccion,
  obtenerTransaccionesPorRango,
} from '@/services/transacciones'
import { obtenerUsuario } from '@/services/usuarios'
import { mensajeErrorApi } from '@/utils/errores'

export function useTransacciones() {
  const store = useUsuarioStore()

  function rangoPorDefecto() {
    const hasta = new Date()
    const desde = new Date()
    desde.setFullYear(hasta.getFullYear() - 1)
    return { desde: aIso(desde), hasta: aIso(hasta) }
  }

  async function listarTransacciones(desde, hasta) {
    const rango = desde && hasta ? { desde, hasta } : rangoPorDefecto()
    const transacciones = await obtenerTransaccionesPorRango({ idUsuario: store.id, ...rango })
    store.setTransacciones(transacciones)
    return transacciones
  }

  async function refrescarUsuario() {
    if (store.id == null) return

    const [usuario, transacciones] = await Promise.all([
      obtenerUsuario(store.id),
      obtenerTransaccionesPorRango({ idUsuario: store.id, ...rangoPorDefecto() }),
    ])

    store.setIngresoDisponible(usuario.ingresoMensual)
    store.setTransacciones(transacciones)
    return transacciones
  }

  async function crearTransaccion(datos) {
    try {
      await crearTransaccionApi({ ...datos, idUsuario: store.id })
      await refrescarUsuario()
    } catch (error) {
      throw new Error(mensajeErrorApi(error), { cause: error })
    }
  }

  async function editarTransaccion(id, datos) {
    try {
      await actualizarTransaccion(id, datos)
      await refrescarUsuario()
    } catch (error) {
      throw new Error(mensajeErrorApi(error), { cause: error })
    }
  }

  return {
    listarTransacciones,
    refrescarUsuario,
    crearTransaccion,
    editarTransaccion,
    rangoPorDefecto,
  }
}

function aIso(fecha) {
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}
