import http from './http'

export async function guardarAnalisisFinanciero(idUsuario) {
  const { data } = await http.post(`/analisisfinanciero/guardar/${idUsuario}`)
  return data
}

export async function obtenerHistorialAnalisis(idUsuario) {
  const { data } = await http.get(`/analisisfinanciero/historial/${idUsuario}`)
  return data
}
