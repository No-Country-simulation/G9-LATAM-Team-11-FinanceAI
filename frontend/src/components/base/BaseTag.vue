<script setup>
defineProps({
  punto: { type: Boolean, default: false },
  plano: { type: Boolean, default: false },
})
</script>

<template>
  <span
    v-if="plano"
    class="font-mono text-[10px] uppercase tracking-[0.16em] text-faint"
  >
    <slot />
  </span>
  <span
    v-else
    class="inline-flex items-center gap-2 rounded-full border border-ghost-edge bg-coal px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted"
  >
    <i
      v-if="punto"
      class="size-1.5 shrink-0 rounded-full bg-cyan animate-[punto-pulso_2s_ease-out_infinite]"
      aria-hidden="true"
    />
    <slot />
  </span>
</template>
