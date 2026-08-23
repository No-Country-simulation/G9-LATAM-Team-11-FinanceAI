import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const CLAVE_SESION = 'financeai:sessid'
const CLAVE_TOKEN = 'financeai:token'

export const useAuthStore = defineStore('auth', () => {
  const storedSession = localStorage.getItem(CLAVE_SESION)
  const usuarioId = ref(
    storedSession !== null && storedSession !== '' && storedSession !== 'null' && storedSession !== 'undefined'
      ? Number(storedSession)
      : null
  )
  const token = ref(localStorage.getItem(CLAVE_TOKEN) || null)

  const sesionActiva = computed(() => usuarioId.value !== null)

  function iniciarSesion(id, jwt = null) {
    usuarioId.value = id
    localStorage.setItem(CLAVE_SESION, String(id))
    if (jwt) {
      token.value = jwt
      localStorage.setItem(CLAVE_TOKEN, jwt)
    }
  }

  function cerrarSesion() {
    usuarioId.value = null
    token.value = null
    localStorage.removeItem(CLAVE_SESION)
    localStorage.removeItem(CLAVE_TOKEN)
  }

  return { usuarioId, token, sesionActiva, iniciarSesion, cerrarSesion }
})
