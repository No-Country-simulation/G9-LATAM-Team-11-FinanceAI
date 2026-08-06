<script setup>
import { computed, onMounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUsuario } from '@/composables/useUsuario'
import { useUsuarioStore }from '@/stores/usuario'
const route = useRoute()
const clave = computed(() => route.name || route.path)

onMounted(async () => {
  const auth = useAuthStore()
  const { cargarUsuario, entrarDemo } = useUsuario()
  const usuarioStore = useUsuarioStore()

  if (auth.sesionActiva) {
    try {
      await cargarUsuario(auth.usuarioId)
      const cuentas = JSON.parse(localStorage.getItem('financeai:cuentas') || '[]')
      const cuenta = cuentas.find(c => c.id === auth.usuarioId)
      if (cuenta?.nombre) {
        usuarioStore.setUsuario({ id: auth.usuarioId, nombre: cuenta.nombre })
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
