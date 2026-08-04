<script setup>
const descripcion = defineModel('descripcion', { type: String, default: '' })
const valor = defineModel('valor', { type: Number, default: null })

const emit = defineEmits(['eliminar'])
</script>

<template>
  <div class="transaccion-fila">
    <input
      v-model="descripcion"
      type="text"
      placeholder="Descripción"
      aria-label="Descripción de la transacción"
    />
    <input
      v-model.number="valor"
      type="number"
      min="0"
      step="0.01"
      placeholder="Monto"
      aria-label="Valor de la transacción"
    />
    <button
      type="button"
      class="transaccion-fila-eliminar"
      aria-label="Eliminar transacción"
      @click="emit('eliminar')"
    >
      ✕
    </button>
  </div>
</template>
