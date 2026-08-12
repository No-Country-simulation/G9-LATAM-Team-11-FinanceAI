import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const CLAVE_SESION = 'financeai:sessid'

export const useAuthStore = defineStore('auth', () => {
  const usuarioId = ref(Number(localStorage.getItem(CLAVE_SESION)) || null)

  const sesionActiva = computed(() => usuarioId.value !== null)

  function iniciarSesion(id) {
    usuarioId.value = id
    localStorage.setItem(CLAVE_SESION, String(id))
  }

  function cerrarSesion() {
    usuarioId.value = null
    localStorage.removeItem(CLAVE_SESION)
  }

  return { usuarioId, sesionActiva, iniciarSesion, cerrarSesion }
})
