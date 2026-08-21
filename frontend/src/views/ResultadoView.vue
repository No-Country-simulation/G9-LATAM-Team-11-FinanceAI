<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAnalisisFinancieroStore } from '@/stores/analisisFinanciero'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import GraficoGastos from '@/components/result/GraficoGastos.vue'
import GaugeChart from '@/components/result/GaugeChart.vue'
import RecomendacionesLista from '@/components/result/RecomendacionesLista.vue'

const router = useRouter()
const store = useAnalisisFinancieroStore()
const { resultado, loading, error } = storeToRefs(store)

const periodoTexto = computed(() => {
  const ahora = new Date()
  const inicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
  const desde = inicio.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
  const hasta = ahora.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${desde} — ${hasta}`
})

const colorPerfil = computed(() => {
  if (!resultado.value) return '#94a3b8'
  const p = resultado.value.perfil_financiero
  if (p === 'Saludable') return '#10b981'
  if (p === 'En observación') return '#f59e0b'
  return '#ef4444'
})

const mayorGasto = computed(() => {
  if (!resultado.value?.resumen_gastos) return null
  const entradas = Object.entries(resultado.value.resumen_gastos)
  if (!entradas.length) return null
  const total = entradas.reduce((sum, [, v]) => sum + v, 0)
  const [categoria, monto] = entradas.sort((a, b) => b[1] - a[1])[0]
  return { categoria, monto, porcentaje: Math.round((monto / total) * 100) }
})

function irAlAnalisis() {
  router.push({ name: 'analisis' })
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
    <section v-if="loading" class="flex items-center justify-center py-20" aria-busy="true">
      <p class="text-muted">Analizando tus finanzas…</p>
    </section>

    <section v-else-if="error && !resultado" class="text-center py-12">
      <p class="mb-4 rounded-md border border-danger-edge bg-danger-bg px-4 py-3 text-sm text-danger">{{ error }}</p>
      <BaseButton variante="secundario" @click="irAlAnalisis">
        Volver e intentar de nuevo
      </BaseButton>
    </section>

    <template v-else-if="resultado">
      <!-- Perfil financiero -->
      <BaseCard>
        <div class="flex flex-col items-center gap-3 py-4 text-center">
          <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
            Período: {{ periodoTexto }}
          </p>
          <h1 class="text-3xl font-bold" :style="{ color: colorPerfil }">
            {{ resultado.perfil_financiero }}
          </h1>
          <p class="text-sm text-muted">
            Probabilidad de clasificación:
            <span class="font-semibold text-ink">{{ Math.round(resultado.probabilidad * 100) }}%</span>
          </p>
        </div>
      </BaseCard>

      <!-- Gauges -->
      <BaseCard>
        <h2 class="mb-4 text-center text-sm font-semibold text-ink">Indicadores clave</h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <GaugeChart
            :valor="resultado.nivel_endeudamiento ?? 0"
            etiqueta="Endeudamiento"
            invertido
          />
          <GaugeChart
            :valor="resultado.frecuencia_ahorro ?? 0"
            etiqueta="Capacidad de ahorro"
          />
          <GaugeChart
            :valor="resultado.ratio_gasto_ingreso ?? 0"
            etiqueta="Gasto / Ingreso"
            invertido
          />
        </div>
      </BaseCard>

      <!-- Distribución de gastos -->
      <BaseCard v-if="resultado.resumen_gastos">
        <h2 class="mb-4 text-sm font-semibold text-ink">Distribución de gastos</h2>
        <GraficoGastos :gastos="resultado.resumen_gastos" />
        <p v-if="mayorGasto" class="mt-4 text-center text-xs text-muted">
          Tu mayor gasto es
          <span class="font-semibold text-ink">{{ mayorGasto.categoria }}</span>
          ({{ mayorGasto.porcentaje }}% del total)
        </p>
      </BaseCard>

      <!-- Recomendaciones -->
      <RecomendacionesLista :recomendaciones="resultado.recomendaciones" />

      <div class="flex justify-center">
        <BaseButton variante="secundario" @click="irAlAnalisis">
          Volver al análisis
        </BaseButton>
      </div>
    </template>

    <section v-else class="text-center py-12">
      <p class="mb-4 text-sm text-muted">No hay resultados todavía. Analiza tus finanzas para ver tu perfil.</p>
      <BaseButton variante="secundario" @click="irAlAnalisis">
        Ir al análisis
      </BaseButton>
    </section>
  </div>
</template>
