import { useUsuarioStore } from '@/stores/usuario'
import { useAuthStore } from '@/stores/auth'
import { registrarUsuario, obtenerUsuario, loginUsuario } from '@/services/usuarios'
import { useTransacciones } from '@/composables/useTransacciones'
import { mensajeErrorApi } from '@/utils/errores'
import { datosDemo } from '@/data/demo'

export function useUsuario() {
  const store = useUsuarioStore()
  const auth = useAuthStore()
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
      // 1. Registrar usuario en el backend
      await registrarUsuario(datos)

      // 2. Hacer login para obtener el token JWT
      const loginResp = await loginUsuario(datos.email, datos.password)
      auth.iniciarSesion(loginResp.idUsuario, loginResp.token)

      // 3. Cargar datos del usuario
      await cargarUsuario(loginResp.idUsuario)
      store.setUsuario({ id: loginResp.idUsuario, nombre: loginResp.nombre || datos.nombre })
      return loginResp.idUsuario
    } catch (error) {
      store.setError(mensajeErrorApi(error))
      throw new Error(mensajeErrorApi(error), { cause: error })
    } finally {
      store.setCargando(false)
    }
  }

  async function iniciarSesionCredenciales(email, password) {
    const loginResp = await loginUsuario(email, password)
    auth.iniciarSesion(loginResp.idUsuario, loginResp.token)
    return { id: loginResp.idUsuario, nombre: loginResp.nombre }
  }

  function salir() {
    store.limpiar()
    auth.cerrarSesion()
  }

  // Modo demo: sin sesión real, con datos de ejemplo para ver el dashboard.
  function entrarDemo() {
    store.setUsuario({
      id: null,
      nombre: datosDemo.nombre,
      ingresoDisponible: datosDemo.ingresoDisponible,
    })
    store.setTransacciones(datosDemo.transacciones)
  }

  return { cargarUsuario, registrarYEntrar, iniciarSesionCredenciales, salir, entrarDemo }
}
