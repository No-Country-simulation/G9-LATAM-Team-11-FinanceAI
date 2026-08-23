import axios from 'axios'

const CLAVE_TOKEN = 'financeai:token'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor: agrega Bearer token a cada request si existe
http.interceptors.request.use((config) => {
  const token = localStorage.getItem(CLAVE_TOKEN)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor de respuesta: si el backend devuelve 401/403 en endpoints protegidos (token expirado/inválido)
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url || ''

    if ((status === 401 || status === 403) && !url.includes('/login')) {
      localStorage.removeItem(CLAVE_TOKEN)
      localStorage.removeItem('financeai:sessid')
      localStorage.removeItem('financeai:nombre')
      localStorage.removeItem('financeai:ingreso-original')

      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default http
