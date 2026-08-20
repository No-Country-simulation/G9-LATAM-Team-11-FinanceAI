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

export default http
