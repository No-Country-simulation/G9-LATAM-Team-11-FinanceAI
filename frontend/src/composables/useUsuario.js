import { useUsuarioStore } from '@/stores/usuario'
import { registrarUsuario, obtenerUsuario, loginUsuario } from '@/services/usuarios'
import { useTransacciones } from '@/composables/useTransacciones'
import { mensajeErrorApi } from '@/utils/errores'
import { datosDemo } from '@/data/demo'

const CLAVE_CUENTAS = 'financeai:cuentas'

function obtenerCuentasGuardadas() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_CUENTAS)) ?? []
  } catch {
    return []
  }
}

function guardarCuenta(datos, id) {
  const cuentas = obtenerCuentasGuardadas().filter(
    (cuenta) => cuenta.email.toLowerCase() !== String(datos.email).toLowerCase(),
  )
  cuentas.push({ email: datos.email, password: datos.password, nombre: datos.nombre, id })
  localStorage.setItem(CLAVE_CUENTAS, JSON.stringify(cuentas))
}

async function iniciarSesionCredenciales(email, password) {
  try {
    const respuesta = await loginUsuario(email, password)
    return { id: respuesta.id, nombre: respuesta.nombre }
  } catch (error) {
    // Fallback local si el backend estuviera inaccesible en pruebas
    const cuenta = obtenerCuentasGuardadas().find(
      (c) => c.email.toLowerCase() === String(email).trim().toLowerCase(),
    )
    if (cuenta && cuenta.password === password) {
      return { id: cuenta.id, nombre: cuenta.nombre }
    }
    throw new Error(mensajeErrorApi(error) || 'Email o contraseña incorrectos.')
  }
}

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
      const { id } = await registrarUsuario(datos)
      guardarCuenta(datos, id)
      await cargarUsuario(id)
      store.setUsuario({ id, nombre: datos.nombre })
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

  // Modo demo: sin sesión, con datos de ejemplo para ver el dashboard.
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
