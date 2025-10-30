<script setup>
import { ref } from 'vue';
import FilterBarComponent from '../components/FilterBarComponent.vue';
import ChartComponent from '../components/ChartComponent.vue'; // <-- 1. Importa el nuevo componente

// --- DATOS DE EJEMPLO PARA EL GRÁFICO DE BARRAS ---
// Más adelante, estos datos vendrán de tu API
const barChartData = ref({
  labels: ['Cardiología', 'Pediatría', 'Dermatología', 'Ortopedia', 'Medicina General'],
  datasets: [
    {
      label: 'Citas',
      backgroundColor: '#0E7490', // Un color cian oscuro
      borderRadius: 4,
      data: [120, 150, 80, 95, 200]
    }
  ]
});
// ---------------------------------------------------

const handleGenerarReporte = (filtros) => {
  console.log("Generando reporte con los filtros:", filtros);
  // Aquí llamaremos a la API y actualizaremos 'barChartData.value' con los datos reales
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Generación de reportes</h1>

    <FilterBarComponent @generar-reporte="handleGenerarReporte" />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <div class="p-6 bg-white border border-gray-200 rounded-lg shadow">
        <h2 class="text-lg font-semibold text-gray-700 mb-4">Citas por especialidad</h2>
        <ChartComponent
          chart-type="bar"
          :chart-data="barChartData"
        />
      </div>
      <div class="p-6 bg-white border border-gray-200 rounded-lg shadow">
        <h2 class="text-lg font-semibold text-gray-700">Citas diarias</h2>
        <p class="text-center text-gray-500 mt-16">Próximamente...</p>
      </div>
    </div>
  </div>
</template>