<script setup>
defineProps({
  ancho: { type: String, default: '100%' },
  alto: { type: String, default: '1rem' },
  circular: { type: Boolean, default: false },
})
</script>

<template>
  <span
    class="skeleton"
    :class="{ 'skeleton--circular': circular }"
    :style="{ width: ancho, height: alto }"
    aria-hidden="true"
  />
</template>

<style scoped>
.skeleton {
  display: inline-block;
  flex: 0 0 auto;
  border-radius: var(--radius-sm);
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.12) 50%,
    rgba(255, 255, 255, 0.05) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s var(--ease-out) infinite;
}

.skeleton--circular {
  border-radius: 50%;
}

@keyframes shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}
</style>
