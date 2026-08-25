<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useUsuarioStore } from '@/stores/usuario'
import { useUsuario } from '@/composables/useUsuario'
import { useDashboard } from '@/composables/useDashboard'
import { formatoMoneda, formatoNumero } from '@/utils/formato'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseTag from '@/components/base/BaseTag.vue'
import KpiCard from '@/components/dashboard/KpiCard.vue'
import GraficoCategorias from '@/components/dashboard/GraficoCategorias.vue'
import GraficoEvolucion from '@/components/dashboard/GraficoEvolucion.vue'
import ListaTransacciones from '@/components/dashboard/ListaTransacciones.vue'
import HistorialSueldoModal from '@/components/dashboard/HistorialSueldoModal.vue'

const router = useRouter()
const usuarioStore = useUsuarioStore()
const { editarSueldo } = useUsuario()
const { nombre, transacciones } = storeToRefs(usuarioStore)
const {
  gastoMes,
  ingresoOriginal,
  saldoDisponible,
  sobranteMesAnterior,
  porcentajeAhorroMesAnterior,
  ahorroMes,
  inversionMes,
  gastosFijos,
  endeudamiento,
  porcentajeGastoMes,
  porCategoria,
  ultimasTransacciones,
} = useDashboard()

const rangoEvolucion = ref(6)
const editandoSueldo = ref(false)
const nuevoSueldoVal = ref(0)
const guardandoSueldo = ref(false)
const errorSueldo = ref('')

const mostrarModalHistorial = ref(false)

const horaLocal = ref(new Date().toLocaleTimeString(navigator.language || undefined, { hour: '2-digit', minute: '2-digit' }))
let intervaloHora = null

onMounted(() => {
  intervaloHora = setInterval(() => {
    horaLocal.value = new Date().toLocaleTimeString(navigator.language || undefined, { hour: '2-digit', minute: '2-digit' })
  }, 1000)
})

onUnmounted(() => {
  clearInterval(intervaloHora)
})

function abrirEdicionSueldo() {
  nuevoSueldoVal.value = ingresoOriginal.value || 0
  errorSueldo.value = ''
  editandoSueldo.value = true
}

async function guardarSueldo() {
  if (!nuevoSueldoVal.value || nuevoSueldoVal.value <= 0) {
    errorSueldo.value = 'El sueldo debe ser mayor a 0'
    return
  }
  guardandoSueldo.value = true
  errorSueldo.value = ''
  try {
    await editarSueldo(nuevoSueldoVal.value)
    editandoSueldo.value = false
  } catch (err) {
    errorSueldo.value = 'Error al actualizar el sueldo'
    console.error(err)
  } finally {
    guardandoSueldo.value = false
  }
}

const evolucionFiltrada = computed(() => {
  const ahora = new Date()
  const anio = ahora.getFullYear()
  const mes = ahora.getMonth()
  const cantidad = rangoEvolucion.value

  const listaTransacciones = Array.isArray(transacciones.value) ? transacciones.value : []

  // Para 1 mes: mostrar evolución por semana del mes actual
  if (cantidad === 1) {
    const lista = []
    for (let semana = 0; semana < 4; semana++) {
      const inicioSemana = semana * 7 + 1
      const finSemana = Math.min((semana + 1) * 7, new Date(anio, mes + 1, 0).getDate())
      const total = listaTransacciones
        .filter((t) => {
          if (!t.fecha) return false
          const f = new Date(`${t.fecha}T00:00:00`)
          if (f.getFullYear() !== anio || f.getMonth() !== mes) return false
          const dia = f.getDate()
          return dia >= inicioSemana && dia <= finSemana
        })
        .reduce((suma, t) => suma + Number(t.monto || 0), 0)
      lista.push({ mes: new Date(anio, mes, inicioSemana), total, etiqueta: `Sem ${semana + 1}` })
    }
    return lista
  }

  // Para 6M y 12M: evolución por mes
  const lista = []
  for (let i = cantidad - 1; i >= 0; i--) {
    const d = new Date(anio, mes - i, 1)
    const total = listaTransacciones
      .filter((t) => {
        if (!t.fecha) return false
        const f = new Date(`${t.fecha}T00:00:00`)
        return f.getFullYear() === d.getFullYear() && f.getMonth() === d.getMonth()
      })
      .reduce((suma, t) => suma + Number(t.monto || 0), 0)
    lista.push({ mes: d, total })
  }
  return lista
})

