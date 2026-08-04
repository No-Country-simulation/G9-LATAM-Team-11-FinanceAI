<script setup>
defineProps({
  interactivo: { type: Boolean, default: false },
  compacto: { type: Boolean, default: false },
})
</script>

<template>
  <div
    class="rounded-lg border border-edge bg-surface transition-all duration-300 ease-out"
    :class="[
      interactivo ? 'cursor-pointer hover:-translate-y-0.5 hover:border-edge-strong' : '',
      compacto ? 'p-4' : 'p-6',
    ]"
  >
    <slot />
  </div>
</template>
