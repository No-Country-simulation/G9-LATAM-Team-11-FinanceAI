import { useUsuarioStore } from '@/stores/usuario'
import { registrarUsuario, obtenerUsuario, obtenerUsuariosActivosMes } from '@/services/usuarios'
import { useTransacciones } from '@/composables/useTransacciones'
import { mensajeErrorApi } from '@/utils/errores'
import { datosDemo } from '@/data/demo'

// TODO: mock temporal de credenciales — el backend no expone un login por email y
// contraseña (solo POST /usuario, GET /usuario/{id} y /usuario/activos/mesanio).
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
  cuentas.push({ email: datos.email, password: datos.password, id })
  localStorage.setItem(CLAVE_CUENTAS, JSON.stringify(cuentas))
}

async function iniciarSesionCredenciales(email, password) {
  const cuenta = obtenerCuentasGuardadas().find(
    (c) => c.email.toLowerCase() === String(email).trim().toLowerCase(),
  )
  if (!cuenta || cuenta.password !== password) {
    throw new Error('Email o contraseña incorrectos.')
  }
  return cuenta.id
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
      await registrarUsuario(datos)
      const id = await obtenerIdTrasRegistro(datos)
      guardarCuenta(datos, id)
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
