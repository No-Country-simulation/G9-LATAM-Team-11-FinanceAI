<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUsuarioStore } from '@/stores/usuario'
import { useTransacciones } from '@/composables/useTransacciones'
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
const { listarTransacciones } = useTransacciones()

const mostrarFormulario = ref(false)
const desde = ref('')
const hasta = ref('')
const filtrando = ref(false)
const filtroActivo = ref(false)

const totalFiltrado = computed(() =>
  transacciones.value.reduce((sum, t) => sum + Number(t.monto || 0), 0)
)

async function filtrar() {
  if (!desde.value || !hasta.value) return
  filtrando.value = true
  try {
    await listarTransacciones(desde.value, hasta.value)
    filtroActivo.value = true
  } finally {
    filtrando.value = false
  }
}

async function limpiarFiltro() {
  desde.value = ''
  hasta.value = ''
  filtrando.value = true
  try {
    await listarTransacciones()
    filtroActivo.value = false
  } finally {
    filtrando.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <section class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <BaseTag>Transacciones</BaseTag>
        <h1 class="mt-4 text-2xl font-bold tracking-tight md:text-3xl">Tus gastos</h1>
        <p class="mt-1 text-sm text-muted">
          <template v-if="filtroActivo">
            Total filtrado: <span class="font-semibold text-ink">−{{ formatoMoneda(totalFiltrado) }}</span>
          </template>
          <template v-else>
            Total del mes: <span class="font-semibold text-ink">−{{ formatoMoneda(gastoMes) }}</span>
          </template>
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

    <!-- Filtro por fechas -->
    <BaseCard compacto>
      <div class="flex flex-wrap items-end gap-3">
        <label for="filtro-desde" class="flex flex-col gap-1 text-xs text-muted">
          Desde
          <input
            id="filtro-desde"
            v-model="desde"
            type="date"
            class="!py-1.5 !text-sm"
          />
        </label>
        <label for="filtro-hasta" class="flex flex-col gap-1 text-xs text-muted">
          Hasta
          <input
            id="filtro-hasta"
            v-model="hasta"
            type="date"
            class="!py-1.5 !text-sm"
          />
        </label>
        <BaseButton tamano="sm" :cargando="filtrando" @click="filtrar">
          Filtrar
        </BaseButton>
        <BaseButton v-if="filtroActivo" variante="fantasma" tamano="sm" @click="limpiarFiltro">
          Limpiar
        </BaseButton>
      </div>
    </BaseCard>

    <BaseCard>
      <ListaTransacciones v-if="transacciones.length" :transacciones="transacciones" />
      <BaseEmptyState
        v-else
        titulo="Sin movimientos"
        :mensaje="filtroActivo ? 'No hay transacciones en el rango seleccionado.' : 'Cuando registres tus gastos, aparecerán aquí ordenados por fecha.'"
      />
    </BaseCard>
  </div>
</template>
