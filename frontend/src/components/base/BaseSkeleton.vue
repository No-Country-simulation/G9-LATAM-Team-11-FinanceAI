<script setup>
defineProps({
  ancho: { type: String, default: '100%' },
  alto: { type: String, default: '1rem' },
  circular: { type: Boolean, default: false },
})
</script>

<template>
  <span
    class="inline-block shrink-0 rounded-md bg-linear-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] animate-[shimmer_1.4s_ease-out_infinite]"
    :class="circular ? 'rounded-full' : ''"
    :style="{ width: ancho, height: alto }"
    aria-hidden="true"
  />
</template>
