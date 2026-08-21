<script setup>
import { computed } from 'vue'
import { verificarPassword } from '@/utils/password'

const props = defineProps({
  password: { type: String, default: '' },
})

const REQUISITOS_TOTALES = 5

const niveles = [
  { minimo: 5, etiqueta: 'Fuerte', color: '#22c55e' },
  { minimo: 4, etiqueta: 'Buena', color: '#22d3ee' },
  { minimo: 2, etiqueta: 'Media', color: '#f59e0b' },
  { minimo: 0, etiqueta: 'Débil', color: '#ef4444' },
]

const cumplidos = computed(
  () => verificarPassword(props.password).filter((requisito) => requisito.cumple).length,
)

const porcentaje = computed(() =>
  props.password ? Math.round((cumplidos.value / REQUISITOS_TOTALES) * 100) : 0,
)

const nivel = computed(
  () => niveles.find((n) => cumplidos.value >= n.minimo) ?? niveles[niveles.length - 1],
)
</script>

<template>
  <div class="flex items-center gap-2">
    <div
      class="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-hover"
      role="progressbar"
      :aria-valuenow="porcentaje"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="'Fortaleza de la contraseña: ' + nivel.etiqueta"
    >
      <div
        class="h-full rounded-full transition-all duration-300 ease-out"
        :style="{ width: porcentaje + '%', backgroundColor: nivel.color }"
      />
    </div>
    <span
      v-if="password"
      class="w-12 shrink-0 text-right font-mono text-[11px] uppercase tracking-[0.14em]"
      :style="{ color: nivel.color }"
    >
      {{ nivel.etiqueta }}
    </span>
  </div>
</template>
