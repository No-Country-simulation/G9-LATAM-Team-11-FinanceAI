<script setup>
import { computed, ref, onMounted } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUsuario } from '@/composables/useUsuario'
import { useUsuarioStore } from '@/stores/usuario'
import { useDivisaStore } from '@/stores/divisa'
import RouteLoader from '@/components/base/RouteLoader.vue'

const route = useRoute()
const router = useRouter()
const clave = computed(() => route.name || route.path)
const cargandoRuta = ref(false)
let timeoutId = null

router.beforeEach((to, from) => {
  // Only show loading when navigating between different named routes
  // Skip on initial page load (from.name is undefined)
  if (from.name && to.name !== from.name) {
    cargandoRuta.value = true
    if (timeoutId) clearTimeout(timeoutId)
  }
})

router.afterEach(() => {
  if (cargandoRuta.value) {
    timeoutId = setTimeout(() => {
      cargandoRuta.value = false
    }, 1500)
  }
})

onMounted(async () => {
  // Load exchange rates immediately (fire-and-forget, needed globally)
  useDivisaStore().cargarTasas()

  const auth = useAuthStore()
  const { cargarUsuario, entrarDemo } = useUsuario()
  const usuarioStore = useUsuarioStore()

  if (auth.sesionActiva) {
    try {
      await cargarUsuario(auth.usuarioId)
      const nombreGuardado = localStorage.getItem('financeai:nombre')
      if (nombreGuardado) {
        usuarioStore.setUsuario({ id: auth.usuarioId, nombre: nombreGuardado })
      }
    } catch {
      entrarDemo()
    }
  } else {
    entrarDemo()
  }
})
</script>

<template>
  <div class="relative z-10">
    <RouteLoader :visible="cargandoRuta" />
    <RouterView v-slot="{ Component }">
      <Transition
        mode="out-in"
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="translate-y-3 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="-translate-y-2 opacity-0"
      >
        <component :is="Component" :key="clave" />
      </Transition>
    </RouterView>
  </div>
</template>
