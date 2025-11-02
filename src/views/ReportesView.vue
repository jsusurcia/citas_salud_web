<template>
    <LayoutComponent>
        <!-- Título -->
        <h1 class="mb-4 text-2xl font-bold text-gray-700">Reportes</h1>
        
        <!-- Mensaje de error -->
        <div v-if="errorMessage" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {{ errorMessage }}
        </div>
        
        <!-- Loader -->
        <div v-if="loading" class="flex justify-center items-center py-12">
            <LoaderComponent />
        </div>
        
        <!-- Contenido de reportes -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Card de ejemplo -->
            <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 class="text-lg font-semibold text-gray-700 mb-2">Reporte de Citas</h3>
                <p class="text-sm text-gray-600 mb-4">Vista general de todas las citas del sistema</p>
                <ButtonComponent 
                    type="button" 
                    variant="primary" 
                    size="medium" 
                    label="Ver Reporte" 
                    @click="handleVerReporte('citas')" />
            </div>
            
            <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 class="text-lg font-semibold text-gray-700 mb-2">Reporte de Personal Médico</h3>
                <p class="text-sm text-gray-600 mb-4">Estadísticas del personal médico activo</p>
                <ButtonComponent 
                    type="button" 
                    variant="primary" 
                    size="medium" 
                    label="Ver Reporte" 
                    @click="handleVerReporte('personal')" />
            </div>
            
            <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 class="text-lg font-semibold text-gray-700 mb-2">Reporte de Especialidades</h3>
                <p class="text-sm text-gray-600 mb-4">Distribución de especialidades médicas</p>
                <ButtonComponent 
                    type="button" 
                    variant="primary" 
                    size="medium" 
                    label="Ver Reporte" 
                    @click="handleVerReporte('especialidades')" />
            </div>
        </div>
        
        <!-- Mensaje cuando no hay reportes disponibles -->
        <div v-if="!loading && reportes.length === 0" class="text-center py-12 text-gray-500">
            <p>No hay reportes disponibles en este momento</p>
        </div>
    </LayoutComponent>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LayoutComponent from '../components/LayoutComponent.vue'
import ButtonComponent from '../components/ButtonComponent.vue'
import LoaderComponent from '../components/LoaderComponent.vue'

const reportes = ref([])
const loading = ref(false)
const errorMessage = ref('')

// Función para ver reportes
const handleVerReporte = (tipo) => {
    console.log(`📊 Ver reporte de: ${tipo}`)
    // Aquí puedes implementar la lógica para mostrar el reporte específico
    alert(`Reporte de ${tipo} - Funcionalidad en desarrollo`)
}

// Cargar reportes al montar el componente
onMounted(() => {
    console.log('📊 Cargando reportes...')
    // Aquí puedes cargar reportes del backend cuando tengas los endpoints
})
</script>

