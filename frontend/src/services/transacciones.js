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
    const { data } = await http.get('/transaccion/rangos', {
      params: { idUsuario, desde, hasta },
    })
    return Array.isArray(data) ? data : []
  } catch (error) {
    if (error.response && (error.response.status === 404 || error.response.status === 204)) {
      return []
    }
    throw error
  }
}

export async function eliminarTransaccion(id) {
  await http.delete(`/transaccion/${id}`)
}
