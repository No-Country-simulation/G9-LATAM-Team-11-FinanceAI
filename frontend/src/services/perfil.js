import http from './http'

export async function obtenerFrecuenciaAhorro(idUsuario) {
  const { data } = await http.get(`/perfil/frecuencia-ahorro/${idUsuario}`)
  return data
}

export async function obtenerEndeudamiento(idUsuario) {
  const { data } = await http.get(`/perfil/endeudamiento/${idUsuario}`)
  return data
}
