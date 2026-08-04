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
  props.tono ? (coloresTono[props.tono] ?? '#8b95a7') : colorCategoria(props.categoria),
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
  <span class="badge" :style="estilo">{{ texto }}</span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
}
</style>
