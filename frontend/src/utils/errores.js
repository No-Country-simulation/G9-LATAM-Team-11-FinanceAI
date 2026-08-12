export function mensajeErrorApi(error) {
  const datos = error?.response?.data
  const status = error?.response?.status

  let mensajeBackend = ''
  if (typeof datos === 'string') {
    mensajeBackend = datos
  } else if (datos?.message) {
    mensajeBackend = datos.message
  } else if (datos?.Mensaje) {
    mensajeBackend = datos.Mensaje
  }  else if (datos?.errors) {
    mensajeBackend = Array.isArray(datos.errors) ? datos.errors.join(', ') : datos.errors
  }

  if (mensajeBackend) return mensajeBackend

  if (error?.code === 'ECONNABORTED') {
    return 'El servidor tardó demasiado en responder. Intenta de nuevo.'
  }
  if (error?.request) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.'
  }
  if (status >= 500) {
    return 'Ocurrió un error en el servidor. Intenta de nuevo más tarde.'
  }
  return 'No se pudo completar la operación. Intenta de nuevo.'
}
