  <template>
    <LayoutComponent>
      <div>
        <h1 class="text-3xl font-bold text-gray-800 mb-6">Generación de reportes</h1>
        
        <!-- Barra de filtros con el Slot para el Select -->
        <FilterBarComponent @generar-reporte="handleGenerarReporte">
          
          <template #filtros-extra>
            <label for="fecha-fin" class="ml-4 text-sm font-medium text-gray-700">Hasta:</label>
            <select 
                v-model="especialidadSeleccionada" 
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 max-w-xs"
            >
                <option value="" selected>Todas las especialidades</option>
                <!-- Iteramos sobre la lista real de la API -->
                <!-- Asegúrate de que 'esp.id_especialidad' y 'esp.nombre' sean los campos correctos de tu API -->
                <option v-for="esp in listaEspecialidades" :key="esp.id_especialidad" :value="esp.id_especialidad">
                  {{ esp.nombre }}
                </option>
            </select>
          </template>

        </FilterBarComponent>

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
            <h2 class="text-lg font-semibold text-gray-700 mb-4">Citas por Personal Médico</h2>
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
            :disabled="loading || (barChartData.labels.length === 0 && lineChartData.labels.length === 0)"
          />
          <ButtonComponent 
            variant="success" 
            icon="file-excel" 
            label="Exportar Excel"
            @click="exportToExcel"
            :disabled="loading || (barChartData.labels.length === 0 && lineChartData.labels.length === 0)"
          />
        </div>
      </div>
    </LayoutComponent>
  </template>

  <script setup>
  import { ref, onMounted } from 'vue';
  import LayoutComponent from '../components/LayoutComponent.vue';
  import FilterBarComponent from '../components/FilterBarComponent.vue';
  import ChartComponent from '../components/ChartComponent.vue';
  import ButtonComponent from '../components/ButtonComponent.vue';
  import LoaderComponent from '../components/LoaderComponent.vue';
  import { 
    getReporteCitasPorEspecialidadApi,
    getReporteCitasDiariasApi
  } from '../api/reportes.js';
  // 👇 Importamos tu API existente de especialidades
  import { getEspecialidadesApi } from '../api/especialidades.js';

  // --- IMPORTACIONES PARA EXPORTAR ---
  import jsPDF from 'jspdf';
  import autoTable from 'jspdf-autotable';
  import * as XLSX from 'xlsx';

  // --- ESTADO ---
  const loading = ref(false);
  const errorMessage = ref('');
  const especialidadSeleccionada = ref("");
  const listaEspecialidades = ref([]); // Aquí guardaremos los datos de la API

  // --- GRÁFICOS (Datos iniciales vacíos) ---
  const barChartData = ref({
    labels: [],
    datasets: [{
      label: 'Citas',
      backgroundColor: '#0E7490',
      borderRadius: 4,
      data: []
    }]
  });

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

  // --- FUNCIONES AUXILIARES ---

  // Formateo para Gráfico de Barras (CORREGIDO)
  const formatDataForChart = (apiData) => {
    if (!Array.isArray(apiData)) {
      console.error("formatDataForChart esperaba un array, pero recibió:", apiData);
      return { labels: [], data: [] };
    }

    // CORRECCIÓN: Cambiamos 'nombre_medico' por 'nombre_especialidad'
    // Nota: Verifica en tu consola (F12 -> Network) si el campo se llama 
    // "nombre_especialidad", "nombre" o "especialidad". 
    // Usualmente es "nombre_especialidad".
  const labels = apiData.map(item => item.nombre_medico); 
    
  const data = apiData.map(item => item.total_citas);
    return { labels, data };
  }

  // Formateo para Gráfico de Líneas
  const formatDataForLineChart = (apiData) => {
    if (!Array.isArray(apiData)) {
      console.error("formatDataForLineChart esperaba un array, pero recibió:", apiData);
      return { labels: [], data: [] };
    }
    const labels = apiData.map(item => item.dia);
    const data = apiData.map(item => item.total_citas);
    return { labels, data };
  }

  // 👇 FUNCIÓN NUEVA: Cargar el combo de especialidades
  const cargarEspecialidades = async () => {
    try {
      console.log("Cargando lista de especialidades...");
      const data = await getEspecialidadesApi();
      // Asignamos la respuesta real de la API a nuestra variable reactiva
      listaEspecialidades.value = data;
    } catch (error) {
      console.error("Error cargando especialidades", error);
      errorMessage.value = "No se pudo cargar la lista de especialidades.";
    }
  }

  // --- LÓGICA PRINCIPAL ---
  const handleGenerarReporte = async (filtrosFechas) => {
    // 1. Combinamos las fechas con la especialidad seleccionada
    const filtrosCompletos = {
      ...filtrosFechas,
      idEspecialidad: especialidadSeleccionada.value || null
    };

    console.log("Generando reportes con:", filtrosCompletos);
    
    loading.value = true;
    errorMessage.value = '';
    
    // Limpiamos gráficos antes de cargar
    barChartData.value = { ...barChartData.value, labels: [], datasets: [{ ...barChartData.value.datasets[0], data: [] }] };
    lineChartData.value = { ...lineChartData.value, labels: [], datasets: [{ ...lineChartData.value.datasets[0], data: [] }] };

    try {
      // 2. Llamamos a las APIs de reportes
      const [dataEspecialidad, dataDiaria] = await Promise.all([
        getReporteCitasPorEspecialidadApi(filtrosCompletos),
        getReporteCitasDiariasApi(filtrosCompletos)
      ]);
      
      // 3. Actualizamos Gráfico de Barras
      const { labels: barLabels, data: barData } = formatDataForChart(dataEspecialidad);
      barChartData.value = {
        ...barChartData.value,
        labels: barLabels,
        datasets: [{ ...barChartData.value.datasets[0], data: barData }]
      };

      // 4. Actualizamos Gráfico de Líneas
      const { labels: lineLabels, data: lineData } = formatDataForLineChart(dataDiaria);
      lineChartData.value = {
        ...lineChartData.value,
        labels: lineLabels,
        datasets: [{ ...lineChartData.value.datasets[0], data: lineData }]
      };
      
    } catch (error) {
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

  // --- FUNCIONES DE EXPORTACIÓN ---

  const exportToPDF = () => {
    console.log("Exportando a PDF...");
    const doc = new jsPDF();
    
    doc.text("Reporte de Citas", 14, 16);
    
    // Tabla 1
    if (barChartData.value.labels.length > 0) {
      autoTable(doc, { 
        startY: 30,
        head: [['Personal Médico', 'Total Citas']],
        body: barChartData.value.labels.map((label, index) => [
          label,
          barChartData.value.datasets[0].data[index]
        ]),
        didDrawPage: (data) => {
          doc.text("Citas por Personal Médico", data.settings.margin.left, data.settings.startY - 5);
        }
      });
    } else {
      autoTable(doc, { 
        startY: 30,
        head: [['Citas por Personal Médico']],
        body: [['No hay datos para mostrar']],
      });
    }

    // Tabla 2
    if (lineChartData.value.labels.length > 0) {
      autoTable(doc, { 
        startY: doc.lastAutoTable.finalY + 15,
        head: [['Día', 'Total Citas']],
        body: lineChartData.value.labels.map((label, index) => [
          label,
          lineChartData.value.datasets[0].data[index]
        ]),
        didDrawPage: (data) => {
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

  const exportToExcel = () => {
    console.log("Exportando a Excel...");
    
    const dataEspecialidad = barChartData.value.labels.map((label, index) => ({
      'Personal Médico': label,
      'Total Citas': barChartData.value.datasets[0].data[index]
    }));
    
    const dataDiaria = lineChartData.value.labels.map((label, index) => ({
      Dia: label,
      'Total Citas': lineChartData.value.datasets[0].data[index]
    }));

    const wb = XLSX.utils.book_new();
    const wsEspecialidad = XLSX.utils.json_to_sheet(dataEspecialidad.length > 0 ? dataEspecialidad : [{ "Reporte": "No hay datos de especialidad" }]);
    const wsDiaria = XLSX.utils.json_to_sheet(dataDiaria.length > 0 ? dataDiaria : [{ "Reporte": "No hay datos de citas diarias" }]);

    XLSX.utils.book_append_sheet(wb, wsEspecialidad, "Citas por Especialidad");
    XLSX.utils.book_append_sheet(wb, wsDiaria, "Citas Diarias");

    XLSX.writeFile(wb, "reporte_citas.xlsx");
  }

  // --- CICLO DE VIDA ---
  onMounted(() => {
    cargarEspecialidades(); // <-- ¡Aquí cargamos la lista al entrar!
  });
  </script>

  <style scoped>
  </style>