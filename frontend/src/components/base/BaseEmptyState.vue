<script setup>
defineProps({
  titulo: { type: String, required: true },
  mensaje: { type: String, default: '' },
})
</script>

<template>
  <div class="empty">
    <svg
      class="empty__icono"
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="16" stroke="currentColor" stroke-width="1.5" opacity="0.25" />
      <circle
        cx="24"
        cy="24"
        r="16"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-dasharray="22 10"
        stroke-linecap="round"
      />
      <path
        d="M24 8v6M24 34v6M8 24h6M34 24h6"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        opacity="0.55"
      />
    </svg>
    <h3 class="empty__titulo">{{ titulo }}</h3>
    <p v-if="mensaje" class="empty__mensaje">{{ mensaje }}</p>
    <div v-if="$slots.accion" class="empty__accion">
      <slot name="accion" />
    </div>
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.625rem;
  text-align: center;
  padding: 2rem 1rem;
}

.empty__icono {
  color: var(--color-text-dim);
}

.empty__titulo {
  font-size: 1rem;
  font-weight: 600;
}

.empty__mensaje {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  max-width: 34ch;
}

.empty__accion {
  margin-top: 0.5rem;
  width: 100%;
}
</style>
