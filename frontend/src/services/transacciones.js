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
  const { data } = await http.post('/transaccion/rangos', { idUsuario, desde, hasta })
  return data
}
