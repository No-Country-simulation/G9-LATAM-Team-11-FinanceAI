<script setup>
import { ref, watch } from 'vue'
import { obtenerHistorialSueldo } from '@/services/usuarios'
import { formatoMoneda } from '@/utils/formato'
import BaseCard from '@/components/base/BaseCard.vue'

const props = defineProps({
  mostrar: { type: Boolean, default: false },
  idUsuario: { type: [Number, String], default: null },
})

const emit = defineEmits(['cerrar'])

const historial = ref([])
const cargando = ref(false)
const error = ref('')

async function cargar() {
  if (!props.idUsuario) return
  cargando.value = true
  error.value = ''
  try {
    const data = await obtenerHistorialSueldo(props.idUsuario)
    historial.value = Array.isArray(data) ? data : []
  } catch (err) {
    error.value = 'No se pudo cargar el historial de sueldo.'
    console.error(err)
  } finally {
    cargando.value = false
  }
}

watch(
  () => props.mostrar,
  (val) => {
    if (val) cargar()
  },
  { immediate: true },
)

function formatoFecha(fechaStr) {
  if (!fechaStr) return ''
  let norm = String(fechaStr).replace(' ', 'T')
  if (!norm.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(norm)) {
    norm += 'Z'
  }
  const d = new Date(norm)
  return d.toLocaleDateString(navigator.language || undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div
    v-if="mostrar"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
    @click.self="emit('cerrar')"
  >
    <BaseCard class="relative w-full max-w-lg overflow-hidden border border-edge bg-surface p-6 shadow-2xl">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-base font-bold text-ink">Historial de Cambios de Sueldo</h3>
        <button
          type="button"
          class="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-white"
          @click="emit('cerrar')"
        >
          ✕
        </button>
      </div>

      <div v-if="cargando" class="flex justify-center py-8 text-sm text-muted">
        Cargando historial...
      </div>

      <div v-else-if="error" class="py-4 text-center text-sm text-danger">
        {{ error }}
      </div>

      <div v-else-if="historial.length === 0" class="py-8 text-center text-sm text-muted">
        No hay registros de cambios de sueldo anteriores.
      </div>

      <div v-else class="max-h-80 overflow-y-auto pr-1 space-y-3">
        <div
          v-for="item in historial"
          :key="item.id || item.fechaModificacion"
          class="flex items-center justify-between rounded-lg border border-edge/60 bg-surface-dark px-4 py-3 text-xs"
        >
          <div>
            <span class="block font-medium text-ink">
              {{ formatoFecha(item.fechaModificacion) }}
            </span>
            <span class="text-muted">
              De {{ formatoMoneda(item.sueldoAnterior) }} a
              <strong class="text-ink">{{ formatoMoneda(item.sueldoNuevo) }}</strong>
            </span>
          </div>

          <div
            :class="[
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold text-[10px] tracking-wide uppercase',
              Number(item.sueldoNuevo) >= Number(item.sueldoAnterior)
                ? 'bg-success/15 text-success'
                : 'bg-danger/15 text-danger',
            ]"
          >
            <!-- Aumento SVG -->
            <svg
              v-if="Number(item.sueldoNuevo) >= Number(item.sueldoAnterior)"
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="7" y1="17" x2="17" y2="7"></line>
              <polyline points="7 7 17 7 17 17"></polyline>
            </svg>
            <!-- Reducción SVG -->
            <svg
              v-else
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="17" y1="7" x2="7" y2="17"></line>
              <polyline points="17 17 7 17 7 7"></polyline>
            </svg>
            <span>{{ Number(item.sueldoNuevo) >= Number(item.sueldoAnterior) ? 'Aumento' : 'Reducción' }}</span>
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-end">
        <button
          type="button"
          class="rounded-lg border border-edge bg-surface-hover px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-edge"
          @click="emit('cerrar')"
        >
          Cerrar
        </button>
      </div>
    </BaseCard>
  </div>
</template>
