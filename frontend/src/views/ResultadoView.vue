<script setup>
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAnalisisFinancieroStore } from '@/stores/analisisFinanciero'
import GraficoGastos from '@/components/result/GraficoGastos.vue'
import RecomendacionesLista from '@/components/result/RecomendacionesLista.vue'

const router = useRouter()
const store = useAnalisisFinancieroStore()
const { resultado } = storeToRefs(store)

function irAlFormulario() {
  router.push({ name: 'formulario' })
}

function formatoProbabilidad(probabilidad) {
  return `${Math.round(probabilidad * 100)}%`
}
</script>

<template>
  <main class="resultado">
    <template v-if="resultado">
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

      <button type="button" @click="irAlFormulario">Editar mis datos</button>
    </template>

    <section v-else class="resultado-sin-datos">
      <p>No hay resultados todavía. Completa el formulario para analizar tus finanzas.</p>
      <button type="button" @click="irAlFormulario">Ir al formulario</button>
    </section>
  </main>
</template>
