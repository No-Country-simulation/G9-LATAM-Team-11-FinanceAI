<script setup>
import { reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useUsuarioStore } from '@/stores/usuario'
import { useTransacciones } from '@/composables/useTransacciones'
import { CATEGORIAS } from '@/utils/categorias'
import BaseButton from '@/components/base/BaseButton.vue'

const emit = defineEmits(['creada'])
const usuarioStore = useUsuarioStore()
const { ingresoDisponible } = storeToRefs(usuarioStore)
const { crearTransaccion } = useTransacciones()

const cargando = ref(false)
const error = ref('')
const exito = ref(false)

const form = reactive({
  descripcion: '',
  monto: null,
  categoria: '',
  fecha: hoy(),
})

function hoy() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function validar() {
  if (!form.descripcion.trim()) return 'La descripción es obligatoria.'
  if (!form.monto || form.monto <= 0) return 'Ingresa un monto mayor a 0.'
  if (form.monto >= ingresoDisponible.value) return 'El monto debe ser menor que tu ingreso disponible.'
  if (!form.categoria) return 'Selecciona una categoría.'
  if (!form.fecha) return 'La fecha es obligatoria.'
  return ''
}

function limpiar() {
  form.descripcion = ''
  form.monto = null
  form.categoria = ''
  form.fecha = hoy()
  error.value = ''
}

async function enviar() {
  error.value = ''
  exito.value = false
  const mensaje = validar()
  if (mensaje) {
    error.value = mensaje
    return
  }
  cargando.value = true
  try {
    await crearTransaccion({
      descripcion: form.descripcion.trim(),
      monto: form.monto,
      categoria: form.categoria,
      fecha: form.fecha,
    })
    exito.value = true
    limpiar()
    emit('creada')
    setTimeout(() => { exito.value = false }, 3000)
  } catch (err) {
    error.value = err.message
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <form class="grid gap-4" @submit.prevent="enviar">
    <div class="grid gap-4 sm:grid-cols-2">
      <label for="tx-descripcion">
        Descripción
        <input
          id="tx-descripcion"
          v-model="form.descripcion"
          type="text"
          placeholder="Ej: Supermercado"
        />
      </label>
      <label for="tx-monto">
        Monto
        <input
          id="tx-monto"
          v-model.number="form.monto"
          type="number"
          step="0.01"
          placeholder="Ej: 500"
        />
      </label>
    </div>
    <div class="grid gap-4 sm:grid-cols-2">
      <label for="tx-categoria">
        Categoría
        <!-- TODO: categoría será asignada por DS en el futuro -->
        <select id="tx-categoria" v-model="form.categoria">
          <option value="" disabled>Selecciona</option>
          <option v-for="(info, clave) in CATEGORIAS" :key="clave" :value="clave">
            {{ info.etiqueta }}
          </option>
        </select>
      </label>
      <label for="tx-fecha">
        Fecha
        <input
          id="tx-fecha"
          v-model="form.fecha"
          type="date"
        />
      </label>
    </div>

    <p v-if="error" class="rounded-md border border-danger-edge bg-danger-bg px-3 py-2 text-sm text-danger" role="alert">
      {{ error }}
    </p>

    <p v-if="exito" class="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success" role="status">
      Transacción registrada correctamente.
    </p>

    <div class="flex gap-3">
      <BaseButton tipo="submit" :cargando="cargando">
        Registrar gasto
      </BaseButton>
      <BaseButton variante="fantasma" @click="limpiar">
        Limpiar
      </BaseButton>
    </div>
  </form>
</template>
