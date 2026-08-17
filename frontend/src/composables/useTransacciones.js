import { useUsuarioStore } from '@/stores/usuario'
import {
  crearTransaccion as crearTransaccionApi,
  actualizarTransaccion,
  obtenerTransaccionesPorRango,
} from '@/services/transacciones'
import { obtenerUsuario } from '@/services/usuarios'
import { mensajeErrorApi } from '@/utils/errores'

let nextDemoId = 1000

export function useTransacciones() {
  const store = useUsuarioStore()

  function esDemo() {
    return store.id == null
  }

  function rangoPorDefecto() {
    const hasta = new Date()
    const desde = new Date()
    desde.setFullYear(hasta.getFullYear() - 1)
    return { desde: aIso(desde), hasta: aIso(hasta) }
  }

  async function listarTransacciones(desde, hasta) {
    if (esDemo()) return store.transacciones

    const rango = desde && hasta ? { desde, hasta } : rangoPorDefecto()
    const transacciones = await obtenerTransaccionesPorRango({ idUsuario: store.id, ...rango })
    store.setTransacciones(transacciones)
    return transacciones
  }

  async function refrescarUsuario() {
    if (esDemo()) return store.transacciones

    const [usuario, transacciones] = await Promise.all([
      obtenerUsuario(store.id),
      obtenerTransaccionesPorRango({ idUsuario: store.id, ...rangoPorDefecto() }),
    ])

    store.setIngresoDisponible(usuario.ingresoMensual)
    store.setTransacciones(transacciones)
    return transacciones
  }

  async function crearTransaccion(datos) {
    if (esDemo()) {
      const nueva = { id: nextDemoId++, ...datos, categoria: 'otro' }
      store.setTransacciones([...store.transacciones, nueva])
      return nueva
    }

    try {
      const respuesta = await crearTransaccionApi({ ...datos, idUsuario: store.id })
      await refrescarUsuario()
      return respuesta
    } catch (error) {
      throw new Error(mensajeErrorApi(error), { cause: error })
    }
  }

  async function editarTransaccion(id, datos) {
    if (esDemo()) {
      const lista = store.transacciones.map(t => t.id === id ? { ...t, ...datos } : t)
      store.setTransacciones(lista)
      return
    }

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
