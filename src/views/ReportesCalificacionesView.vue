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
                        <p class="text-3xl font-bold text-gray-900">
                            {{ reporteData.calificacion_promedio?.toFixed(1) || '0.0' }} 
                            <span class="text-lg text-gray-500">/ 5</span>
                        </p>
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
                        <p class="text-3xl font-bold text-gray-900">{{ (reporteData.total_resenas || 0).toLocaleString() }}</p>
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
                        <p class="text-3xl font-bold text-gray-900">{{ (reporteData.resenas_5_estrellas || 0).toLocaleString() }}</p>
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
                        <p class="text-sm text-gray-600 mb-2">Reseñas Recientes (7d)</p>
                        <p class="text-3xl font-bold text-gray-900">{{ reporteData.resenas_recientes || 0 }}</p>
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
        
        console.log('📡 Enviando a API:', filtrosAdaptados)
        const data = await getReporteCalificacionesApi(filtrosAdaptados)
        
        console.log('✅ Datos recibidos:', data)
        console.log('📊 Validación de estructura:')
        console.log('   - calificacion_promedio:', data.calificacion_promedio)
        console.log('   - total_resenas:', data.total_resenas)
        console.log('   - resenas_5_estrellas:', data.resenas_5_estrellas)
        console.log('   - resenas_recientes:', data.resenas_recientes)
        console.log('   - distribucion:', data.distribucion)
        console.log('   - tendencia:', data.tendencia)
        console.log('   - comentarios_recientes:', data.comentarios_recientes?.length || 0, 'comentarios')
        
        // Validación adicional
        if (!data.distribucion || !Array.isArray(data.distribucion)) {
            throw new Error('La distribución no es válida')
        }
        
        if (!data.tendencia || !data.tendencia.labels || !data.tendencia.data) {
            throw new Error('La tendencia no es válida')
        }
        
        reporteData.value = data
        
        await nextTick()
        crearGraficos()
        
        console.log('✅ Reporte renderizado correctamente')
    } catch (error) {
        console.error('❌ Error completo:', error)
        errorMessage.value = error.detail || error.message || 'Error al generar el reporte'
    } finally {
        loading.value = false
    }
}

const crearGraficos = () => {
    // Destruir gráficos previos
    if (chartDistribucionInstance) {
        chartDistribucionInstance.destroy()
        chartDistribucionInstance = null
    }
    if (chartTendenciaInstance) {
        chartTendenciaInstance.destroy()
        chartTendenciaInstance = null
    }

    console.log('📊 Creando gráficos...')
    console.log('   - Distribución:', reporteData.value.distribucion)
    console.log('   - Tendencia labels:', reporteData.value.tendencia.labels)
    console.log('   - Tendencia data:', reporteData.value.tendencia.data)

    // Gráfico de Distribución
    if (chartDistribucion.value && reporteData.value.distribucion) {
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
                    legend: { 
                        display: true, 
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: { size: 14 },
                        bodyFont: { size: 13 }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { 
                            precision: 0,
                            font: { size: 12 }
                        },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    },
                    x: {
                        ticks: { font: { size: 12 } },
                        grid: { display: false }
                    }
                }
            }
        })
        console.log('✅ Gráfico de distribución creado')
    } else {
        console.warn('⚠️ No se pudo crear el gráfico de distribución')
    }

    // Gráfico de Tendencia
    if (chartTendencia.value && reporteData.value.tendencia) {
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
                    legend: { 
                        display: true, 
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: { size: 14 },
                        bodyFont: { size: 13 },
                        callbacks: {
                            label: (context) => {
                                return `Promedio: ${context.parsed.y.toFixed(1)} estrellas`
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5,
                        ticks: { 
                            stepSize: 1,
                            font: { size: 12 }
                        },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    },
                    x: {
                        ticks: { font: { size: 12 } },
                        grid: { display: false }
                    }
                }
            }
        })
        console.log('✅ Gráfico de tendencia creado')
    } else {
        console.warn('⚠️ No se pudo crear el gráfico de tendencia')
    }
}

const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible'
    return new Date(fecha).toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
    })
}

const exportarPDF = () => {
    if (!reporteData.value) return
    
    const doc = new jsPDF()
    
    // Título
    doc.setFontSize(18)
    doc.text('Reporte de Calificaciones de Pacientes', 14, 20)
    
    // Fecha del reporte
    doc.setFontSize(10)
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 14, 28)
    
    // Tabla de KPIs
    autoTable(doc, {
        startY: 35,
        head: [['Métrica', 'Valor']],
        body: [
            ['Calificación Promedio', `${reporteData.value.calificacion_promedio?.toFixed(1) || '0.0'} / 5.0`],
            ['Total de Reseñas', reporteData.value.total_resenas || 0],
            ['Reseñas de 5 Estrellas', reporteData.value.resenas_5_estrellas || 0],
            ['Reseñas Recientes (7 días)', reporteData.value.resenas_recientes || 0]
        ],
        theme: 'grid',
        headStyles: { fillColor: [20, 184, 166] }
    })
    
    doc.save('reporte_calificaciones.pdf')
    console.log('📄 PDF exportado')
}

const exportarExcel = () => {
    if (!reporteData.value) return
    
    const wb = XLSX.utils.book_new()
    
    // Hoja 1: Resumen
    const wsResumen = XLSX.utils.json_to_sheet([
        { Métrica: 'Calificación Promedio', Valor: reporteData.value.calificacion_promedio?.toFixed(1) || '0.0' },
        { Métrica: 'Total de Reseñas', Valor: reporteData.value.total_resenas || 0 },
        { Métrica: 'Reseñas de 5 Estrellas', Valor: reporteData.value.resenas_5_estrellas || 0 },
        { Métrica: 'Reseñas Recientes (7 días)', Valor: reporteData.value.resenas_recientes || 0 }
    ])
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen')
    
    // Hoja 2: Distribución
    if (reporteData.value.distribucion) {
        const wsDistribucion = XLSX.utils.json_to_sheet([
            { Estrellas: '1 Estrella', Cantidad: reporteData.value.distribucion[0] },
            { Estrellas: '2 Estrellas', Cantidad: reporteData.value.distribucion[1] },
            { Estrellas: '3 Estrellas', Cantidad: reporteData.value.distribucion[2] },
            { Estrellas: '4 Estrellas', Cantidad: reporteData.value.distribucion[3] },
            { Estrellas: '5 Estrellas', Cantidad: reporteData.value.distribucion[4] }
        ])
        XLSX.utils.book_append_sheet(wb, wsDistribucion, 'Distribución')
    }
    
    // Hoja 3: Comentarios
    if (reporteData.value.comentarios_recientes?.length > 0) {
        const wsComentarios = XLSX.utils.json_to_sheet(
            reporteData.value.comentarios_recientes.map(c => ({
                Paciente: c.nombre_paciente,
                Puntuación: c.puntuacion,
                Comentario: c.comentario || 'Sin comentario',
                Fecha: c.fecha
            }))
        )
        XLSX.utils.book_append_sheet(wb, wsComentarios, 'Comentarios')
    }
    
    XLSX.writeFile(wb, 'reporte_calificaciones.xlsx')
    console.log('📊 Excel exportado')
}
</script>

<style scoped>
canvas {
    max-height: 300px;
}
</style>