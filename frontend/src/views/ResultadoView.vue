<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAnalisisFinancieroStore } from '@/stores/analisisFinanciero'
import BaseButton from '@/components/base/BaseButton.vue'
import GraficoGastos from '@/components/result/GraficoGastos.vue'
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

function irAlAnalisis() {
  router.push({ name: 'analisis' })
}

function formatoProbabilidad(probabilidad) {
  return `${Math.round(probabilidad * 100)}%`
}
</script>

<template>
  <main class="resultado mx-auto w-full max-w-lg">
    <section v-if="loading" class="resultado-estado" aria-busy="true">
      <p>Analizando tus finanzas…</p>
    </section>

    <section v-else-if="error && !resultado" class="resultado-estado">
      <p class="resultado-error">{{ error }}</p>
      <BaseButton variante="secundario" @click="irAlAnalisis">
        Volver e intentar de nuevo
      </BaseButton>
    </section>

    <template v-else-if="resultado">
      <h1>Tu perfil financiero</h1>
      <p class="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-dim">
        Período: {{ periodoTexto }}
      </p>

      <section class="resultado-perfil">
        <p class="resultado-perfil-nombre">{{ resultado.perfil_financiero }}</p>
        <p class="resultado-probabilidad">
          Probabilidad: {{ formatoProbabilidad(resultado.probabilidad) }}
        </p>
      </section>

      <section v-if="resultado.resumen_gastos" class="resultado-gastos">
        <h2>Resumen de gastos</h2>
        <GraficoGastos :gastos="resultado.resumen_gastos" />
      </section>

      <RecomendacionesLista :recomendaciones="resultado.recomendaciones" />

      <BaseButton variante="secundario" @click="irAlAnalisis">
        Volver al análisis
      </BaseButton>
    </template>

    <section v-else class="resultado-sin-datos">
      <p>No hay resultados todavía. Analiza tus finanzas para ver tu perfil.</p>
      <BaseButton variante="secundario" @click="irAlAnalisis">
        Ir al análisis
      </BaseButton>
    </section>
  </main>
</template>
