<script setup>
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAnalisisFinancieroStore } from '@/stores/analisisFinanciero'
import { useAnalisisFinanciero } from '@/composables/useAnalisisFinanciero'
import TransaccionesLista from '@/components/transactions/TransaccionesLista.vue'

const router = useRouter()
const store = useAnalisisFinancieroStore()
const { ingresoMensual, nivelEndeudamiento, frecuenciaAhorro, loading, error } = storeToRefs(store)
const { enviarAnalisis } = useAnalisisFinanciero()

const opcionesFrecuencia = ['Baja', 'Media', 'Alta']

async function continuar() {
  try {
    await enviarAnalisis()
    router.push({ name: 'resultado' })
  } catch {
    // el error queda en el store y se muestra en la vista
  }
}
</script>

<template>
  <main class="formulario">
    <h1>Análisis financiero</h1>

    <form @submit.prevent="continuar">
      <label for="ingreso-mensual">
        Ingreso mensual
        <input
          id="ingreso-mensual"
          v-model.number="ingresoMensual"
          type="number"
          min="0"
          step="0.01"
          placeholder="Ej: 4500"
        />
      </label>

      <label for="nivel-endeudamiento">
        Nivel de endeudamiento (%)
        <input
          id="nivel-endeudamiento"
          v-model.number="nivelEndeudamiento"
          type="number"
          min="0"
          max="100"
          placeholder="Ej: 25"
        />
      </label>

      <label for="frecuencia-ahorro">
        Frecuencia de ahorro
        <select id="frecuencia-ahorro" v-model="frecuenciaAhorro">
          <option value="" disabled>Selecciona una opción</option>
          <option v-for="opcion in opcionesFrecuencia" :key="opcion" :value="opcion">
            {{ opcion }}
          </option>
        </select>
      </label>

      <TransaccionesLista />

      <p v-if="error" class="formulario-error" role="alert">{{ error }}</p>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Analizando…' : 'Analizar mis finanzas' }}
      </button>
    </form>
  </main>
</template>
