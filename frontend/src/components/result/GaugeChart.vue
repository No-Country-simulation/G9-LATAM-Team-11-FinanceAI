<script setup>
import { computed } from 'vue'

const props = defineProps({
  valor: { type: Number, required: true },
  max: { type: Number, default: 100 },
  etiqueta: { type: String, default: '' },
  unidad: { type: String, default: '%' },
  umbrales: {
    type: Array,
    default: () => [40, 70],
  },
  invertido: { type: Boolean, default: false },
})

const porcentaje = computed(() => Math.min(100, Math.max(0, (props.valor / props.max) * 100)))

const color = computed(() => {
  const p = porcentaje.value
  const [umbral1, umbral2] = props.umbrales

  if (props.invertido) {
    if (p < umbral1) return '#10b981'
    if (p < umbral2) return '#f59e0b'
    return '#ef4444'
  }
  if (p > umbral2) return '#10b981'
  if (p > umbral1) return '#f59e0b'
  return '#ef4444'
})

const radio = 80
const circunferencia = Math.PI * radio
const offset = computed(() => circunferencia - (porcentaje.value / 100) * circunferencia)
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <div class="relative">
      <svg width="180" height="100" viewBox="0 0 180 100" class="overflow-visible">
        <path
          d="M 10 90 A 80 80 0 0 1 170 90"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          stroke-width="12"
          stroke-linecap="round"
        />
        <path
          d="M 10 90 A 80 80 0 0 1 170 90"
          fill="none"
          :stroke="color"
          stroke-width="12"
          stroke-linecap="round"
          :stroke-dasharray="circunferencia"
          :stroke-dashoffset="offset"
          class="transition-all duration-700 ease-out"
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-end pb-1">
        <span class="text-2xl font-bold tabular-nums text-white" :style="{ color }">
          {{ Math.round(valor) }}<span class="text-sm font-normal text-muted">{{ unidad }}</span>
        </span>
      </div>
    </div>
    <span class="text-center font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
      {{ etiqueta }}
    </span>
  </div>
</template>
