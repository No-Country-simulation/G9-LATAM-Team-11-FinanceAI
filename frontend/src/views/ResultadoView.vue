<script setup>
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAnalisisFinancieroStore } from '@/stores/analisisFinanciero'
import BaseButton from '@/components/base/BaseButton.vue'
import GraficoGastos from '@/components/result/GraficoGastos.vue'
import RecomendacionesLista from '@/components/result/RecomendacionesLista.vue'

const router = useRouter()
const store = useAnalisisFinancieroStore()
const { resultado, loading, error } = storeToRefs(store)

function irAlFormulario() {
  router.push({ name: 'formulario' })
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
      <BaseButton variante="secundario" @click="irAlFormulario">
        Volver e intentar de nuevo
      </BaseButton>
    </section>

    <template v-else-if="resultado">
      <h1>Tu perfil financiero</h1>

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

      <BaseButton variante="secundario" @click="irAlFormulario">
        Editar mis datos
      </BaseButton>
    </template>

    <section v-else class="resultado-sin-datos">
      <p>No hay resultados todavía. Completa el formulario para analizar tus finanzas.</p>
      <BaseButton variante="secundario" @click="irAlFormulario">
        Ir al formulario
      </BaseButton>
    </section>
  </main>
</template>
