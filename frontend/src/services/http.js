import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default http
