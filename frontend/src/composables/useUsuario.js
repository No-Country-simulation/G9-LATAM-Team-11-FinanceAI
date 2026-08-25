import { useUsuarioStore } from '@/stores/usuario'
import { useAuthStore } from '@/stores/auth'
import { useAnalisisFinancieroStore } from '@/stores/analisisFinanciero'
import { registrarUsuario, obtenerUsuario, loginUsuario, actualizarSueldo, obtenerResumenMensual, eliminarCuenta } from '@/services/usuarios'
import { useTransacciones } from '@/composables/useTransacciones'
import { mensajeErrorApi } from '@/utils/errores'
import { datosDemo } from '@/data/demo'

export function useUsuario() {
  const store = useUsuarioStore()
  const auth = useAuthStore()
  const analisisStore = useAnalisisFinancieroStore()
  const { listarTransacciones } = useTransacciones()

  async function cargarUsuario(id) {
    store.setCargando(true)
    store.setError('')
    try {
      const usuario = await obtenerUsuario(id)
      // ingresoMensual del backend es el saldo disponible actual
      // Lo guardamos como ingresoOriginal solo si no tenemos uno previo
      const ingresoOriginalPrevio = store.ingresoOriginal
      store.setUsuario({
        id: usuario.id,
        ingresoDisponible: usuario.ingresoMensual,
        ingresoOriginal: ingresoOriginalPrevio || usuario.ingresoMensual,
      })
      
      if (id !== null && id !== 0) {
        try {
          const resumenes = await obtenerResumenMensual(id)
          store.setResumenesMensuales(resumenes)
        } catch (e) {
          console.error("Error al obtener los resumenes mensuales:", e)
        }
      }

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
    analisisStore.reset()
    localStorage.removeItem('financeai:resumenes-gastos')
    try {
      // 1. Registrar usuario en el backend
      await registrarUsuario(datos)

      // 2. Hacer login para obtener el token JWT
      const loginResp = await loginUsuario(datos.email, datos.password)
      auth.iniciarSesion(loginResp.idUsuario, loginResp.token)

      // 3. Cargar datos del usuario
      await cargarUsuario(loginResp.idUsuario)
      const nombreUsuario = loginResp.nombre || datos.nombre
      store.setUsuario({
        id: loginResp.idUsuario,
        nombre: nombreUsuario,
        // Al registrar sabemos el ingreso original desde el formulario
        ingresoOriginal: datos.ingresoMensual,
      })
      if (nombreUsuario) {
        localStorage.setItem('financeai:nombre', nombreUsuario)
      }
      return loginResp.idUsuario
    } catch (error) {
      store.setError(mensajeErrorApi(error))
      throw new Error(mensajeErrorApi(error), { cause: error })
    } finally {
      store.setCargando(false)
    }
  }

  async function iniciarSesionCredenciales(email, password) {
    analisisStore.reset()
    localStorage.removeItem('financeai:resumenes-gastos')
    try {
      const loginResp = await loginUsuario(email, password)
      auth.iniciarSesion(loginResp.idUsuario, loginResp.token)
      // Guardar nombre en localStorage para recuperar al recargar la página
      if (loginResp.nombre) {
        localStorage.setItem('financeai:nombre', loginResp.nombre)
      }
      return { id: loginResp.idUsuario, nombre: loginResp.nombre }
    } catch (error) {
      throw new Error(mensajeErrorApi(error), { cause: error })
    }
  }

  async function editarSueldo(nuevoSueldo) {
    store.setCargando(true)
    store.setError('')
    try {
      if (store.id) {
        await actualizarSueldo(store.id, nuevoSueldo)
      }
      store.setUsuario({
        id: store.id,
        ingresoOriginal: nuevoSueldo,
        ingresoDisponible: nuevoSueldo,
      })
    } catch (error) {
      store.setError(mensajeErrorApi(error))
      throw new Error(mensajeErrorApi(error), { cause: error })
    } finally {
      store.setCargando(false)
    }
  }

  async function desactivarCuenta() {
    if (!store.id) return
    store.setCargando(true)
    store.setError('')
    try {
      await eliminarCuenta(store.id)
      salir()
    } catch (error) {
      store.setError(mensajeErrorApi(error))
      throw new Error(mensajeErrorApi(error), { cause: error })
    } finally {
      store.setCargando(false)
    }
  }

  function salir() {
    store.limpiar()
    analisisStore.reset()
    auth.cerrarSesion()
    localStorage.removeItem('financeai:nombre')
    localStorage.removeItem('financeai:resumenes-gastos')
  }

  // Modo demo: sin sesión real, con datos de ejemplo para ver el dashboard.
  // id=null es necesario para que esDemo() (store.id == null) funcione correctamente
  // y ningún composable intente llamar al backend.
  function entrarDemo() {
    store.setUsuario({
      id: null,
      nombre: datosDemo.nombre,
      ingresoDisponible: datosDemo.ingresoDisponible,
      ingresoOriginal: datosDemo.ingresoDisponible,
    })
    store.setTransacciones(datosDemo.transacciones)
  }

  return { cargarUsuario, registrarYEntrar, iniciarSesionCredenciales, editarSueldo, desactivarCuenta, salir, entrarDemo }
}
