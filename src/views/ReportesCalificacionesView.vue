<template>
    <LayoutComponent>
        <!-- Header -->
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-800">Generación de Reportes de Pacientes</h1>
        </div>

        <!-- Filtros -->
        <FilterBarComponent @generar-reporte="handleGenerarReporte" />

        <!-- Loader -->
        <div v-if="loading" class="flex flex-col justify-center items-center py-12">
            <LoaderComponent />
            <p class="text-gray-600 mt-4 animate-pulse">Generando reporte...</p>
        </div>

        <!-- Mensaje de Error -->
        <div v-if="errorMessage" class="mb-4 p-4 bg-red-100 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
            <i class="fas fa-exclamation-circle text-red-500 text-xl mt-0.5"></i>
            <div>
                <h3 class="font-semibold text-red-800">Error al cargar el reporte</h3>
                <p class="text-red-700 text-sm mt-1">{{ errorMessage }}</p>
            </div>
        </div>

        <!-- Contenido del Reporte -->
        <div v-if="!loading && reporteData" class="space-y-6">
            <!-- KPIs -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- KPI 1: Calificación Promedio -->
                <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                    <div class="flex items-center justify-center mb-4">
                        <div class="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-star text-teal-600 text-xl"></i>
                        </div>
                    </div>
                    <div class="text-center">
                        <p class="text-sm text-gray-600 mb-2">Calificación Promedio</p>
                        <p class="text-3xl font-bold text-gray-900">{{ reporteData.calificacion_promedio }} <span class="text-lg text-gray-500">/ 5</span></p>
                    </div>
                </div>

                <!-- KPI 2: Total de Reseñas -->
                <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                    <div class="flex items-center justify-center mb-4">
                        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-comments text-blue-600 text-xl"></i>
                        </div>
                    </div>
                    <div class="text-center">
                        <p class="text-sm text-gray-600 mb-2">Total de Reseñas</p>
                        <p class="text-3xl font-bold text-gray-900">{{ reporteData.total_resenas.toLocaleString() }}</p>
                    </div>
                </div>

                <!-- KPI 3: Reseñas 5 Estrellas -->
                <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                    <div class="flex items-center justify-center mb-4">
                        <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-medal text-yellow-600 text-xl"></i>
                        </div>
                    </div>
                    <div class="text-center">
                        <p class="text-sm text-gray-600 mb-2">Reseñas de 5 Estrellas</p>
                        <p class="text-3xl font-bold text-gray-900">{{ reporteData.resenas_5_estrellas.toLocaleString() }}</p>
                    </div>
                </div>

                <!-- KPI 4: Reseñas Recientes -->
                <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                    <div class="flex items-center justify-center mb-4">
                        <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-clock text-purple-600 text-xl"></i>
                        </div>
                    </div>
                    <div class="text-center">
                        <p class="text-sm text-gray-600 mb-2">Reseñas Recientes</p>
                        <p class="text-3xl font-bold text-gray-900">{{ reporteData.resenas_recientes }}</p>
                    </div>
                </div>
            </div>

            <!-- Gráficos -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Gráfico 1: Distribución -->
                <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                    <div class="mb-6">
                        <h3 class="text-lg font-bold text-gray-900">Distribución de Calificaciones</h3>
                        <p class="text-sm text-gray-600">Calificaciones de pacientes por estrellas.</p>
                    </div>
                    <canvas ref="chartDistribucion" class="w-full"></canvas>
                </div>

                <!-- Gráfico 2: Tendencia -->
                <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                    <div class="mb-6">
                        <h3 class="text-lg font-bold text-gray-900">Tendencia de Calificaciones</h3>
                        <p class="text-sm text-gray-600">Calificación promedio a lo largo del tiempo.</p>
                    </div>
                    <canvas ref="chartTendencia" class="w-full"></canvas>
                </div>
            </div>

            <!-- Comentarios Recientes -->
            <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div class="mb-6">
                    <h3 class="text-lg font-bold text-gray-900">Comentarios Recientes de Pacientes</h3>
                    <p class="text-sm text-gray-600">Últimas reseñas de los pacientes.</p>
                </div>
                
                <div v-if="reporteData.comentarios_recientes && reporteData.comentarios_recientes.length > 0" class="space-y-4">
                    <div 
                        v-for="comentario in reporteData.comentarios_recientes" 
                        :key="comentario.id_calificacion"
                        class="pb-4 border-b border-gray-100 last:border-0"
                    >
                        <div class="flex justify-between items-start mb-2">
                            <h4 class="font-bold text-gray-900">{{ comentario.nombre_paciente }}</h4>
                            <div class="flex items-center gap-1">
                                <i 
                                    v-for="n in 5" 
                                    :key="n"
                                    class="fas fa-star text-sm"
                                    :class="n <= comentario.puntuacion ? 'text-yellow-400' : 'text-gray-300'"
                                ></i>
                            </div>
                        </div>
                        <p class="text-gray-700 text-sm mb-2">{{ comentario.comentario || 'Sin comentario escrito' }}</p>
                        <p class="text-xs text-gray-500">{{ formatearFecha(comentario.fecha) }}</p>
                    </div>
                </div>

                <div v-else class="text-center py-12 text-gray-400">
                    <i class="fas fa-inbox text-5xl mb-3"></i>
                    <p class="text-lg">No hay comentarios disponibles para el período seleccionado</p>
                </div>

                <!-- Botones de Exportación -->
                <div class="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                    <button 
                        @click="exportarPDF"
                        class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        <i class="fas fa-file-pdf text-red-500"></i>
                        Exportar PDF
                    </button>
                    <button 
                        @click="exportarExcel"
                        class="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2"
                    >
                        <i class="fas fa-file-excel"></i>
                        Exportar Excel
                    </button>
                </div>
            </div>
        </div>

        <!-- Sin datos -->
        <div v-if="!loading && !reporteData" class="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <i class="fas fa-chart-bar text-6xl text-gray-300 mb-4"></i>
            <p class="text-lg text-gray-600 font-medium">Selecciona un rango de fechas</p>
            <p class="text-sm text-gray-500 mt-2">y haz clic en "Generar Informe" para ver los resultados</p>
        </div>
    </LayoutComponent>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import LayoutComponent from '../components/LayoutComponent.vue'
