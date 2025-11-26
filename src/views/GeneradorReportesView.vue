<template>
  <LayoutComponent>
    <div>
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Generación de reportes</h1>

      <FilterBarComponent @generar-reporte="handleGenerarReporte" />

      <!-- Mensaje de Error -->
      <div v-if="errorMessage" class="my-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg">
        <strong>Error:</strong> {{ errorMessage }}
      </div>

      <!-- Contenido condicional (Loader o Gráficos) -->
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
        <ButtonComponent variant="secondary" icon="file-pdf" label="Exportar PDF" @click="exportToPDF"
          :disabled="loading || (barChartData.labels.length === 0 && lineChartData.labels.length === 0)" />
        <ButtonComponent variant="success" icon="file-excel" label="Exportar Excel" @click="exportToExcel"
          :disabled="loading || (barChartData.labels.length === 0 && lineChartData.labels.length === 0)" />
      </div>
    </div>
  </LayoutComponent>
</template>

<script setup>
import { ref } from 'vue';
import LayoutComponent from '../components/LayoutComponent.vue';
import FilterBarComponent from '../components/FilterBarComponent.vue';
import ChartComponent from '../components/ChartComponent.vue';
import ButtonComponent from '../components/ButtonComponent.vue';
import LoaderComponent from '../components/LoaderComponent.vue';
import {
  getReporteCitasPorEspecialidadApi,
  getReporteCitasDiariasApi
} from '../api/reportes.js';

// --- IMPORTACIONES PARA EXPORTAR (CORREGIDAS) ---
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // <-- 1. Importar 'autoTable' directamente
import * as XLSX from 'xlsx';
// -------------------------------------

// Estado
const loading = ref(false);
const errorMessage = ref('');

// --- GRÁFICO 1: Datos de Barras (Inicia vacío) ---
const barChartData = ref({
  labels: [],
  datasets: [{
    label: 'Citas',
    backgroundColor: '#0E7490',
    borderRadius: 4,
    data: []
  }]
});

// --- GRÁFICO 2: Datos de Líneas (Inicia vacío) ---
const lineChartData = ref({
  labels: [],
  datasets: [{
    label: 'Citas diarias',
    borderColor: '#059669',
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    fill: true,
    tension: 0.4,
    data: []
  }]
});

// --- Funciones de Formateo (CORREGIDAS según tu schema) ---

// Tu schema dice: { especialidad: str, total_citas: int }
const formatDataForChart = (apiData) => {
  if (!Array.isArray(apiData)) {
    console.error("formatDataForChart esperaba un array, pero recibió:", apiData);
    return { labels: [], data: [] };
  }
  const labels = apiData.map(item => item.especialidad);
  const data = apiData.map(item => item.total_citas);
  return { labels, data };
}

// Tu schema dice: { dia: date, total_citas: int }
const formatDataForLineChart = (apiData) => {
  if (!Array.isArray(apiData)) {
    console.error("formatDataForLineChart esperaba un array, pero recibió:", apiData);
    return { labels: [], data: [] };
  }
  const labels = apiData.map(item => item.dia);
  const data = apiData.map(item => item.total_citas);
  return { labels, data };
}


const handleGenerarReporte = async (filtros) => {
  //console.log("Generando ambos reportes con:", filtros);
  loading.value = true;
  errorMessage.value = '';

  // Limpiamos los gráficos anteriores
  barChartData.value = { ...barChartData.value, labels: [], datasets: [{ ...barChartData.value.datasets[0], data: [] }] };
  lineChartData.value = { ...lineChartData.value, labels: [], datasets: [{ ...lineChartData.value.datasets[0], data: [] }] };

  try {
    const [
      dataEspecialidad,
      dataDiaria
    ] = await Promise.all([
      getReporteCitasPorEspecialidadApi(filtros),
      getReporteCitasDiariasApi(filtros)
    ]);

    // --- Actualiza el gráfico de barras ---
    const { labels: barLabels, data: barData } = formatDataForChart(dataEspecialidad);
    barChartData.value = {
      ...barChartData.value,
      labels: barLabels,
      datasets: [{ ...barChartData.value.datasets[0], data: barData }]
    };

    // --- Actualiza el gráfico de líneas ---
    const { labels: lineLabels, data: lineData } = formatDataForLineChart(dataDiaria);
    lineChartData.value = {
      ...lineChartData.value,
      labels: lineLabels,
      datasets: [{ ...lineChartData.value.datasets[0], data: lineData }]
    };

  } catch (error) {
    // Lógica de error mejorada
    console.error("Error al generar los reportes:", error);
    if (typeof error.detail === 'string') {
      errorMessage.value = error.detail;
    } else if (Array.isArray(error.detail) && error.detail[0]) {
      errorMessage.value = `${error.detail[0].loc[1]}: ${error.detail[0].msg}`;
    } else if (error.message) {
      errorMessage.value = error.message;
    } else {
      errorMessage.value = "No se pudieron cargar los reportes. Revisa la consola.";
    }
  } finally {
    loading.value = false;
  }
}

