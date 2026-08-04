<script setup>
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAnalisisFinancieroStore } from '@/stores/analisisFinanciero'

const router = useRouter()
const store = useAnalisisFinancieroStore()
const { ingresoMensual, nivelEndeudamiento, frecuenciaAhorro } = storeToRefs(store)

const opcionesFrecuencia = ['Baja', 'Media', 'Alta']

function continuar() {
  router.push({ name: 'resultado' })
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

      <button type="submit">Analizar mis finanzas</button>
    </form>
  </main>
</template>
