<script setup>
import BaseBadge from '@/components/base/BaseBadge.vue'
import { formatoMoneda, formatoFecha } from '@/utils/formato'

defineProps({
  transacciones: { type: Array, default: () => [] },
})
</script>

<template>
  <ul class="divide-y divide-hairline">
    <li
      v-for="transaccion in transacciones"
      :key="transaccion.id ?? transaccion.descripcion + transaccion.fecha"
      class="flex items-center gap-3 py-3"
    >
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-ink">{{ transaccion.descripcion }}</p>
        <p class="mt-0.5 font-mono text-[11px] uppercase tracking-[0.12em] text-dim">
          {{ formatoFecha(transaccion.fecha) }}
        </p>
      </div>
      <BaseBadge :categoria="transaccion.categoria" class="hidden sm:inline-flex" />
      <span class="text-sm font-semibold tabular-nums text-ink">
        −{{ formatoMoneda(transaccion.monto) }}
      </span>
    </li>
  </ul>
</template>