import FilterBarComponent from '../components/FilterBarComponent.vue'
import LoaderComponent from '../components/LoaderComponent.vue'
import { getReporteCalificacionesApi } from '../api/reportes.js'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

Chart.register(...registerables)

const loading = ref(false)
const errorMessage = ref('')
const reporteData = ref(null)
const chartDistribucion = ref(null)
const chartTendencia = ref(null)
let chartDistribucionInstance = null
let chartTendenciaInstance = null

const handleGenerarReporte = async (filtros) => {
    console.log('🔍 Filtros recibidos:', filtros)
    loading.value = true
    errorMessage.value = ''
    reporteData.value = null

    try {
        const filtrosAdaptados = {
            fechaInicio: filtros.fechaInicio,
            fechaFin: filtros.fechaFin,
            tipoResumen: 'todas'
        }
        
        const data = await getReporteCalificacionesApi(filtrosAdaptados)
        console.log('✅ Datos recibidos:', data)
        
        reporteData.value = data
        await nextTick()
        crearGraficos()
    } catch (error) {
        console.error('❌ Error:', error)
        errorMessage.value = error.detail || 'Error al generar el reporte'
    } finally {
        loading.value = false
    }
}

const crearGraficos = () => {
    if (chartDistribucionInstance) chartDistribucionInstance.destroy()
    if (chartTendenciaInstance) chartTendenciaInstance.destroy()

    // Gráfico de Distribución (estilo tu diseño)
    if (chartDistribucion.value) {
        const ctx = chartDistribucion.value.getContext('2d')
        chartDistribucionInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['1 Estrella', '2 Estrellas', '3 Estrellas', '4 Estrellas', '5 Estrellas'],
                datasets: [{
                    label: 'Número de Reseñas',
                    data: reporteData.value.distribucion,
                    backgroundColor: '#14b8a6',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: true, position: 'bottom' },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { precision: 0 },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        })
    }

    // Gráfico de Tendencia (estilo tu diseño)
    if (chartTendencia.value) {
        const ctx = chartTendencia.value.getContext('2d')
        chartTendenciaInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: reporteData.value.tendencia.labels,
                datasets: [{
                    label: 'Calificación Promedio',
                    data: reporteData.value.tendencia.data,
                    borderColor: '#14b8a6',
                    backgroundColor: 'rgba(20, 184, 166, 0.1)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: '#14b8a6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: true, position: 'bottom' },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5,
                        ticks: { stepSize: 1 },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        })
    }
}

const calcularPorcentaje = (parte, total) => {
    if (total === 0) return 0
    return ((parte / total) * 100).toFixed(1)
}

const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
    })
}

const exportarPDF = () => {
    const doc = new jsPDF()
    doc.text('Reporte de Calificaciones de Pacientes', 14, 20)
    autoTable(doc, {
        startY: 30,
        head: [['Métrica', 'Valor']],
        body: [
            ['Calificación Promedio', `${reporteData.value.calificacion_promedio} / 5.0`],
            ['Total de Reseñas', reporteData.value.total_resenas],
            ['5 Estrellas', reporteData.value.resenas_5_estrellas],
            ['Recientes', reporteData.value.resenas_recientes]
        ]
    })
    doc.save('reporte_calificaciones.pdf')
}

const exportarExcel = () => {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet([
        { Métrica: 'Promedio', Valor: reporteData.value.calificacion_promedio },
        { Métrica: 'Total', Valor: reporteData.value.total_resenas },
        { Métrica: '5 Estrellas', Valor: reporteData.value.resenas_5_estrellas }
    ])
    XLSX.utils.book_append_sheet(wb, ws, 'Resumen')
    XLSX.writeFile(wb, 'reporte_calificaciones.xlsx')
}
</script>

<style scoped>
canvas {
    max-height: 300px;
}
</style>