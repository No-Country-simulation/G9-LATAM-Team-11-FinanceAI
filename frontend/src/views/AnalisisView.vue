<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useUsuarioStore } from '@/stores/usuario'
import { useAnalisisFinancieroStore } from '@/stores/analisisFinanciero'
import { useAnalisisFinanciero } from '@/composables/useAnalisisFinanciero'
import { useDashboard } from '@/composables/useDashboard'
import { formatoMoneda, formatoNumero } from '@/utils/formato'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseTag from '@/components/base/BaseTag.vue'
import BaseEmptyState from '@/components/base/BaseEmptyState.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'

const router = useRouter()
const usuarioStore = useUsuarioStore()
const analisisStore = useAnalisisFinancieroStore()
const { transacciones } = storeToRefs(usuarioStore)
const { loading, error, historial } = storeToRefs(analisisStore)
const { enviarAnalisis, cargarHistorial, cargarPerfilBackend } = useAnalisisFinanciero()
const { gastoMes, ingreso, endeudamiento, porCategoria } = useDashboard()

const ahora = new Date()
const mesActual = ahora.getMonth()
const anioActual = ahora.getFullYear()

const transaccionesMesActual = computed(() => {
  const lista = Array.isArray(transacciones.value) ? transacciones.value : []
  return lista.filter((t) => {
    if (!t.fecha) return false
    const str = String(t.fecha).substring(0, 10)
    const partes = str.split('-')
    if (partes.length === 3) {
      const a = parseInt(partes[0], 10)
      const m = parseInt(partes[1], 10) - 1
      return a === anioActual && m === mesActual
    }
    const d = new Date(t.fecha)
    return d.getFullYear() === anioActual && d.getMonth() === mesActual
  })
})

const tieneTransacciones = computed(() => transaccionesMesActual.value.length > 0)

