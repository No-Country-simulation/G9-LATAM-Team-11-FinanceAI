<script setup>
defineProps({
  interactivo: { type: Boolean, default: false },
  compacto: { type: Boolean, default: false },
})
</script>

<template>
  <div class="card" :class="{ 'card--interactivo': interactivo, 'card--compacto': compacto }">
    <div class="card__inner">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.card {
  border-radius: var(--radius-lg);
  background: linear-gradient(180deg, var(--color-border), rgba(255, 255, 255, 0.03));
  padding: 1px;
  box-shadow: var(--shadow-card);
  transition: transform var(--transition-medium), box-shadow var(--transition-medium);
}

.card--interactivo:hover {
  transform: translateY(-3px);
  box-shadow:
    var(--shadow-card),
    0 0 0 1px rgba(16, 185, 129, 0.25),
    0 18px 40px -18px rgba(16, 185, 129, 0.2);
}

.card__inner {
  border-radius: calc(var(--radius-lg) - 1px);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
  box-shadow: var(--inset-highlight);
  padding: 1.5rem;
}

.card--compacto .card__inner {
  padding: 1rem 1.25rem;
}
</style>
