<script setup>
import { storeToRefs } from 'pinia'
import { useDivisaStore } from '@/stores/divisa'

const divisaStore = useDivisaStore()
const { monedaActiva, monedasDisponibles, cargando } = storeToRefs(divisaStore)

function cambiar(event) {
  divisaStore.seleccionarMoneda(event.target.value)
}
</script>

<template>
  <label class="sr-only" for="selector-moneda">Moneda</label>
  <select
    id="selector-moneda"
    :value="monedaActiva"
    :disabled="cargando"
    class="rounded border border-edge bg-surface px-2 py-1 text-xs font-mono text-muted"
    @change="cambiar"
  >
    <option v-if="cargando" value="USD">USD</option>
    <template v-else>
      <option v-for="codigo in monedasDisponibles" :key="codigo" :value="codigo">
        {{ codigo }}
      </option>
    </template>
  </select>
</template>
