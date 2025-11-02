<script setup>
import { ref } from 'vue';
import LayoutComponent from '../components/LayoutComponent.vue'; // <-- 1. Importa el Layout
import FilterBarComponent from '../components/FilterBarComponent.vue';
import ChartComponent from '../components/ChartComponent.vue';
import ButtonComponent from '../components/ButtonComponent.vue'; // <-- Importamos el botón reutilizable

// El resto de tu script se mantiene igual
const barChartData = ref({
  labels: ['Cardiología', 'Pediatría', 'Dermatología', 'Ortopedia', 'Medicina General'],
  datasets: [{ label: 'Citas', backgroundColor: '#0E7490', borderRadius: 4, data: [120, 150, 80, 95, 200] }]
});

const lineChartData = ref({
  labels: ['Día 1', 'Día 2', 'Día 3', 'Día 4', 'Día 5', 'Día 6', 'Día 7'],
  datasets: [{ label: 'Citas diarias', borderColor: '#059669', backgroundColor: 'rgba(5, 150, 105, 0.1)', fill: true, tension: 0.4, data: [30, 45, 40, 55, 65, 50, 60] }]
});

const handleGenerarReporte = (filtros) => {
  console.log("Generando reporte con los filtros:", filtros);
}

const exportToPDF = () => {
  console.log("Exportando a PDF...");
}

const exportToExcel = () => {
  console.log("Exportando a Excel...");
}
</script>

<template>
  <LayoutComponent>
    <div>
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Generación de reportes</h1>

      <FilterBarComponent @generar-reporte="handleGenerarReporte" />

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div class="p-6 bg-white border border-gray-200 rounded-lg shadow">
          <h2 class="text-lg font-semibold text-gray-700 mb-4">Citas por especialidad</h2>
          <ChartComponent chart-type="bar" :chart-data="barChartData" />
        </div>
        <div class="p-6 bg-white border border-gray-200 rounded-lg shadow">
          <h2 class="text-lg font-semibold text-gray-700 mb-4">Citas diarias</h2>
          <ChartComponent chart-type="line" :chart-data="lineChartData" />
        </div>
      </div>

      <div class="flex justify-end gap-4 mt-6">
        <ButtonComponent 
          variant="secondary" 
          icon="file-pdf" 
          label="Exportar PDF" 
          @click="exportToPDF"
        />
        <ButtonComponent 
          variant="success" 
          icon="file-excel" 
          label="Exportar Excel"
          @click="exportToExcel"
        />
      </div>
    </div>
  </LayoutComponent>
</template>