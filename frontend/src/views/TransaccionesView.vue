<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useUsuarioStore } from '@/stores/usuario'
import { formatoMoneda } from '@/utils/formato'
import { useDashboard } from '@/composables/useDashboard'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseTag from '@/components/base/BaseTag.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseEmptyState from '@/components/base/BaseEmptyState.vue'
import ListaTransacciones from '@/components/dashboard/ListaTransacciones.vue'
import FormularioTransaccion from '@/components/dashboard/FormularioTransaccion.vue'

const usuarioStore = useUsuarioStore()
const { transacciones } = storeToRefs(usuarioStore)
const { gastoMes } = useDashboard()
const mostrarFormulario = ref(false)
</script>

<template>
  <div class="flex flex-col gap-6">
    <section class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <BaseTag>Transacciones</BaseTag>
        <h1 class="mt-4 text-2xl font-bold tracking-tight md:text-3xl">Tus gastos</h1>
        <p class="mt-1 text-sm text-muted">
          Total del mes: <span class="font-semibold text-ink">−{{ formatoMoneda(gastoMes) }}</span>
        </p>
      </div>
      <BaseButton @click="mostrarFormulario = !mostrarFormulario">
        {{ mostrarFormulario ? 'Cerrar' : '+ Nuevo gasto' }}
      </BaseButton>
    </section>

    <BaseCard v-if="mostrarFormulario">
      <h2 class="mb-4 text-sm font-semibold text-ink">Registrar gasto</h2>
      <FormularioTransaccion @creada="mostrarFormulario = false" />
    </BaseCard>

    <BaseCard>
      <ListaTransacciones v-if="transacciones.length" :transacciones="transacciones" />
      <BaseEmptyState
        v-else
        titulo="Sin movimientos todavía"
        mensaje="Cuando registres tus gastos, aparecerán aquí ordenados por fecha."
      />
    </BaseCard>
  </div>
</template>
