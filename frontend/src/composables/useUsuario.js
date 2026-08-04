import { useUsuarioStore } from '@/stores/usuario'
import { registrarUsuario, obtenerUsuario, obtenerUsuariosActivosMes } from '@/services/usuarios'
import { useTransacciones } from '@/composables/useTransacciones'
import { mensajeErrorApi } from '@/utils/errores'

export function useUsuario() {
  const store = useUsuarioStore()
  const { listarTransacciones } = useTransacciones()

  async function cargarUsuario(id) {
    store.setCargando(true)
    store.setError('')
    try {
      const usuario = await obtenerUsuario(id)
      store.setUsuario({ id: usuario.id, ingresoDisponible: usuario.ingresoMensual })
      await listarTransacciones()
      return usuario
    } catch (error) {
      store.setError(mensajeErrorApi(error))
      throw new Error(mensajeErrorApi(error), { cause: error })
    } finally {
      store.setCargando(false)
    }
  }

  async function registrarYEntrar(datos) {
    store.setCargando(true)
    store.setError('')
    try {
      await registrarUsuario(datos)
      const id = await obtenerIdTrasRegistro(datos)
      await cargarUsuario(id)
      return id
    } catch (error) {
      store.setError(mensajeErrorApi(error))
      throw new Error(mensajeErrorApi(error), { cause: error })
    } finally {
      store.setCargando(false)
    }
  }

  function salir() {
    store.limpiar()
  }

  return { cargarUsuario, registrarYEntrar, salir }
}

// TODO: mock temporal, reemplazar cuando backend devuelva el id en POST /usuario
// (hoy POST /usuario solo responde un mensaje de texto; se deduce el id consultando
// los usuarios activos del mes y haciendo coincidir el ingreso ingresado).
async function obtenerIdTrasRegistro(datos) {
  const ahora = new Date()
  const usuarios = await obtenerUsuariosActivosMes(ahora.getMonth() + 1, ahora.getFullYear())

  const coinciden = usuarios
    .filter((usuario) => usuario.activo && Number(usuario.ingresoMensual) === Number(datos.ingresoMensual))
    .sort((a, b) => b.id - a.id)

  const candidato = coinciden[0]
  if (!candidato) {
    throw new Error(
      'No se pudo identificar el usuario creado. Ingresa tu id manualmente en el modo demo.',
    )
  }

  return candidato.id
}
