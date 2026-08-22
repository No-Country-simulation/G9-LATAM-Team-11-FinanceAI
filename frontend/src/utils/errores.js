export function mensajeErrorApi(error) {
  const datos = error?.response?.data
  const status = error?.response?.status

  // Errores de autenticación: Mensaje seguro que no delata si falló el email o la contraseña
  if (status === 401 || status === 403) {
    return 'Correo electrónico o contraseña incorrectos. Por favor, verifica tus datos e intenta nuevamente.'
  }

  let mensajeBackend = ''
  if (typeof datos === 'string') {
    mensajeBackend = datos
  } else if (datos?.message) {
    mensajeBackend = datos.message
  } else if (datos?.Mensaje) {
    mensajeBackend = datos.Mensaje
  } else if (datos?.errors) {
    mensajeBackend = Array.isArray(datos.errors) ? datos.errors.join(', ') : datos.errors
  }

  // Si el backend envió un mensaje conocido en inglés o con código HTTP crudo
  if (mensajeBackend) {
    const normalizado = mensajeBackend.toLowerCase()
    if (
      normalizado.includes('unauthorized') ||
      normalizado.includes('bad credentials') ||
      normalizado.includes('credenciales') ||
      normalizado.includes('usuario no encontrado') ||
      normalizado.includes('contraseña incorrecta') ||
      normalizado.includes('invalid')
    ) {
      return 'Correo electrónico o contraseña incorrectos. Por favor, verifica tus datos e intenta nuevamente.'
    }
    return mensajeBackend
  }

  if (error?.code === 'ECONNABORTED') {
    return 'El servidor tardó demasiado en responder. Intenta de nuevo.'
  }
  if (error?.request && !error?.response) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta de nuevo.'
  }
  if (status === 404) {
    return 'El recurso solicitado no fue encontrado.'
  }
  if (status >= 500) {
    return 'Ocurrió un error en el servidor. Por favor, intenta de nuevo más tarde.'
  }
  return 'No se pudo completar la operación. Por favor, intenta de nuevo.'
}
