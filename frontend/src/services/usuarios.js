import http from './http'

export async function registrarUsuario(datos) {
  const { data } = await http.post('/usuario', datos)
  return data
}

export async function obtenerUsuario(id) {
  const { data } = await http.get(`/usuario/${id}`)
  return data
}

export async function loginUsuario(email, password) {
  const { data } = await http.post('/login', { email, password })
  return data
}

