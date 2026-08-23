<script setup>
defineProps({
  mensaje: { type: String, default: 'Procesando…' },
  cubrir: { type: Boolean, default: true },
})
</script>

<template>
  <div
    class="flex flex-col items-center justify-center gap-4 text-center"
    :class="cubrir ? 'fixed inset-0 z-50 bg-onyx/70 backdrop-blur-sm' : 'relative min-h-56'"
    role="status"
    aria-live="polite"
  >
    <div class="relative size-16">
      <span
        class="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0_38%,var(--color-cyan)_55%,transparent_100%)] [mask:radial-gradient(farthest-side,transparent_calc(100%-6px),#000_calc(100%-5px))] animate-[spin-ring_1s_linear_infinite]"
        aria-hidden="true"
      />
      <span
        class="absolute inset-4.5 rounded-full bg-cyan/20 blur-md animate-[pulse-glow_2s_ease-out_infinite]"
        aria-hidden="true"
      />
    </div>
    <p class="text-[0.9375rem] text-muted">{{ mensaje }}</p>
    <p
      v-if="cubrir"
      class="absolute bottom-7 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-dim"
    >
      Finance<span class="text-cyan">AI</span>
    </p>
  </div>
</template>
