<script setup>
import { reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useUsuarioStore } from '@/stores/usuario'
import { useDivisaStore } from '@/stores/divisa'
import { useTransacciones } from '@/composables/useTransacciones'
import BaseButton from '@/components/base/BaseButton.vue'

const emit = defineEmits(['creada'])
const usuarioStore = useUsuarioStore()
const divisaStore = useDivisaStore()
const { ingresoDisponible, esDemo } = storeToRefs(usuarioStore)
const { monedaActiva } = storeToRefs(divisaStore)
const { crearTransaccion } = useTransacciones()

const cargando = ref(false)
const error = ref('')
const exito = ref(false)
const mensajeExito = ref('')

const form = reactive({
  descripcion: '',
  monto: null,
  fecha: hoy(),
})

function hoy() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function primerDiaDelMes() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function prevenirTeclasInvalidas(e) {
  if (['-', '+', 'e', 'E'].includes(e.key)) {
    e.preventDefault()
  }
}

function validar() {
  if (!form.descripcion.trim()) return 'La descripción es obligatoria.'
  if (!form.monto || form.monto <= 0) return 'Ingresa un monto mayor a 0.'
  // En modo demo no hay ingreso disponible real, se omite la validación de límite
  if (!esDemo.value) {
    const limiteEnMonedaActiva = divisaStore.convertirDesdeUSD(ingresoDisponible.value)
    if (form.monto >= limiteEnMonedaActiva) return 'El monto debe ser menor que tu ingreso disponible.'
  }
  if (!form.fecha) return 'La fecha es obligatoria.'
  if (form.fecha < primerDiaDelMes() || form.fecha > hoy()) return 'La fecha debe estar dentro del mes actual.'
  return ''
}

function limpiar() {
  form.descripcion = ''
  form.monto = null
  form.fecha = hoy()
  error.value = ''
}

async function enviar() {
  error.value = ''
  exito.value = false
  mensajeExito.value = ''
  const mensaje = validar()
  if (mensaje) {
    error.value = mensaje
    return
  }
  cargando.value = true
  try {
    const montoUSD = divisaStore.convertirAUSD(form.monto)
    const resultado = await crearTransaccion({
      descripcion: form.descripcion.trim(),
      monto: montoUSD,
      fecha: form.fecha,
    })
    const categoriaAsignada = resultado?.categoria
    if (categoriaAsignada) {
      mensajeExito.value = `Registrado. Categoría: ${categoriaAsignada}`
    } else {
      mensajeExito.value = 'Transacción registrada correctamente.'
    }
    exito.value = true
    limpiar()
    // Emitir 'creada' con delay para que el toast sea visible antes de que
    // el padre cierre el formulario (TransaccionesView pone mostrarFormulario=false)
    setTimeout(() => { emit('creada') }, 1500)
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
        <div class="relative">
          <input
            id="tx-monto"
            v-model.number="form.monto"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Ej: 500"
            class="pr-14"
            @keypress="prevenirTeclasInvalidas"
          />
          <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted">
            {{ monedaActiva }}
          </span>
        </div>
      </label>
    </div>
    <div class="grid gap-4 sm:grid-cols-2">
      <label for="tx-fecha">
        Fecha
        <input
          id="tx-fecha"
          v-model="form.fecha"
          type="date"
        />
        <span class="mt-1 block text-xs text-muted">Solo fechas del mes actual</span>
      </label>
    </div>

    <p v-if="error" class="rounded-md border border-danger-edge bg-danger-bg px-3 py-2 text-sm text-danger" role="alert">
      {{ error }}
    </p>

    <p v-if="exito" class="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success" role="status">
      {{ mensajeExito }}
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
