<script setup>
import { reactive } from 'vue'
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
const errores = reactive({
  ingresoMensual: '',
  nivelEndeudamiento: '',
  frecuenciaAhorro: '',
  transacciones: '',
})

function validar() {
  errores.ingresoMensual = ''
  errores.nivelEndeudamiento = ''
  errores.frecuenciaAhorro = ''
  errores.transacciones = ''

  let valido = true

  const ingreso = Number(store.ingresoMensual)
  if (!Number.isFinite(ingreso) || ingreso <= 0) {
    errores.ingresoMensual = 'Ingresa un ingreso mensual mayor a 0.'
    valido = false
  }

  const endeudamiento = Number(store.nivelEndeudamiento)
  if (!Number.isFinite(endeudamiento) || endeudamiento < 0 || endeudamiento > 100) {
    errores.nivelEndeudamiento = 'Ingresa un nivel de endeudamiento entre 0 y 100.'
    valido = false
  }

  if (!store.frecuenciaAhorro) {
    errores.frecuenciaAhorro = 'Selecciona una frecuencia de ahorro.'
    valido = false
  }

  const hayTransaccionValida = store.transacciones.some(
    (transaccion) => transaccion.descripcion?.trim() && Number(transaccion.valor) > 0,
  )
  if (!hayTransaccionValida) {
    errores.transacciones = 'Agrega al menos una transacción con descripción y monto.'
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
            v-model.number="ingresoMensual"
            type="number"
            min="0"
            step="0.01"
            placeholder="Ej: 4500"
            :class="{ 'campo-invalido': errores.ingresoMensual }"
            :aria-invalid="errores.ingresoMensual ? 'true' : 'false'"
            @input="errores.ingresoMensual = ''"
          />
        </label>
        <p v-if="errores.ingresoMensual" class="campo-error">{{ errores.ingresoMensual }}</p>

        <label for="nivel-endeudamiento">
          Nivel de endeudamiento (%)
          <input
            id="nivel-endeudamiento"
            v-model.number="nivelEndeudamiento"
            type="number"
            min="0"
            max="100"
            placeholder="Ej: 25"
            :class="{ 'campo-invalido': errores.nivelEndeudamiento }"
            :aria-invalid="errores.nivelEndeudamiento ? 'true' : 'false'"
            @input="errores.nivelEndeudamiento = ''"
          />
        </label>
        <p v-if="errores.nivelEndeudamiento" class="campo-error">
          {{ errores.nivelEndeudamiento }}
        </p>

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

        <TransaccionesLista />

        <p v-if="errores.transacciones" class="campo-error">{{ errores.transacciones }}</p>
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
