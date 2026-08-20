<script setup>
import { computed } from 'vue'

const props = defineProps({
  recomendaciones: {
    type: [Array, String],
    default: () => [],
  },
})

const lista = computed(() => {
  if (Array.isArray(props.recomendaciones)) {
    return props.recomendaciones.filter(Boolean)
  }
  if (typeof props.recomendaciones === 'string' && props.recomendaciones.trim()) {
    return props.recomendaciones
      .split(/(?<=[.!?])\s+|\n+/)
      .map((r) => r.trim())
      .filter((r) => r.length > 0)
  }
  return []
})
</script>

<template>
  <section class="recomendaciones">
    <h2>Recomendaciones</h2>
    <ul v-if="lista.length">
      <li v-for="(recomendacion, indice) in lista" :key="indice">
        {{ recomendacion }}
      </li>
    </ul>
    <p v-else>Sin recomendaciones.</p>
  </section>
</template>
