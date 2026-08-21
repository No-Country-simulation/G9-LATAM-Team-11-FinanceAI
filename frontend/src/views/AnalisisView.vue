<script setup>
import { computed, ref } from 'vue'
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
const { enviarAnalisis } = useAnalisisFinanciero()
const { gastoMes, ingreso, endeudamiento, porCategoria } = useDashboard()

const exportando = ref(false)
const menuExportar = ref(false)

const tieneTransacciones = computed(() => transacciones.value.length > 0)

const periodoTexto = computed(() => {
  if (!tieneTransacciones.value) return ''
  const fechas = transacciones.value
    .filter((t) => t.fecha)
    .map((t) => new Date(`${t.fecha}T00:00:00`))
    .sort((a, b) => a - b)
  if (fechas.length === 0) return ''
  const desde = fechas[0].toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })
  const hasta = fechas[fechas.length - 1].toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })
  return desde === hasta ? desde : `${desde} — ${hasta}`
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
  const fecha = new Date(fechaIso)
  return fecha.toLocaleDateString('es-AR', {
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

// ─────────────────────────────────────────────────────────────────────────────
// Exportación — dropdown con múltiples formatos
// TODO: reemplazar con endpoints del backend cuando estén disponibles
// El backend debería exponer: GET /analisis-financiero/exportar?formato=csv|pdf|json
// ─────────────────────────────────────────────────────────────────────────────

function toggleMenuExportar() {
  menuExportar.value = !menuExportar.value
}

function cerrarMenuExportar() {
  menuExportar.value = false
}

async function exportar(formato) {
  cerrarMenuExportar()
  exportando.value = true
  try {
    if (formato === 'csv') exportarCSV()
    else if (formato === 'json') exportarJSON()
    else if (formato === 'pdf') exportarPDF()
  } finally {
    exportando.value = false
  }
}

function exportarCSV() {
  const filas = [
    ['Descripcion', 'Monto', 'Categoria', 'Fecha'],
    ...transacciones.value.map((t) => [
      t.descripcion || '',
      t.monto || 0,
      t.categoria || '',
      t.fecha || '',
    ]),
  ]
  const csv = filas.map((fila) => fila.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  descargar(csv, 'text/csv;charset=utf-8;', `financeai-transacciones-${hoy()}.csv`)
}

function exportarJSON() {
  const datos = {
    fecha_exportacion: new Date().toISOString(),
    ingreso_disponible: usuarioStore.ingresoDisponible,
    transacciones: transacciones.value,
    ultimo_analisis: analisisStore.resultado,
  }
  descargar(JSON.stringify(datos, null, 2), 'application/json', `financeai-datos-${hoy()}.json`)
}

// TODO: reemplazar con generación real de PDF desde backend
function exportarPDF() {
  const lineas = [
    'FINANCE AI - Reporte de Transacciones',
    `Fecha: ${new Date().toLocaleDateString('es-AR')}`,
    `Ingreso disponible: ${usuarioStore.ingresoDisponible}`,
    '',
    'TRANSACCIONES:',
    'Descripcion | Monto | Categoria | Fecha',
    '-'.repeat(50),
    ...transacciones.value.map((t) =>
      `${t.descripcion || '-'} | ${t.monto || 0} | ${t.categoria || '-'} | ${t.fecha || '-'}`,
    ),
  ]
  descargar(lineas.join('\n'), 'text/plain;charset=utf-8;', `financeai-reporte-${hoy()}.txt`)
}

function descargar(contenido, tipo, nombre) {
  const blob = new Blob([contenido], { type: tipo })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nombre
  link.click()
  URL.revokeObjectURL(url)
}

function hoy() {
  return new Date().toISOString().slice(0, 10)
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <section class="flex flex-col gap-1">
      <BaseTag punto>Análisis financiero</BaseTag>
      <h1 class="mt-4 text-2xl font-bold tracking-tight md:text-3xl">Tu perfil, en datos</h1>
      <p class="mt-1 text-sm text-muted">
        Analizamos tus transacciones para clasificar tu perfil financiero y darte recomendaciones personalizadas.
      </p>
    </section>

    <!-- Sin transacciones -->
    <BaseCard v-if="!tieneTransacciones">
      <BaseEmptyState
        titulo="Sin transacciones"
        mensaje="Necesitas al menos un gasto registrado para poder analizar tu perfil financiero."
      >
        <template #accion>
          <BaseButton bloqueado @click="router.push({ name: 'transacciones' })">
            Registrar mi primer gasto
          </BaseButton>
        </template>
      </BaseEmptyState>
    </BaseCard>

    <!-- Con transacciones: resumen y botón -->
    <template v-else>
      <BaseCard>
        <h2 class="mb-4 text-sm font-semibold text-ink">Resumen de tus datos</h2>
        <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div class="flex flex-col gap-0.5">
            <span class="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">Transacciones</span>
            <strong class="text-lg font-bold tabular-nums text-white">{{ formatoNumero(transacciones.length) }}</strong>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">Ingreso disponible</span>
            <strong class="text-lg font-bold tabular-nums text-white">{{ formatoMoneda(ingreso) }}</strong>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">Gasto del mes</span>
            <strong class="text-lg font-bold tabular-nums text-cyan">{{ formatoMoneda(gastoMes) }}</strong>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">Endeudamiento</span>
            <strong
              class="text-lg font-bold tabular-nums"
              :class="endeudamiento < 50 ? 'text-success' : endeudamiento < 80 ? 'text-warning' : 'text-danger'"
            >
              {{ formatoNumero(endeudamiento) }}%
            </strong>
          </div>
        </div>

        <p v-if="periodoTexto" class="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-dim">
          Período: {{ periodoTexto }}
        </p>
      </BaseCard>

      <BaseCard v-if="topCategorias.length">
        <h2 class="mb-3 text-sm font-semibold text-ink">Top categorías de gasto</h2>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="[categoria, monto] in topCategorias"
            :key="categoria"
            class="flex items-center gap-2 rounded-md border border-edge bg-coal px-3 py-2"
          >
            <BaseBadge :categoria="categoria" />
            <span class="text-sm font-medium tabular-nums text-white">{{ formatoMoneda(monto) }}</span>
          </div>
        </div>
      </BaseCard>

      <BaseCard class="text-center">
        <p class="mb-4 text-sm text-muted">
          Con {{ transacciones.length }} transacciones registradas, tu análisis está listo.
        </p>

        <p v-if="error" class="mb-4 rounded-md border border-danger-edge bg-danger-bg px-3 py-2 text-sm text-danger" role="alert">
          {{ error }}
        </p>

        <div class="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <BaseButton :cargando="loading" bloqueado @click="analizar">
            {{ loading ? 'Analizando…' : 'Analizar mis finanzas' }}
          </BaseButton>

          <!-- Dropdown de exportación -->
          <div class="relative">
            <BaseButton variante="secundario" :cargando="exportando" @click="toggleMenuExportar">
              <span class="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Exportar
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="6 9 12 14 18 9" />
                </svg>
              </span>
            </BaseButton>

            <Transition name="dropdown">
              <div
                v-if="menuExportar"
                class="absolute right-0 top-full z-10 mt-1 min-w-[160px] overflow-hidden rounded-lg border border-edge bg-surface shadow-lg"
              >
                <button
                  type="button"
                  class="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-muted transition-colors hover:bg-surface-hover hover:text-white"
                  @click="exportar('csv')"
                >
                  <span class="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan">CSV</span>
                  Hoja de cálculo
                </button>
                <button
                  type="button"
                  class="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-muted transition-colors hover:bg-surface-hover hover:text-white"
                  @click="exportar('json')"
                >
                  <span class="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan">JSON</span>
                  Datos completos
                </button>
                <button
                  type="button"
                  class="flex w-full items-center gap-2 border-t border-edge px-3 py-2.5 text-left text-sm text-muted transition-colors hover:bg-surface-hover hover:text-white"
                  @click="exportar('pdf')"
                >
                  <span class="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan">PDF</span>
                  Reporte (próximamente)
                </button>
              </div>
            </Transition>

            <!-- Overlay para cerrar el menú al hacer click afuera -->
            <div v-if="menuExportar" class="fixed inset-0 z-0" @click="cerrarMenuExportar" />
          </div>
        </div>
      </BaseCard>

      <!-- Historial de análisis -->
      <BaseCard v-if="historial.length">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-ink">Historial de análisis</h2>
          <BaseTag plano>últimos {{ historial.length }}</BaseTag>
        </div>
        <ul class="divide-y divide-hairline">
          <li
            v-for="entrada in historial"
            :key="entrada.id"
            class="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-3 transition-colors hover:bg-surface-hover"
            @click="verResultado(entrada.id)"
          >
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-ink">
                <span :class="colorPerfil(entrada.perfil_financiero)">{{ entrada.perfil_financiero }}</span>
              </p>
              <p class="mt-0.5 font-mono text-[11px] text-dim">
                {{ formatoFechaHistorial(entrada.fecha) }}
              </p>
            </div>
            <span class="shrink-0 text-sm font-semibold tabular-nums text-muted">
              {{ Math.round(entrada.probabilidad * 100) }}%
            </span>
            <svg class="shrink-0 text-faint" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </li>
        </ul>
      </BaseCard>
    </template>
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
