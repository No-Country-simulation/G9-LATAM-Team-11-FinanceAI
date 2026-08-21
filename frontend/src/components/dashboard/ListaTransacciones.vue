<script setup>
import BaseBadge from '@/components/base/BaseBadge.vue'
import { formatoMoneda, formatoFecha } from '@/utils/formato'

defineProps({
  transacciones: { type: Array, default: () => [] },
  acciones: { type: Boolean, default: false },
})

const emit = defineEmits(['editar', 'eliminar'])
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
      <div v-if="acciones" class="flex shrink-0 gap-1">
        <button
          type="button"
          class="rounded-md p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-cyan"
          aria-label="Editar transacción"
          @click="emit('editar', transaccion)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button
          type="button"
          class="rounded-md p-1.5 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
          aria-label="Eliminar transacción"
          @click="emit('eliminar', transaccion)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
        </button>
      </div>
    </li>
  </ul>
</template>
