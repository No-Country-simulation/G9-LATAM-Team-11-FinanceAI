<script setup>
import { computed } from 'vue'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import { etiquetaCategoria, colorCategoria } from '@/utils/categorias'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  datos: { type: Array, required: true },
})

const chartData = computed(() => ({
  labels: props.datos.map(([categoria]) => etiquetaCategoria(categoria)),
  datasets: [
    {
      data: props.datos.map(([, total]) => total),
      backgroundColor: props.datos.map(([categoria]) => colorCategoria(categoria)),
      borderColor: '#0a0a0b',
      borderWidth: 2,
      hoverOffset: 6,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#8a8a92',
        usePointStyle: true,
        pointStyle: 'circle',
        boxWidth: 8,
        boxHeight: 8,
        padding: 16,
        font: { family: "'Space Grotesk', sans-serif", size: 12 },
      },
    },
    tooltip: {
      backgroundColor: '#0b0b0c',
      borderColor: '#1a1a1e',
      borderWidth: 1,
      titleColor: '#ececec',
      bodyColor: '#8a8a92',
      padding: 12,
      displayColors: false,
    },
  },
}
</script>

<template>
  <div class="relative h-64">
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>
