<script setup>
defineProps({
  variante: { type: String, default: 'primario' },
  tamano: { type: String, default: 'md' },
  tipo: { type: String, default: 'button' },
  cargando: { type: Boolean, default: false },
  deshabilitado: { type: Boolean, default: false },
  bloqueado: { type: Boolean, default: false },
})

const varianteClases = {
  primario:
    'border-transparent bg-paper text-onyx hover:border-cyan/50 hover:bg-white hover:-translate-y-px',
  secundario:
    'border-ghost-edge bg-coal text-silver hover:border-cyan/50 hover:text-white hover:-translate-y-px',
  fantasma:
    'border-transparent bg-transparent text-muted hover:border-cyan/40 hover:bg-surface hover:text-ink',
  enlace: 'border-transparent bg-transparent text-cyan hover:underline',
  peligro:
    'border-danger-edge bg-danger-bg text-danger hover:border-danger hover:bg-danger/15 hover:-translate-y-px',
}

const tamanoClases = {
  sm: 'px-3.5 py-1.5 text-[0.8125rem]',
  md: 'px-5 py-2.5 text-[0.9375rem]',
  lg: 'px-7 py-3.5 text-base',
}
</script>

<template>
  <button
    :type="tipo"
    class="btn inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border font-semibold transition-all duration-200 ease-out active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-55"
    :class="[varianteClases[variante], tamanoClases[tamano], { 'w-full': bloqueado }]"
    :disabled="deshabilitado || cargando"
    :aria-busy="cargando ? 'true' : undefined"
  >
    <span
      v-if="cargando"
      class="block size-[1em] rounded-full border-2 border-current border-t-transparent animate-[spin-ring_0.7s_linear_infinite]"
      aria-hidden="true"
    />
    <slot />
  </button>
</template>
