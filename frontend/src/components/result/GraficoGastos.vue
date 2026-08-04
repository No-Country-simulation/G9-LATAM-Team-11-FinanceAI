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

const colores = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6']

const chartData = computed(() => {
  const entradas = Object.entries(props.gastos)
  return {
    labels: entradas.map(([nombre]) => nombre.charAt(0).toUpperCase() + nombre.slice(1)),
    datasets: [
      {
        label: 'Gastos',
        data: entradas.map(([, valor]) => valor),
        backgroundColor: entradas.map((_, indice) => colores[indice % colores.length]),
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
    y: {
      beginAtZero: true,
    },
  },
}
</script>

<template>
  <div class="relative h-60">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>
