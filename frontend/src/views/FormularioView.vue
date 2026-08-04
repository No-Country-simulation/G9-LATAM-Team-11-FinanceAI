<script setup>
import { reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAnalisisFinancieroStore } from '@/stores/analisisFinanciero'
import { useUsuarioStore } from '@/stores/usuario'
import { useAnalisisFinanciero } from '@/composables/useAnalisisFinanciero'

const router = useRouter()
const store = useAnalisisFinancieroStore()
const usuarioStore = useUsuarioStore()
const { frecuenciaAhorro, loading, error } = storeToRefs(store)
const { ingresoDisponible } = storeToRefs(usuarioStore)
const { enviarAnalisis } = useAnalisisFinanciero()

const opcionesFrecuencia = ['Baja', 'Media', 'Alta']
const errores = reactive({
  ingreso: '',
  frecuenciaAhorro: '',
})

function validar() {
  errores.ingreso = ''
  errores.frecuenciaAhorro = ''

  let valido = true

  const ingreso = Number(usuarioStore.ingresoDisponible)
  if (!Number.isFinite(ingreso) || ingreso <= 0) {
    errores.ingreso = 'Ingresa un ingreso mensual mayor a 0.'
    valido = false
  }

  if (!store.frecuenciaAhorro) {
    errores.frecuenciaAhorro = 'Selecciona una frecuencia de ahorro.'
    valido = false
  }

  return valido
}

async function continuar() {
  if (!validar()) return

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
      <fieldset :disabled="loading">
        <label for="ingreso-mensual">
          Ingreso mensual
          <input
            id="ingreso-mensual"
            v-model.number="ingresoDisponible"
            type="number"
            min="0"
            step="0.01"
            placeholder="Ej: 4500"
            :class="{ 'campo-invalido': errores.ingreso }"
            :aria-invalid="errores.ingreso ? 'true' : 'false'"
            @input="errores.ingreso = ''"
          />
        </label>
        <p v-if="errores.ingreso" class="campo-error">{{ errores.ingreso }}</p>

        <label for="frecuencia-ahorro">
          Frecuencia de ahorro
          <select
            id="frecuencia-ahorro"
            v-model="frecuenciaAhorro"
            :class="{ 'campo-invalido': errores.frecuenciaAhorro }"
            :aria-invalid="errores.frecuenciaAhorro ? 'true' : 'false'"
            @change="errores.frecuenciaAhorro = ''"
          >
            <option value="" disabled>Selecciona una opción</option>
            <option v-for="opcion in opcionesFrecuencia" :key="opcion" :value="opcion">
              {{ opcion }}
            </option>
          </select>
        </label>
        <p v-if="errores.frecuenciaAhorro" class="campo-error">
          {{ errores.frecuenciaAhorro }}
        </p>
      </fieldset>

      <p v-if="error" id="formulario-error" class="formulario-error" role="alert">
        {{ error }}
      </p>

      <button type="submit" :disabled="loading" :aria-busy="loading">
        {{ loading ? 'Analizando…' : 'Analizar mis finanzas' }}
      </button>
    </form>
  </main>
</template>
