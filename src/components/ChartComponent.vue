<script setup>
import { Bar, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
} from 'chart.js'

// Registramos los componentes de Chart.js que vamos a utilizar
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
)

// Definimos las 'props' que este componente recibirá desde su padre
defineProps({
  chartData: {
    type: Object,
    required: true
  },
  chartOptions: {
    type: Object,
    default: () => ({ responsive: true, maintainAspectRatio: false })
  },
  chartType: {
    type: String,
    required: true,
    validator: (value) => ['bar', 'line'].includes(value) // Acepta solo 'bar' o 'line'
  }
})
</script>

<template>
  <div style="height: 350px;">
    <Bar
      v-if="chartType === 'bar'"
      :data="chartData"
      :options="chartOptions"
    />

    <Line
      v-if="chartType === 'line'"
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>