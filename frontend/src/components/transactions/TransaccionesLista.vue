<script setup>
import { storeToRefs } from 'pinia'
import { useAnalisisFinancieroStore } from '@/stores/analisisFinanciero'
import TransaccionFila from './TransaccionFila.vue'

const store = useAnalisisFinancieroStore()
const { transacciones } = storeToRefs(store)

function nuevaFila() {
  transacciones.value.push({
    id: crypto.randomUUID(),
    descripcion: '',
    valor: null,
  })
}

function eliminarFila(id) {
  transacciones.value = transacciones.value.filter((transaccion) => transaccion.id !== id)
}
</script>

<template>
  <section class="transacciones">
    <h2>Transacciones</h2>

    <p v-if="transacciones.length === 0" class="transacciones-vacio">
      Aún no agregas transacciones. Añade tus gastos del mes.
    </p>

    <div class="transacciones-lista">
      <TransaccionFila
        v-for="transaccion in transacciones"
        :key="transaccion.id"
        v-model:descripcion="transaccion.descripcion"
        v-model:valor="transaccion.valor"
        @eliminar="eliminarFila(transaccion.id)"
      />
    </div>

    <button type="button" class="btn-secundario transacciones-agregar" @click="nuevaFila">
      Agregar transacción
    </button>
  </section>
</template>