const periodoTexto = computed(() => {
  if (!tieneTransacciones.value) return ''
  const inicio = new Date(anioActual, mesActual, 1)
  const desde = inicio.toLocaleDateString(navigator.language || undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  const hasta = ahora.toLocaleDateString(navigator.language || undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  return `${desde} — ${hasta}`
})

const horaLocal = ref(new Date().toLocaleTimeString(navigator.language || undefined, { hour: '2-digit', minute: '2-digit' }))
let intervaloHora = null

onMounted(async () => {
  intervaloHora = setInterval(() => {
    horaLocal.value = new Date().toLocaleTimeString(navigator.language || undefined, { hour: '2-digit', minute: '2-digit' })
  }, 1000)

  cargarPerfilBackend()
  const lista = await cargarHistorial()
  analisisStore.setHistorial(lista)
})

onUnmounted(() => {
  clearInterval(intervaloHora)
})

const topCategorias = computed(() => porCategoria.value.slice(0, 4))

async function analizar() {
  try {
    await enviarAnalisis()
    router.push({ name: 'resultado' })
  } catch {
    // error queda en el store y se muestra en la vista
  }
}

function verResultado(id) {
  analisisStore.verAnalisis(id)
  router.push({ name: 'resultado' })
}

function formatoFechaHistorial(fechaIso) {
  if (!fechaIso) return ''
  let stringNormalizado = String(fechaIso).replace(' ', 'T')
  if (!stringNormalizado.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(stringNormalizado)) {
    stringNormalizado += 'Z'
  }
  const fecha = new Date(stringNormalizado)
  return fecha.toLocaleDateString(navigator.language || undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function colorPerfil(perfil) {
  if (perfil === 'Saludable') return 'text-success'
  if (perfil === 'En observación') return 'text-warning'
  return 'text-danger'
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Encabezado con Tag en vivo -->
    <section class="flex flex-col gap-1">
      <div>
        <div class="group inline-flex cursor-default items-center gap-1.5 rounded-full border border-edge bg-surface px-2.5 py-1 transition-all duration-300 ease-out">
          <span class="h-1.5 w-1.5 rounded-full bg-cyan animate-pulse"></span>
          <span class="text-xs font-semibold text-muted">Diagnóstico IA</span>
          <span class="inline-flex max-w-0 overflow-hidden whitespace-nowrap font-mono text-xs text-cyan opacity-0 transition-all duration-300 ease-out group-hover:max-w-[5rem] group-hover:ml-1 group-hover:opacity-100">
            {{ horaLocal }}
          </span>
        </div>
      </div>
      <h1 class="mt-4 text-2xl font-bold tracking-tight md:text-3xl">Análisis Financiero</h1>
      <p class="mt-1 text-sm text-muted">
        Clasificamos tu perfil mediante Machine Learning y te brindamos recomendaciones personalizadas.
      </p>
    </section>

    <!-- Error Banner si ocurre durante la llamada -->
    <div
      v-if="error"
      class="flex items-center justify-between gap-3 rounded-lg border border-danger-edge bg-danger-bg px-4 py-3 text-sm text-danger"
      role="alert"
    >
      <span>{{ error }}</span>
      <BaseButton variante="fantasma" tamano="sm" @click="analizar">Reintentar</BaseButton>
    </div>

    <!-- Sin transacciones -->
    <BaseCard v-if="!tieneTransacciones">
      <BaseEmptyState
        titulo="Sin transacciones para analizar"
        mensaje="Necesitas al menos un gasto registrado en el mes actual para que el modelo de IA clasifique tu perfil."
      >
        <template #accion>
          <BaseButton @click="router.push({ name: 'transacciones' })">
            + Registrar mi primer gasto
          </BaseButton>
        </template>
      </BaseEmptyState>
    </BaseCard>

    <!-- Con transacciones: Nueva Distribución -->
    <template v-else>
      <!-- 1. Hero Card: Acción Principal de Diagnóstico -->
      <div class="relative overflow-hidden rounded-2xl border border-edge bg-gradient-to-br from-surface via-surface to-surface-hover/80 p-6 md:p-8 shadow-xl">
        <div class="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan/5 blur-3xl pointer-events-none" />
        
        <div class="relative z-10 flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div class="max-w-xl">
            <h2 class="text-xl font-bold text-white md:text-2xl">¿Listo para diagnosticar tus finanzas?</h2>
            <p class="mt-1.5 text-sm text-muted leading-relaxed">
              Analizaremos tus <span class="font-semibold text-ink">{{ transaccionesMesActual.length }} transacciones</span> registradas este mes para clasificar tu perfil de riesgo y generar sugerencias a medida.
            </p>
          </div>

          <BaseButton
            :cargando="loading"
            class="!px-8 !py-3.5 !text-base font-bold shadow-xl shadow-cyan/20 shrink-0"
            @click="analizar"
          >
            <span class="flex items-center gap-2.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              {{ loading ? 'Analizando…' : 'Analizar mis finanzas' }}
            </span>
          </BaseButton>
        </div>
      </div>

      <!-- 2. Métricas Clave del Mes (Banda Horizontal de 4 Indicadores) -->
      <section class="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <div class="flex flex-col gap-1 rounded-xl border border-edge bg-surface p-4">
          <span class="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">Transacciones</span>
          <strong class="text-xl font-bold tabular-nums text-white">{{ formatoNumero(transaccionesMesActual.length) }}</strong>
          <span class="text-[11px] text-muted">{{ periodoTexto || 'Mes actual' }}</span>
        </div>

        <div class="flex flex-col gap-1 rounded-xl border border-edge bg-surface p-4">
          <span class="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">Ingreso Base</span>
          <strong class="text-xl font-bold tabular-nums text-white">{{ formatoMoneda(ingreso) }}</strong>
          <span class="text-[11px] text-muted">Disponible mensual</span>
        </div>

        <div class="flex flex-col gap-1 rounded-xl border border-edge bg-surface p-4">
          <span class="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">Gasto del Mes</span>
          <strong class="text-xl font-bold tabular-nums text-cyan">{{ formatoMoneda(gastoMes) }}</strong>
          <span class="text-[11px] text-muted">Total acumulado</span>
        </div>

        <div class="flex flex-col gap-1 rounded-xl border border-edge bg-surface p-4">
          <span class="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">% Endeudamiento</span>
          <strong
            class="text-xl font-bold tabular-nums"
            :class="endeudamiento < 50 ? 'text-success' : endeudamiento < 80 ? 'text-warning' : 'text-danger'"
          >
            {{ formatoNumero(endeudamiento) }}%
          </strong>
          <span class="text-[11px] text-muted">Sobre tu ingreso</span>
        </div>
      </section>

      <!-- 3. Grid Inferior: Categorías Principales e Historial de Análisis -->
      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Tarjeta: Concentración de Gastos -->
        <BaseCard>
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-ink">Mayor concentración de gastos</h2>
            <BaseTag plano>Top categorías</BaseTag>
          </div>

          <div v-if="!topCategorias.length" class="py-8 text-center text-sm text-muted">
            Sin categorías registradas aún.
          </div>

          <div v-else class="grid gap-2.5">
            <div
              v-for="[categoria, monto] in topCategorias"
              :key="categoria"
              class="flex items-center justify-between rounded-lg border border-edge bg-coal/70 px-4 py-3"
            >
              <div class="flex items-center gap-3">
                <BaseBadge :categoria="categoria" />
                <span class="text-xs text-muted">
                  {{ Math.round((monto / (gastoMes || 1)) * 100) }}% del gasto
                </span>
              </div>
              <span class="text-sm font-bold tabular-nums text-white">{{ formatoMoneda(monto) }}</span>
            </div>
          </div>
        </BaseCard>

        <!-- Tarjeta: Historial de Diagnósticos -->
        <BaseCard>
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-ink">Historial de diagnósticos</h2>
            <BaseTag v-if="historial.length" plano>{{ historial.length }} registros</BaseTag>
          </div>

          <div v-if="!historial.length" class="py-8 text-center text-sm text-muted">
            Aún no tienes análisis previos guardados.
          </div>

          <ul v-else class="divide-y divide-hairline max-h-[300px] overflow-y-auto pr-1">
            <li
              v-for="entrada in historial"
              :key="entrada.id"
              class="group flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-3 transition-colors hover:bg-surface-hover"
              @click="verResultado(entrada.id)"
            >
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span
                    class="h-2 w-2 rounded-full"
                    :class="entrada.perfil_financiero === 'Saludable' ? 'bg-success' : entrada.perfil_financiero === 'En observación' ? 'bg-warning' : 'bg-danger'"
                  />
                  <p class="text-sm font-semibold transition-colors" :class="colorPerfil(entrada.perfil_financiero)">
                    {{ entrada.perfil_financiero }}
                  </p>
                </div>
                <p class="mt-0.5 font-mono text-[11px] text-dim pl-4">
                  {{ formatoFechaHistorial(entrada.fecha) }}
                </p>
              </div>
              <div class="flex items-center gap-3 shrink-0">
                <span class="text-xs font-mono tabular-nums text-muted group-hover:text-ink">
                  Endeud: {{ Math.round(entrada.nivel_endeudamiento ?? 0) }}%
                </span>
                <svg class="text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-white" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </li>
          </ul>
        </BaseCard>
      </div>
    </template>
  </div>
</template>
