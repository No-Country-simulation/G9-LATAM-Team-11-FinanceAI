<script setup>
defineProps({
  titulo: { type: String, required: true },
  mensaje: { type: String, default: '' },
})
</script>

<template>
  <div class="flex flex-col items-center gap-2.5 px-4 py-8 text-center">
    <svg
      class="text-faint"
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="16" stroke="currentColor" stroke-width="1.5" opacity="0.25" />
      <circle
        class="origin-center animate-[spin-ring_12s_linear_infinite]"
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
    <h3 class="text-base font-semibold">{{ titulo }}</h3>
    <p v-if="mensaje" class="max-w-[34ch] text-sm text-muted">{{ mensaje }}</p>
    <div v-if="$slots.accion" class="mt-2 w-full">
      <slot name="accion" />
    </div>
  </div>
</template>
