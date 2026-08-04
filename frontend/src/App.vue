<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'

const route = useRoute()
const clave = computed(() => route.name || route.path)
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