const tonoGasto = computed(() => {
  if (endeudamiento.value >= 80) return 'danger'
  if (endeudamiento.value >= 60) return 'warning'
  return 'cyan'
})

const tieneAhorro = computed(() => ahorroMes.value > 0)
const tieneInversion = computed(() => inversionMes.value > 0)
const tieneSobrante = computed(() => sobranteMesAnterior.value > 0)
const ultimaTransaccion = computed(() => ultimasTransacciones.value?.[0] || null)
</script>

<template>
  <div class="flex flex-col gap-6">
    <section class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <div class="group inline-flex cursor-default items-center gap-1.5 rounded-full border border-edge bg-surface px-2.5 py-1 transition-all duration-300 ease-out">
          <span class="h-1.5 w-1.5 rounded-full bg-cyan animate-pulse"></span>
          <span class="text-xs font-semibold text-muted">En vivo</span>
          <span class="inline-flex max-w-0 overflow-hidden whitespace-nowrap font-mono text-xs text-cyan opacity-0 transition-all duration-300 ease-out group-hover:max-w-[5rem] group-hover:ml-1 group-hover:opacity-100">
            {{ horaLocal }}
          </span>
        </div>
        <h1 class="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
          Hola, <span class="text-cyan">{{ nombre }}</span>
        </h1>
        <div class="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
          <span>Ingreso mensual:</span>
          <template v-if="!editandoSueldo">
            <span class="font-semibold text-ink">{{ formatoMoneda(ingresoOriginal) }}</span>
            <button
              v-if="usuarioStore.id"
              type="button"
              class="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs text-cyan hover:bg-cyan/10 transition-colors cursor-pointer"
              title="Editar sueldo"
              @click="abrirEdicionSueldo"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              Editar
            </button>
            <button
              v-if="usuarioStore.id"
              type="button"
              class="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs text-muted hover:text-white transition-colors cursor-pointer"
              title="Ver historial de sueldos"
              @click="mostrarModalHistorial = true"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="opacity-85"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M12 7v5l4 2" />
              </svg>
              Historial
            </button>
          </template>
          <template v-else>
            <div class="flex items-center gap-1.5">
              <input
                v-model.number="nuevoSueldoVal"
                type="number"
                min="1"
                step="0.01"
                class="w-28 rounded border border-edge bg-surface-dark px-2 py-0.5 text-xs text-ink focus:border-cyan focus:outline-none"
                @keyup.enter="guardarSueldo"
              />
              <button
                type="button"
                class="rounded bg-cyan px-2 py-0.5 text-xs font-semibold text-surface-dark hover:bg-cyan/90"
                :disabled="guardandoSueldo"
                @click="guardarSueldo"
              >
                {{ guardandoSueldo ? '...' : 'Guardar' }}
              </button>
              <button
                type="button"
                class="rounded border border-edge px-2 py-0.5 text-xs text-muted hover:text-white"
                @click="editandoSueldo = false"
              >
                Cancelar
              </button>
            </div>
            <span v-if="errorSueldo" class="text-xs text-danger">{{ errorSueldo }}</span>
          </template>
        </div>
      </div>
      <div class="flex gap-3">
        <BaseButton variante="secundario" @click="router.push({ name: 'transacciones' })">
          Ver gastos
        </BaseButton>
        <BaseButton @click="router.push({ name: 'analisis' })">Analizar</BaseButton>
      </div>
    </section>

    <section class="grid grid-cols-12 gap-3 md:gap-4" aria-label="Indicadores">
      <div class="col-span-12 md:col-span-4 flex flex-col gap-2">
        <KpiCard
          etiqueta="Saldo disponible"
          :valor="saldoDisponible"
          :formato="(n) => formatoMoneda(n)"
        />
        <div v-if="ultimaTransaccion" class="flex items-center justify-between rounded-lg border border-edge bg-surface/50 px-3 py-2 text-[11px] text-muted">
          <div class="flex items-center gap-1.5 min-w-0">
            <svg class="h-3.5 w-3.5 text-danger shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
            <span class="truncate">{{ ultimaTransaccion.descripcion }}</span>
          </div>
          <span class="font-mono font-semibold text-danger shrink-0 ml-2">
            -{{ formatoMoneda(ultimaTransaccion.monto) }}
          </span>
        </div>
      </div>
      <KpiCard
        class="col-span-12 sm:col-span-6 md:col-span-4"
        etiqueta="Gasto del mes"
        :valor="gastoMes"
        :formato="(n) => formatoMoneda(n)"
        :delta="`${formatoNumero(porcentajeGastoMes)}% del ingreso`"
        :tono="tonoGasto"
      />
      <KpiCard
        class="col-span-12 sm:col-span-6 md:col-span-4"
        etiqueta="Gastos fijos"
        :valor="gastosFijos"
        :formato="(n) => formatoMoneda(n)"
        :delta="`${formatoNumero(endeudamiento)}% del ingreso`"
        :tono="tonoGasto"
      />
      <KpiCard
        v-if="tieneAhorro"
        class="col-span-12 md:col-span-6"
        etiqueta="Ahorro"
        :valor="ahorroMes"
        :formato="(n) => formatoMoneda(n)"
        :delta="tieneSobrante ? `El mes anterior ahorraste ${porcentajeAhorroMesAnterior}% de tu ingreso` : 'transacciones de ahorro'"
        tono="success"
      >
        <template #icono>
          <svg class="h-6 w-6 text-success drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
        </template>
      </KpiCard>
      <KpiCard
        v-if="tieneInversion"
        class="col-span-12 md:col-span-6"
        etiqueta="Inversión"
        :valor="inversionMes"
        :formato="(n) => formatoMoneda(n)"
        delta="rendimiento & activos"
        tono="success"
      >
        <template #icono>
          <svg class="h-6 w-6 text-success drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </template>
      </KpiCard>
    </section>

    <section class="grid gap-4 lg:grid-cols-2">
      <BaseCard>
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-ink">Evolución de gastos</h2>
          <div class="flex gap-1">
            <button
              type="button"
              class="rounded-md px-2 py-1 text-[11px] font-semibold transition-colors"
              :class="rangoEvolucion === 1 ? 'bg-cyan/15 text-cyan' : 'text-muted hover:text-white'"
              @click="rangoEvolucion = 1"
            >
              1M
            </button>
            <button
              type="button"
              class="rounded-md px-2 py-1 text-[11px] font-semibold transition-colors"
              :class="rangoEvolucion === 6 ? 'bg-cyan/15 text-cyan' : 'text-muted hover:text-white'"
              @click="rangoEvolucion = 6"
            >
              6M
            </button>
            <button
              type="button"
              class="rounded-md px-2 py-1 text-[11px] font-semibold transition-colors"
              :class="rangoEvolucion === 12 ? 'bg-cyan/15 text-cyan' : 'text-muted hover:text-white'"
              @click="rangoEvolucion = 12"
            >
              1A
            </button>
          </div>
        </div>
        <GraficoEvolucion :key="rangoEvolucion" :datos="evolucionFiltrada" />
      </BaseCard>

      <BaseCard>
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-ink">Gastos por categoría</h2>
          <BaseTag plano>{{ porCategoria.length }} categorías</BaseTag>
        </div>
        <GraficoCategorias :datos="porCategoria" />
      </BaseCard>
    </section>

    <BaseCard>
      <div class="mb-2 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-ink">Últimos movimientos</h2>
        <RouterLink
          to="/transacciones"
          class="text-[13px] font-semibold text-cyan hover:underline"
        >
          Ver todas
        </RouterLink>
      </div>
      <ListaTransacciones :transacciones="ultimasTransacciones" />
    </BaseCard>

    <!-- Modal de Historial de Sueldo -->
    <HistorialSueldoModal
      :mostrar="mostrarModalHistorial"
      :id-usuario="usuarioStore.id"
      @cerrar="mostrarModalHistorial = false"
    />
  </div>
</template>
