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
const { gastoMes, ahorroMes, ingreso } = useDashboard()
const { listarTransacciones } = useTransacciones()

const mostrarFormulario = ref(false)
const desde = ref('')
const hasta = ref('')
const filtrando = ref(false)
const filtroActivo = ref(false)

const POR_PAGINA = 15
const pagina = ref(1)

const transaccionesOrdenadas = computed(() =>
  [...transacciones.value].sort((a, b) => new Date(`${b.fecha}T00:00:00`) - new Date(`${a.fecha}T00:00:00`))
)

const totalTransacciones = computed(() => transaccionesOrdenadas.value.length)

const totalPaginas = computed(() => Math.ceil(totalTransacciones.value / POR_PAGINA))

const transaccionesPagina = computed(() => {
  const inicio = (pagina.value - 1) * POR_PAGINA
  return transaccionesOrdenadas.value.slice(inicio, inicio + POR_PAGINA)
})

const rangoMostrado = computed(() => {
  const inicio = (pagina.value - 1) * POR_PAGINA + 1
  const fin = Math.min(pagina.value * POR_PAGINA, totalTransacciones.value)
  return { inicio, fin }
})

function paginaSiguiente() {
  if (pagina.value < totalPaginas.value) pagina.value++
}

function paginaAnterior() {
  if (pagina.value > 1) pagina.value--
}

const totalFiltrado = computed(() =>
  transacciones.value.reduce((sum, t) => sum + Number(t.monto || 0), 0)
)

async function filtrar() {
  if (!desde.value || !hasta.value) return
  filtrando.value = true
  try {
    await listarTransacciones(desde.value, hasta.value)
    filtroActivo.value = true
    pagina.value = 1
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
    pagina.value = 1
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
            <span class="mx-2 text-hairline">|</span>
            Disponible: <span class="font-semibold text-success">{{ formatoMoneda(ahorroMes) }}</span>
          </template>
        </p>
      </div>
      <BaseButton @click="mostrarFormulario = !mostrarFormulario">
        {{ mostrarFormulario ? 'Cerrar' : '+ Nuevo gasto' }}
      </BaseButton>
    </section>

    <BaseCard v-if="mostrarFormulario">
      <h2 class="mb-4 text-sm font-semibold text-ink">Registrar gasto</h2>
      <FormularioTransaccion @creada="mostrarFormulario = false; pagina = 1" />
    </BaseCard>

    <!-- Filtro por fechas + paginación -->
    <BaseCard compacto>
      <div class="flex flex-wrap items-end justify-between gap-3">
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
        <div v-if="totalTransacciones > 0" class="flex items-center gap-3">
          <p class="text-xs text-muted">
            {{ rangoMostrado.inicio }}–{{ rangoMostrado.fin }} de {{ totalTransacciones }}
          </p>
          <div class="flex gap-1">
            <BaseButton
              variante="secundario"
              tamano="sm"
              :disabled="pagina <= 1"
              @click="paginaAnterior"
            >
              ←
            </BaseButton>
            <BaseButton
              variante="secundario"
              tamano="sm"
              :disabled="pagina >= totalPaginas"
              @click="paginaSiguiente"
            >
              →
            </BaseButton>
          </div>
        </div>
      </div>
    </BaseCard>

    <BaseCard>
      <ListaTransacciones v-if="transacciones.length" :transacciones="transaccionesPagina" />
      <BaseEmptyState
        v-else
        titulo="Sin movimientos"
        :mensaje="filtroActivo ? 'No hay transacciones en el rango seleccionado.' : 'Cuando registres tus gastos, aparecerán aquí ordenados por fecha.'"
      />
    </BaseCard>
  </div>
</template>
