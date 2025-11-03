<script setup>
import { ref } from 'vue';
import LayoutComponent from '../components/LayoutComponent.vue';
import FilterBarComponent from '../components/FilterBarComponent.vue';
import ChartComponent from '../components/ChartComponent.vue';
import ButtonComponent from '../components/ButtonComponent.vue';
import LoaderComponent from '../components/LoaderComponent.vue'; // <-- 1. Importa el Loader
import { getReporteCitasPorEspecialidadApi } from '../api/reportes.js'; // <-- 2. Importa la función de API

// Estado para el loader
const loading = ref(false);
const errorMessage = ref(''); // Para mostrar errores

// 3. Prepara los datos del gráfico (ahora vacíos)
const barChartData = ref({
  labels: [],
  datasets: [{
    label: 'Citas',
    backgroundColor: '#0E7490',
    borderRadius: 4,
    data: []
  }]
});

// (Datos del gráfico de líneas, por ahora lo dejamos con ejemplo)
const lineChartData = ref({
  labels: ['Día 1', 'Día 2', 'Día 3', 'Día 4', 'Día 5', 'Día 6', 'Día 7'],
  datasets: [{ label: 'Citas diarias', borderColor: '#059669', backgroundColor: 'rgba(5, 150, 105, 0.1)', fill: true, tension: 0.4, data: [30, 45, 40, 55, 65, 50, 60] }]
});

// 4. Función para formatear los datos de la API al formato del gráfico
//    (Asumimos que la API devuelve: [{ especialidad: 'Cardiología', total: 120 }, ...])
const formatDataForChart = (apiData) => {
  const labels = apiData.map(item => item.especialidad);
  const data = apiData.map(item => item.total);
  return { labels, data };
}

// 5. Esta es la función clave
const handleGenerarReporte = async (filtros) => {
  console.log("Generando reporte con los filtros:", filtros);
  loading.value = true; // Muestra el loader
  errorMessage.value = ''; // Limpia errores
  
  try {
    // Llama a la API que creamos
    const apiData = await getReporteCitasPorEspecialidadApi(filtros);
    
    // Formatea los datos de la API
    const { labels, data } = formatDataForChart(apiData);
    
    // Actualiza el gráfico. Vue lo redibujará automáticamente
    barChartData.value = {
      ...barChartData.value, // Mantiene la configuración
      labels: labels,
      datasets: [{
        ...barChartData.value.datasets[0], // Mantiene la configuración
        data: data
      }]
    };
    
  } catch (error) {
    console.error("Error al generar el reporte:", error);
    errorMessage.value = error.detail || "No se pudo cargar el reporte.";
  } finally {
    loading.value = false; // Oculta el loader
  }
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

      <div v-"if="errorMessage" class="my-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg">
        <strong>Error:</strong> {{ errorMessage }}
      </div>

      <div v-if="loading" class="flex justify-center items-center py-20">
        <LoaderComponent />
      </div>
      
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
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