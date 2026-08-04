<script setup>
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useUsuarioStore } from '@/stores/usuario'
import { useUsuario } from '@/composables/useUsuario'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()
const auth = useAuthStore()
const usuarioStore = useUsuarioStore()
const { nombre, tieneSesion } = storeToRefs(usuarioStore)
const { salir, entrarDemo } = useUsuario()

const enlaces = [
  { nombre: 'home', etiqueta: 'Dashboard', destino: '/home' },
  { nombre: 'transacciones', etiqueta: 'Transacciones', destino: '/transacciones' },
  { nombre: 'analisis', etiqueta: 'Análisis', destino: '/analisis' },
]

function cerrarSesion() {
  auth.cerrarSesion()
  salir()
  entrarDemo()
  router.push({ name: 'home' })
}
</script>

<template>
  <header class="flex h-[70px] items-center justify-between gap-4">
    <RouterLink to="/home" class="text-lg font-extrabold tracking-tight">
      Finance<span class="text-cyan">AI</span>
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
    </nav>

    <div class="flex items-center gap-2.5">
      <template v-if="tieneSesion">
        <span class="hidden font-mono text-[11px] uppercase tracking-[0.14em] text-faint sm:block">
          {{ nombre }}
        </span>
        <BaseButton variante="secundario" tamano="sm" @click="cerrarSesion">
          Salir
        </BaseButton>
      </template>
      <BaseButton v-else variante="secundario" tamano="sm" @click="router.push({ name: 'login' })">
        Entrar
      </BaseButton>
    </div>
  </header>
</template>
