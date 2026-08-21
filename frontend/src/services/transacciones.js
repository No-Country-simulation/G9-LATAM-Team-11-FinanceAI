import http from './http'

export async function crearTransaccion(datos) {
  const { data } = await http.post('/transaccion', datos)
  return data
}

export async function actualizarTransaccion(id, datos) {
  const { data } = await http.patch(`/transaccion/actualizar/${id}`, datos)
  return data
}

export async function obtenerTransaccionesPorRango({ idUsuario, desde, hasta }) {
  try {
    const { data } = await http.post('/transaccion/rangos', { idUsuario, desde, hasta })
    return data
  } catch (error) {
    // El backend devuelve 404 cuando no hay transacciones en el rango (en lugar de array vacío)
    if (error.response && error.response.status === 404) {
      return []
    }
    throw error
  }
}

export async function eliminarTransaccion(id) {
  await http.delete(`/transaccion/${id}`)
}
