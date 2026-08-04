<script setup>
defineProps({
  recomendaciones: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <section class="recomendaciones">
    <h2>Recomendaciones</h2>
    <ul v-if="recomendaciones.length">
      <li v-for="(recomendacion, indice) in recomendaciones" :key="indice">
        {{ recomendacion }}
      </li>
    </ul>
    <p v-else>Sin recomendaciones.</p>
  </section>
</template>