// --- FUNCIÓN PARA EXPORTAR A PDF (CORREGIDA) ---
const exportToPDF = () => {
  //console.log("Exportando a PDF...");
  const doc = new jsPDF();

  doc.text("Reporte de Citas", 14, 16);

  // Tabla 1: Citas por Especialidad
  if (barChartData.value.labels.length > 0) {
    autoTable(doc, {
      startY: 30, // <-- CAMBIO AQUÍ: Más espacio para el título
      head: [['Especialidad', 'Total Citas']],
      body: barChartData.value.labels.map((label, index) => [
        label,
        barChartData.value.datasets[0].data[index]
      ]),
      didDrawPage: (data) => {
        // Título de la tabla
        doc.text("Citas por Especialidad", data.settings.margin.left, data.settings.startY - 5);
      }
    });
  } else {
    autoTable(doc, {
      startY: 30, // <-- CAMBIO AQUÍ: Más espacio para el título
      head: [['Citas por Especialidad']],
      body: [['No hay datos para mostrar']],
    });
  }

  // Tabla 2: Citas Diarias
  if (lineChartData.value.labels.length > 0) {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 15,
      head: [['Día', 'Total Citas']],
      body: lineChartData.value.labels.map((label, index) => [
        label,
        lineChartData.value.datasets[0].data[index]
      ]),
      didDrawPage: (data) => {
        // Título de la tabla
        doc.text("Citas Diarias", data.settings.margin.left, data.settings.startY - 5);
      }
    });
  } else {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 15,
      head: [['Citas Diarias']],
      body: [['No hay datos para mostrar']],
    });
  }

  doc.save('reporte_citas.pdf');
}

// --- FUNCIÓN PARA EXPORTAR A EXCEL ---
const exportToExcel = () => {
  //console.log("Exportando a Excel...");

  // 1. Preparar datos para la Hoja 1 (Especialidad)
  const dataEspecialidad = barChartData.value.labels.map((label, index) => ({
    Especialidad: label,
    'Total Citas': barChartData.value.datasets[0].data[index]
  }));

  // 2. Preparar datos para la Hoja 2 (Diario)
  const dataDiaria = lineChartData.value.labels.map((label, index) => ({
    Dia: label,
    'Total Citas': lineChartData.value.datasets[0].data[index]
  }));

  // 3. Crear el libro de trabajo y las hojas
  const wb = XLSX.utils.book_new();
  const wsEspecialidad = XLSX.utils.json_to_sheet(dataEspecialidad.length > 0 ? dataEspecialidad : [{ "Reporte": "No hay datos de especialidad" }]);
  const wsDiaria = XLSX.utils.json_to_sheet(dataDiaria.length > 0 ? dataDiaria : [{ "Reporte": "No hay datos de citas diarias" }]);

  // 4. Añadir las hojas al libro
  XLSX.utils.book_append_sheet(wb, wsEspecialidad, "Citas por Especialidad");
  XLSX.utils.book_append_sheet(wb, wsDiaria, "Citas Diarias");

  // 5. Descargar el archivo
  XLSX.writeFile(wb, "reporte_citas.xlsx");
}
</script>

<style scoped>
/* Puedes añadir estilos específicos aquí si es necesario */
</style>