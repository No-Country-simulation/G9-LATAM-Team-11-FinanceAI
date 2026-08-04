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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps({
  gastos: {
    type: Object,
    required: true,
  },
})

const colores = [
  '#00e5ff',
  'rgba(0, 229, 255, 0.72)',
  'rgba(0, 229, 255, 0.5)',
  'rgba(0, 229, 255, 0.35)',
  'rgba(0, 229, 255, 0.22)',
  '#9aa3ad',
]

const chartData = computed(() => {
  const entradas = Object.entries(props.gastos)
  return {
    labels: entradas.map(([nombre]) => nombre.charAt(0).toUpperCase() + nombre.slice(1)),
    datasets: [
      {
        label: 'Gastos',
        data: entradas.map(([, valor]) => valor),
        backgroundColor: entradas.map((_, indice) => colores[indice % colores.length]),
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
