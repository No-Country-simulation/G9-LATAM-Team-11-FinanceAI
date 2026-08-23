<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useUsuarioStore } from '@/stores/usuario'
import { useUsuario } from '@/composables/useUsuario'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import SelectorMoneda from '@/components/nav/SelectorMoneda.vue'

const router = useRouter()
const auth = useAuthStore()
const usuarioStore = useUsuarioStore()
const { nombre } = storeToRefs(usuarioStore)
const { salir, desactivarCuenta } = useUsuario()

const dropdownAbierto = ref(false)
const mostrarConfirmEliminar = ref(false)
const eliminandoCuenta = ref(false)

const enlaces = [
  { nombre: 'home', etiqueta: 'Dashboard', destino: '/home' },
  { nombre: 'transacciones', etiqueta: 'Transacciones', destino: '/transacciones' },
  { nombre: 'analisis', etiqueta: 'Análisis', destino: '/analisis' },
]

function toggleDropdown() {
  dropdownAbierto.value = !dropdownAbierto.value
}

function cerrarDropdown() {
  dropdownAbierto.value = false
}

function onClickOutside(e) {
  if (!e.target.closest('#user-menu-dropdown')) {
    cerrarDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})

function cerrarSesion() {
  cerrarDropdown()
  auth.cerrarSesion()
  salir()
  router.push({ name: 'login' })
}

async function ejecutarEliminarCuenta() {
  eliminandoCuenta.value = true
  try {
    await desactivarCuenta()
    router.push({ name: 'login' })
  } catch (err) {
    console.error(err)
  } finally {
    eliminandoCuenta.value = false
    mostrarConfirmEliminar.value = false
  }
}
</script>

<template>
  <header class="flex h-[70px] items-center justify-between gap-4">
    <RouterLink to="/home" class="text-lg font-extrabold tracking-tight">
      Finance<span class="logo-ai text-cyan">AI</span>
    </RouterLink>

    <nav class="hidden items-center gap-7 md:flex" aria-label="Principal">
      <RouterLink
        v-for="enlace in enlaces"
        :key="enlace.nombre"
        :to="enlace.destino"
        class="text-[13px] text-muted transition-colors duration-200 hover:text-white"
        active-class="text-white"
      >
        {{ enlace.etiqueta }}
      </RouterLink>
      <SelectorMoneda v-if="auth.sesionActiva" />
    </nav>

    <div class="flex items-center gap-2.5">
      <template v-if="auth.sesionActiva">
        <!-- Menu Dropdown de Usuario -->
        <div id="user-menu-dropdown" class="relative">
          <button
            type="button"
            class="flex items-center gap-2 rounded-lg border border-edge bg-surface px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-cyan/40 hover:bg-surface-hover"
            @click.stop="toggleDropdown"
          >
            <span class="max-w-[120px] truncate font-mono text-[11px] uppercase tracking-wider text-cyan">
              {{ nombre || 'Usuario' }}
            </span>
            <svg
              class="h-3.5 w-3.5 text-muted transition-transform duration-200"
              :class="{ 'rotate-180': dropdownAbierto }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Opciones desplegables -->
          <div
            v-if="dropdownAbierto"
            class="absolute right-0 mt-2 w-48 rounded-xl border border-edge bg-surface-dark p-1.5 shadow-2xl z-50 animate-fade-in"
          >
            <button
              type="button"
              class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-ink transition-colors hover:bg-surface-hover hover:text-white"
              @click="cerrarSesion"
            >
              <svg class="h-4 w-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>

            <div class="my-1 border-t border-edge/60" />

            <button
              type="button"
              class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-danger transition-colors hover:bg-danger/10"
              @click="cerrarDropdown(); mostrarConfirmEliminar = true"
            >
              <svg class="h-4 w-4 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Desactivar cuenta
            </button>
          </div>
        </div>
      </template>

      <BaseButton v-else variante="secundario" tamano="sm" @click="router.push({ name: 'login' })">
        Entrar
      </BaseButton>
    </div>

    <!-- Modal Confirmar Desactivación de Cuenta -->
    <div
      v-if="mostrarConfirmEliminar"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
      @click.self="mostrarConfirmEliminar = false"
    >
      <BaseCard class="w-full max-w-md border border-danger/30 bg-surface p-6 shadow-2xl">
        <h3 class="text-base font-bold text-danger">Desactivar cuenta</h3>
        <p class="mt-2 text-sm text-muted">
          ¿Estás seguro de que deseas desactivar tu cuenta? Esta acción deshabilitará tu acceso a FinanceAI.
        </p>

        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            class="rounded-lg border border-edge bg-surface-hover px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-edge"
            @click="mostrarConfirmEliminar = false"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="rounded-lg bg-danger px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-danger/90"
            :disabled="eliminandoCuenta"
            @click="ejecutarEliminarCuenta"
          >
            {{ eliminandoCuenta ? 'Desactivando...' : 'Sí, desactivar' }}
          </button>
        </div>
      </BaseCard>
    </div>
  </header>
</template>
