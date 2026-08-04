<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  etiqueta: { type: String, required: true },
  valor: { type: Number, required: true },
  formato: { type: Function, default: (n) => n },
  delta: { type: String, default: '' },
  tono: { type: String, default: '' },
})

const mostrado = ref(0)
let raf = null

const tonoClases = {
  success: 'text-success',
  danger: 'text-danger',
  cyan: 'text-cyan',
}

function animar() {
  cancelAnimationFrame(raf)
  const desde = 0
  const hasta = Number(props.valor) || 0
  const duracion = 900
  const inicio = performance.now()

  const paso = (tiempo) => {
    const progreso = Math.min(1, (tiempo - inicio) / duracion)
    const eased = 1 - Math.pow(1 - progreso, 3)
    mostrado.value = desde + (hasta - desde) * eased
    if (progreso < 1) {
      raf = requestAnimationFrame(paso)
    } else {
      mostrado.value = hasta
    }
  }

  raf = requestAnimationFrame(paso)
}

onMounted(animar)
watch(() => props.valor, animar)
onUnmounted(() => cancelAnimationFrame(raf))
</script>

<template>
  <div class="min-w-[150px] rounded-lg border border-edge bg-surface p-4">
    <span class="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">{{ etiqueta }}</span>
    <strong class="mt-1.5 block text-xl font-bold tabular-nums tracking-tight text-white">
      {{ formato(mostrado) }}
    </strong>
    <span
      v-if="delta"
      class="mt-1 block font-mono text-xs"
      :class="tonoClases[tono] ?? 'text-cyan'"
    >
      {{ delta }}
    </span>
  </div>
</template>
