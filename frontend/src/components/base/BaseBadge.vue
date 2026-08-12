<script setup>
import { computed } from 'vue'
import { etiquetaCategoria, colorCategoria } from '@/utils/categorias'

const props = defineProps({
  categoria: { type: String, default: '' },
  tono: { type: String, default: '' },
})

const coloresTono = {
  success: '#34d399',
  warning: '#fbbf24',
  danger: '#f87171',
  accent: '#22d3ee',
}

const color = computed(() =>
  props.tono ? (coloresTono[props.tono] ?? '#9aa3ad') : colorCategoria(props.categoria),
)

const texto = computed(() =>
  props.tono ? props.categoria : etiquetaCategoria(props.categoria),
)

const estilo = computed(() => ({
  color: color.value,
  backgroundColor: `${color.value}1a`,
  borderColor: `${color.value}40`,
}))
</script>

<template>
  <span
    class="inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-semibold tracking-wider"
    :style="estilo"
  >
    {{ texto }}
  </span>
</template>
