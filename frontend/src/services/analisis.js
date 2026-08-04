import http from './http'

export async function enviarAnalisisFinanciero(payload) {
  const { data } = await http.post('/analisis-financiero', payload)
  return data
}
