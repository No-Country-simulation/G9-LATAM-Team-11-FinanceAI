<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import { Bar } from 'vue-chartjs'
import { etiquetaCategoria, colorCategoria } from '@/utils/categorias'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps({
  gastos: {
    type: Object,
    required: true,
  },
})

const chartData = computed(() => {
  const entradas = Object.entries(props.gastos)
  return {
    labels: entradas.map(([categoria]) => etiquetaCategoria(categoria)),
    datasets: [
      {
        label: 'Gastos',
        data: entradas.map(([, valor]) => valor),
        backgroundColor: entradas.map(([categoria]) => colorCategoria(categoria)),
        borderRadius: 6,
        maxBarThickness: 48,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#8a8a92', font: { family: "'Space Grotesk', sans-serif", size: 12 } },
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(255, 255, 255, 0.06)' },
      border: { display: false },
      ticks: { color: '#66666e', font: { family: "'Space Grotesk', sans-serif", size: 11 } },
    },
  },
}
</script>

<template>
  <div class="relative h-60">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>
