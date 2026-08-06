import { useUsuarioStore } from '@/stores/usuario'
import { registrarUsuario, obtenerUsuario } from '@/services/usuarios'
import { useTransacciones } from '@/composables/useTransacciones'
import { mensajeErrorApi } from '@/utils/errores'
import { datosDemo } from '@/data/demo'

// TODO: mock temporal de credenciales — el backend no expone POST /login.
// Se guardan en el navegador las cuentas creadas para poder volver a entrar.

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

// TODO: reemplazar por llamada real a POST /login cuando backend lo implemente

async function iniciarSesionCredenciales(email, password) {
  const cuenta = obtenerCuentasGuardadas().find(
    (c) => c.email.toLowerCase() === String(email).trim().toLowerCase(),
  )
  if (!cuenta || cuenta.password !== password) {
    throw new Error('Email o contraseña incorrectos.')
  }
  return { id: cuenta.id, nombre: cuenta.nombre }
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


