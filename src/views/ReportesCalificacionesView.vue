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
                    <div class="mb-4">
                        <h3 class="text-lg font-bold text-gray-900">Distribución de Calificaciones</h3>
                        <p class="text-sm text-gray-600">Calificaciones de pacientes por estrellas.</p>
                    </div>
                    <div style="height: 350px; width: 100%;">
                        <canvas ref="chartDistribucion"></canvas>
                    </div>
                </div>

                <!-- Gráfico 2: Tendencia -->
                <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                    <div class="mb-4">
                        <h3 class="text-lg font-bold text-gray-900">Tendencia de Calificaciones</h3>
                        <p class="text-sm text-gray-600">Calificación promedio a lo largo del tiempo.</p>
                    </div>
                    <div style="height: 350px; width: 100%;">
                        <canvas ref="chartTendencia"></canvas>
                    </div>
                </div>
            </div>

            <!-- Comentarios Recientes -->
            <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div class="mb-6">
                    <h3 class="text-lg font-bold text-gray-900">Comentarios Recientes de Pacientes</h3>
                    <p class="text-sm text-gray-600">Últimas reseñas de los pacientes (últimos 30 días).</p>
                </div>
                
                
                <div v-if="reporteData.comentarios_recientes?.length > 0" class="space-y-4">
                    <div 
                        v-for="(comentario, index) in reporteData.comentarios_recientes" 
                        :key="comentario.id_calificacion || index"
                        class="pb-4 border-b border-gray-100 last:border-0"
                    >
                        <div class="flex justify-between items-start mb-2">
                            <h4 class="font-bold text-gray-900">{{ comentario.nombre_paciente || 'Paciente Anónimo' }}</h4>
                            <div class="flex items-center gap-1">
                                <i 
                                    v-for="n in 5" 
                                    :key="n"
                                    class="fas fa-star text-sm"
                                    :class="n <= (comentario.puntuacion || 0) ? 'text-yellow-400' : 'text-gray-300'"
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
        
        // 🔥 FIX CRÍTICO: Esperar a que Vue renderice el DOM + tiempo extra
        await nextTick()
        
        // Esperar un tick adicional para asegurar que los canvas existan
        setTimeout(() => {
            crearGraficos()
        }, 100)
        
        console.log('✅ Reporte renderizado correctamente')
    } catch (error) {
        console.error('❌ Error completo:', error)
        errorMessage.value = error.detail || error.message || 'Error al generar el reporte'
    } finally {
        loading.value = false
    }
}

