<script setup>
import { computed } from 'vue'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { etiquetaMes } from '@/utils/formato'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip)

const props = defineProps({
  datos: { type: Array, required: true },
})

const chartData = computed(() => {
  const contexto = document.createElement('canvas').getContext('2d')
  const gradiente = contexto.createLinearGradient(0, 0, 0, 220)
  gradiente.addColorStop(0, 'rgba(0, 229, 255, 0.22)')
  gradiente.addColorStop(1, 'rgba(0, 229, 255, 0)')

  return {
    labels: props.datos.map(({ mes }) => etiquetaMes(mes)),
    datasets: [
      {
        label: 'Gastos',
        data: props.datos.map(({ total }) => total),
        borderColor: '#00e5ff',
        backgroundColor: gradiente,
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointBackgroundColor: '#00e5ff',
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0b0b0c',
      borderColor: '#1a1a1e',
      borderWidth: 1,
      titleColor: '#ececec',
      bodyColor: '#00e5ff',
      padding: 12,
      displayColors: false,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: {
        color: '#66666e',
        font: { family: "'Space Grotesk', sans-serif", size: 11 },
      },
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      border: { display: false },
      ticks: { color: '#55555c', font: { family: "'Space Grotesk', sans-serif", size: 11 } },
    },
  },
}
</script>

<template>
  <div class="relative h-60">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