const crearGraficos = () => {
    console.log('📊 Intentando crear gráficos...')
    console.log('   - chartDistribucion.value:', chartDistribucion.value ? '✅ Existe' : '❌ No existe')
    console.log('   - chartTendencia.value:', chartTendencia.value ? '✅ Existe' : '❌ No existe')
    console.log('   - reporteData.value:', reporteData.value)
    
    // Destruir gráficos previos
    if (chartDistribucionInstance) {
        console.log('🗑️ Destruyendo gráfico de distribución anterior')
        chartDistribucionInstance.destroy()
        chartDistribucionInstance = null
    }
    if (chartTendenciaInstance) {
        console.log('🗑️ Destruyendo gráfico de tendencia anterior')
        chartTendenciaInstance.destroy()
        chartTendenciaInstance = null
    }

    if (!reporteData.value) {
        console.error('❌ No hay datos de reporte disponibles')
        return
    }

    console.log('   - Distribución data:', reporteData.value.distribucion)
    console.log('   - Tendencia labels:', reporteData.value.tendencia?.labels)
    console.log('   - Tendencia data:', reporteData.value.tendencia?.data)

    // Gráfico de Distribución
    if (chartDistribucion.value) {
        try {
            const distribucionData = reporteData.value.distribucion || [0, 0, 0, 0, 0]
            console.log('📊 Creando gráfico de distribución con data:', distribucionData)
            
            const ctx = chartDistribucion.value.getContext('2d')
            chartDistribucionInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['1 Estrella', '2 Estrellas', '3 Estrellas', '4 Estrellas', '5 Estrellas'],
                    datasets: [{
                        label: 'Número de Reseñas',
                        data: distribucionData,
                        backgroundColor: [
                            '#ef4444',  // Rojo para 1 estrella
                            '#f97316',  // Naranja para 2 estrellas
                            '#eab308',  // Amarillo para 3 estrellas
                            '#84cc16',  // Lima para 4 estrellas
                            '#22c55e'   // Verde para 5 estrellas
                        ],
                        borderRadius: 8,
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            padding: 16,
                            titleFont: { size: 14, weight: 'bold' },
                            bodyFont: { size: 13 },
                            displayColors: true,
                            callbacks: {
                                label: function(context) {
                                    return 'Reseñas: ' + context.parsed.y
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { 
                                precision: 0,
                                font: { size: 13 },
                                stepSize: 1,
                                color: '#4b5563'
                            },
                            grid: { 
                                color: 'rgba(0, 0, 0, 0.06)',
                                drawBorder: false
                            },
                            border: { display: false }
                        },
                        x: {
                            ticks: { 
                                font: { size: 12 },
                                color: '#4b5563'
                            },
                            grid: { display: false },
                            border: { display: false }
                        }
                    },
                    layout: {
                        padding: {
                            top: 20,
                            bottom: 10,
                            left: 10,
                            right: 10
                        }
                    }
                }
            })
            console.log('✅ Gráfico de distribución creado exitosamente')
        } catch (error) {
            console.error('❌ Error al crear gráfico de distribución:', error)
        }
    } else {
        console.warn('⚠️ Elemento canvas de distribución no existe en el DOM')
    }

    // Gráfico de Tendencia
    if (chartTendencia.value) {
        try {
            const tendencia = reporteData.value.tendencia || { labels: [], data: [] }
            console.log('📈 Creando gráfico de tendencia con labels:', tendencia.labels, 'data:', tendencia.data)
            
            const ctx = chartTendencia.value.getContext('2d')
            chartTendenciaInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: tendencia.labels,
                    datasets: [{
                        label: 'Calificación Promedio',
                        data: tendencia.data,
                        borderColor: '#14b8a6',
                        backgroundColor: 'rgba(20, 184, 166, 0.15)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 6,
                        pointBackgroundColor: '#14b8a6',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 3,
                        pointHoverRadius: 8,
                        pointHoverBackgroundColor: '#0d9488',
                        pointHoverBorderWidth: 3,
                        borderWidth: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            padding: 16,
                            titleFont: { size: 14, weight: 'bold' },
                            bodyFont: { size: 13 },
                            displayColors: true,
                            callbacks: {
                                label: (context) => {
                                    return `Promedio: ${context.parsed.y.toFixed(1)} ⭐`
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
                                font: { size: 13 },
                                color: '#4b5563',
                                callback: function(value) {
                                    return value + ' ⭐'
                                }
                            },
                            grid: { 
                                color: 'rgba(0, 0, 0, 0.06)',
                                drawBorder: false
                            },
                            border: { display: false }
                        },
                        x: {
                            ticks: { 
                                font: { size: 12 },
                                color: '#4b5563'
                            },
                            grid: { display: false },
                            border: { display: false }
                        }
                    },
                    layout: {
                        padding: {
                            top: 20,
                            bottom: 10,
                            left: 10,
                            right: 10
                        }
                    }
                }
            })
            console.log('✅ Gráfico de tendencia creado exitosamente')
        } catch (error) {
            console.error('❌ Error al crear gráfico de tendencia:', error)
        }
    } else {
        console.warn('⚠️ Elemento canvas de tendencia no existe en el DOM')
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
    let yPosition = 20
    
    // ========== ENCABEZADO ==========
    doc.setFontSize(20)
    doc.setTextColor(20, 184, 166)
    doc.text('Reporte de Calificaciones de Pacientes', 14, yPosition)
    
    yPosition += 8
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    const fechaCompleta = new Date().toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    })
    doc.text(`Generado el: ${fechaCompleta}`, 14, yPosition)
    
    doc.setLineWidth(0.5)
    doc.setDrawColor(200, 200, 200)
    doc.line(14, yPosition + 3, 196, yPosition + 3)
    
    yPosition += 10
    
    // ========== TABLA DE KPIs ==========
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('Resumen General', 14, yPosition)
    yPosition += 5
    
    autoTable(doc, {
        startY: yPosition,
        head: [['Métrica', 'Valor']],
        body: [
            ['Calificación Promedio', `${reporteData.value.calificacion_promedio?.toFixed(1) || '0.0'} / 5.0`],
            ['Total de Reseñas', reporteData.value.total_resenas || 0],
            ['Reseñas de 5 Estrellas', reporteData.value.resenas_5_estrellas || 0],
            ['Reseñas Recientes (últimos 7 días)', reporteData.value.resenas_recientes || 0]
        ],
        theme: 'striped',
        headStyles: { 
            fillColor: [20, 184, 166],
            fontSize: 11,
            fontStyle: 'bold',
            halign: 'left'
        },
        bodyStyles: {
            fontSize: 10,
            textColor: [60, 60, 60]
        },
        columnStyles: {
            0: { cellWidth: 80, fontStyle: 'bold' },
            1: { cellWidth: 'auto', halign: 'right' }
        },
        margin: { left: 14, right: 14 }
    })
    
    yPosition = doc.lastAutoTable.finalY + 12
    
    // ========== DISTRIBUCIÓN POR ESTRELLAS ==========
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('Distribución de Calificaciones', 14, yPosition)
    yPosition += 5
    
    if (reporteData.value.distribucion) {
        const distribucionBody = [
            ['1 Estrella', reporteData.value.distribucion[0] || 0],
            ['2 Estrellas', reporteData.value.distribucion[1] || 0],
            ['3 Estrellas', reporteData.value.distribucion[2] || 0],
            ['4 Estrellas', reporteData.value.distribucion[3] || 0],
            ['5 Estrellas', reporteData.value.distribucion[4] || 0]
        ]
        
        autoTable(doc, {
            startY: yPosition,
            head: [['Calificación', 'Cantidad']],
            body: distribucionBody,
            theme: 'grid',
            headStyles: { 
                fillColor: [245, 158, 11],
                fontSize: 11,
                fontStyle: 'bold',
                halign: 'left'
            },
            bodyStyles: {
                fontSize: 10,
                textColor: [60, 60, 60]
            },
            columnStyles: {
                0: { cellWidth: 80, fontStyle: 'bold' },
                1: { cellWidth: 'auto', halign: 'right' }
            },
            margin: { left: 14, right: 14 }
        })
        
        yPosition = doc.lastAutoTable.finalY + 12
    }
    
    // ========== COMENTARIOS RECIENTES ==========
    if (reporteData.value.comentarios_recientes && reporteData.value.comentarios_recientes.length > 0) {
        
        // Verificar si necesitamos una nueva página
        if (yPosition > 240) {
            doc.addPage()
            yPosition = 20
        }
        
        doc.setFontSize(14)
        doc.setTextColor(0, 0, 0)
        doc.text('Comentarios Recientes de Pacientes', 14, yPosition)
        yPosition += 5
        
        const comentariosBody = reporteData.value.comentarios_recientes.map(c => {
            const fecha = new Date(c.fecha).toLocaleDateString('es-ES')
            const comentario = c.comentario || 'Sin comentario'
            
            return [
                c.nombre_paciente || 'Paciente Anónimo',
                `${c.puntuacion || 0} estrellas`,
                comentario.length > 80 ? comentario.substring(0, 77) + '...' : comentario,
                fecha
            ]
        })
        
        autoTable(doc, {
            startY: yPosition,
            head: [['Paciente', 'Calificación', 'Comentario', 'Fecha']],
            body: comentariosBody,
            theme: 'striped',
            headStyles: { 
                fillColor: [139, 92, 246],
                fontSize: 10,
                fontStyle: 'bold',
                halign: 'left'
            },
            bodyStyles: {
                fontSize: 9,
                textColor: [60, 60, 60]
            },
            columnStyles: {
                0: { cellWidth: 40, fontStyle: 'bold' },
                1: { cellWidth: 25, halign: 'center' },
                2: { cellWidth: 80 },
                3: { cellWidth: 30, halign: 'center' }
            },
            margin: { left: 14, right: 14 },
            styles: {
                overflow: 'linebreak',
                cellPadding: 3
            }
        })
    } else {
        if (yPosition > 240) {
            doc.addPage()
            yPosition = 20
        }
        
        doc.setFontSize(14)
        doc.text('Comentarios Recientes de Pacientes', 14, yPosition)
        yPosition += 10
        
        doc.setFontSize(10)
        doc.setTextColor(150, 150, 150)
        doc.text('No hay comentarios disponibles para el período seleccionado', 14, yPosition)
    }
    
    // ========== PIE DE PÁGINA ==========
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(
            `Página ${i} de ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        )
    }
    
    // Guardar con nombre que incluye fecha
    const nombreArchivo = `reporte_calificaciones_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.pdf`
    doc.save(nombreArchivo)
    
    console.log('📄 PDF exportado exitosamente:')
    console.log('   - Archivo:', nombreArchivo)
    console.log('   - Páginas:', pageCount)
    console.log('   - Comentarios incluidos:', reporteData.value.comentarios_recientes?.length || 0)
}

const exportarExcel = () => {
    if (!reporteData.value) return
    
    const wb = XLSX.utils.book_new()
    
    // ========== HOJA 1: RESUMEN GENERAL ==========
    const fechaGeneracion = new Date().toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    })
    
    const wsResumen = XLSX.utils.aoa_to_sheet([
        ['REPORTE DE CALIFICACIONES DE PACIENTES'],
        [`Generado el: ${fechaGeneracion}`],
        [],
        ['RESUMEN GENERAL'],
        ['Métrica', 'Valor'],
        ['Calificación Promedio', `${reporteData.value.calificacion_promedio?.toFixed(1) || '0.0'} / 5.0`],
        ['Total de Reseñas', reporteData.value.total_resenas || 0],
        ['Reseñas de 5 Estrellas', reporteData.value.resenas_5_estrellas || 0],
        ['Reseñas Recientes (últimos 7 días)', reporteData.value.resenas_recientes || 0]
    ])
    
    wsResumen['!cols'] = [{ wch: 35 }, { wch: 20 }]
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen General')
    
    // ========== HOJA 2: DISTRIBUCIÓN POR ESTRELLAS ==========
    if (reporteData.value.distribucion) {
        const total = reporteData.value.total_resenas || 1
        
        const distribucionData = [
            ['DISTRIBUCIÓN DE CALIFICACIONES POR ESTRELLAS'],
            [],
            ['Calificación', 'Cantidad de Reseñas', 'Porcentaje'],
            ['1 Estrella', reporteData.value.distribucion[0] || 0, `${((reporteData.value.distribucion[0] || 0) / total * 100).toFixed(1)}%`],
            ['2 Estrellas', reporteData.value.distribucion[1] || 0, `${((reporteData.value.distribucion[1] || 0) / total * 100).toFixed(1)}%`],
            ['3 Estrellas', reporteData.value.distribucion[2] || 0, `${((reporteData.value.distribucion[2] || 0) / total * 100).toFixed(1)}%`],
            ['4 Estrellas', reporteData.value.distribucion[3] || 0, `${((reporteData.value.distribucion[3] || 0) / total * 100).toFixed(1)}%`],
            ['5 Estrellas', reporteData.value.distribucion[4] || 0, `${((reporteData.value.distribucion[4] || 0) / total * 100).toFixed(1)}%`],
            [],
            ['TOTAL', reporteData.value.total_resenas || 0, '100.0%']
        ]
        
        const wsDistribucion = XLSX.utils.aoa_to_sheet(distribucionData)
        wsDistribucion['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 15 }]
        XLSX.utils.book_append_sheet(wb, wsDistribucion, 'Distribución')
    }
    
    // ========== HOJA 3: TENDENCIA MENSUAL ==========
    if (reporteData.value.tendencia && reporteData.value.tendencia.labels.length > 0) {
        const tendenciaData = [
            ['TENDENCIA DE CALIFICACIONES'],
            [],
            ['Período', 'Calificación Promedio']
        ]
        
        reporteData.value.tendencia.labels.forEach((label, index) => {
            tendenciaData.push([
                label,
                reporteData.value.tendencia.data[index]?.toFixed(1) || '0.0'
            ])
        })
        
        const wsTendencia = XLSX.utils.aoa_to_sheet(tendenciaData)
        wsTendencia['!cols'] = [{ wch: 20 }, { wch: 25 }]
        XLSX.utils.book_append_sheet(wb, wsTendencia, 'Tendencia')
    }
    
    // ========== HOJA 4: COMENTARIOS DETALLADOS ==========
    if (reporteData.value.comentarios_recientes && reporteData.value.comentarios_recientes.length > 0) {
        const comentariosData = [
            ['COMENTARIOS RECIENTES DE PACIENTES'],
            [`Total de comentarios: ${reporteData.value.comentarios_recientes.length}`],
            [],
            ['No.', 'Paciente', 'Calificación', 'Comentario', 'Fecha']
        ]
        
        reporteData.value.comentarios_recientes.forEach((c, index) => {
            const fecha = new Date(c.fecha).toLocaleDateString('es-ES')
            
            comentariosData.push([
                index + 1,
                c.nombre_paciente || 'Paciente Anónimo',
                `${c.puntuacion || 0} estrellas`,
                c.comentario || 'Sin comentario',
                fecha
            ])
        })
        
        const wsComentarios = XLSX.utils.aoa_to_sheet(comentariosData)
        wsComentarios['!cols'] = [
            { wch: 5 },   // No.
            { wch: 35 },  // Paciente
            { wch: 15 },  // Calificación
            { wch: 60 },  // Comentario
            { wch: 15 }   // Fecha
        ]
        
        XLSX.utils.book_append_sheet(wb, wsComentarios, 'Comentarios')
    } else {
        const wsComentariosVacio = XLSX.utils.aoa_to_sheet([
            ['COMENTARIOS RECIENTES DE PACIENTES'],
            [],
            ['No hay comentarios disponibles para el período seleccionado']
        ])
        wsComentariosVacio['!cols'] = [{ wch: 60 }]
        XLSX.utils.book_append_sheet(wb, wsComentariosVacio, 'Comentarios')
    }
    
    // ========== HOJA 5: ESTADÍSTICAS ADICIONALES ==========
    const satisfaccion = reporteData.value.resenas_5_estrellas + (reporteData.value.distribucion?.[3] || 0)
    const insatisfaccion = (reporteData.value.distribucion?.[0] || 0) + (reporteData.value.distribucion?.[1] || 0)
    const total = reporteData.value.total_resenas || 1
    
    const estadisticas = [
        ['ESTADÍSTICAS ADICIONALES'],
        [],
        ['Métrica', 'Valor'],
        ['Promedio General', `${reporteData.value.calificacion_promedio?.toFixed(2) || '0.00'} estrellas`],
        ['Total de Evaluaciones', reporteData.value.total_resenas || 0],
        [],
        ['DESGLOSE POR CALIFICACIÓN'],
        ['Evaluaciones Excelentes (5 estrellas)', reporteData.value.resenas_5_estrellas || 0],
        ['Evaluaciones Buenas (4 estrellas)', reporteData.value.distribucion?.[3] || 0],
        ['Evaluaciones Regulares (3 estrellas)', reporteData.value.distribucion?.[2] || 0],
        ['Evaluaciones Malas (2 estrellas)', reporteData.value.distribucion?.[1] || 0],
        ['Evaluaciones Pésimas (1 estrella)', reporteData.value.distribucion?.[0] || 0],
        [],
        ['ÍNDICES DE SATISFACCIÓN'],
        ['Satisfacción (4-5 estrellas)', `${satisfaccion} (${(satisfaccion / total * 100).toFixed(1)}%)`],
        ['Insatisfacción (1-2 estrellas)', `${insatisfaccion} (${(insatisfaccion / total * 100).toFixed(1)}%)`],
        ['Neutral (3 estrellas)', `${reporteData.value.distribucion?.[2] || 0} (${((reporteData.value.distribucion?.[2] || 0) / total * 100).toFixed(1)}%)`]
    ]
    
    const wsEstadisticas = XLSX.utils.aoa_to_sheet(estadisticas)
    wsEstadisticas['!cols'] = [{ wch: 35 }, { wch: 30 }]
    XLSX.utils.book_append_sheet(wb, wsEstadisticas, 'Estadísticas')
    
    // Guardar archivo con nombre que incluye fecha
    const nombreArchivo = `reporte_calificaciones_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.xlsx`
    XLSX.writeFile(wb, nombreArchivo)
    
    console.log('📊 Excel exportado exitosamente:')
    console.log('   - Archivo:', nombreArchivo)
    console.log('   - Hojas:', wb.SheetNames.length)
    console.log('   - Comentarios incluidos:', reporteData.value.comentarios_recientes?.length || 0)
}
</script>

<style scoped>
/* Asegurar que los canvas se rendericen correctamente */
canvas {
    display: block !important;
    box-sizing: border-box !important;
}

/* Animaciones suaves */
.space-y-6 > * {
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>