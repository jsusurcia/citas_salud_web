<template>
    <LayoutComponent>
        <h1 class="mb-4 text-2xl font-bold text-gray-700">Gestión de tus citas</h1>

        <div v-if="errorMessage" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {{ errorMessage }}
        </div>

        <div v-if="loading" class="flex justify-center items-center py-12">
            <LoaderComponent />
        </div>

        <div v-else class="mb-8">
            <DoctorCalendarCitaComponent 
                :citas="citas" 
                @refresh="loadCitas" />
        </div>

        <div v-if="!loading && citasPendientes.length > 0">
            <h2 class="text-xl font-semibold text-gray-700 mb-4">Pendientes de aprobación</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div 
                    v-for="cita in citasPendientes" 
                    :key="cita.id_cita"
                    class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    
                    <div class="mb-3 flex items-center justify-between">
                        <div class="text-sm text-gray-500">
                            <i class="fa-solid fa-clock mr-1"></i>
                            {{ formatFechaHora(cita.fecha, cita.hora_inicio) }}
                        </div>
                        <span 
                            :class="getEstadoClass(cita.estado_cita)">
                            {{ getEstadoLabel(cita.estado_cita) }}
                        </span>
                    </div>
                    
                    <div class="mb-3">
                        <p class="font-semibold text-gray-800">{{ getNombrePaciente(cita) }}</p>
                    </div>
                    
                    <div class="text-sm text-gray-600 mb-4">
                        <p>{{ cita.nombre_especialidad || 'Medicina General' }} - {{ getTipoAtencionLabel(cita) }}</p>
                    </div>
                    
                    <div v-if="cita.estado_cita?.toLowerCase() === 'pendiente'" class="flex gap-2">
                        <ButtonComponent 
                            type="button" 
                            variant="primary" 
                            size="medium" 
                            icon="fa-solid fa-check" 
                            label="Aprobar"
                            @click="handleAprobar(cita)" />
                        <ButtonComponent 
                            type="button" 
                            variant="danger" 
                            size="medium" 
                            icon="fa-solid fa-xmark" 
                            label="Rechazar"
                            @click="handleRechazar(cita)" />
                    </div>
                </div>
            </div>
        </div>

        <div v-else-if="!loading && citasPendientes.length === 0 && citas.length > 0" class="text-center py-6 text-gray-500">
            <p>No hay citas pendientes de aprobación</p>
        </div>
        <div v-else-if="!loading" class="text-center py-12 text-gray-500">
            <p>No hay citas programadas</p>
        </div>
    </LayoutComponent>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LayoutComponent from '../components/LayoutComponent.vue'
import DoctorCalendarCitaComponent from '../components/DoctorCalendarCitaComponent.vue' 
import ButtonComponent from '../components/ButtonComponent.vue'
import LoaderComponent from '../components/LoaderComponent.vue'
// Ya no necesitamos 'useAuthStore' aquí, el backend lo hace
import { 
    getCitasCalendarioApi,  // <-- Función nueva
    getCitasPendientesApi, // <-- Función nueva
    aprobarCitaApi, 
    rechazarCitaApi 
} from '../api/citas'

const citas = ref([]) // Citas para el CALENDARIO
const citasPendientes = ref([]) // Citas para las TARJETAS
const loading = ref(false)
const errorMessage = ref('')

const loadCitas = async () => {
    loading.value = true
    errorMessage.value = ''
    
    try {
        console.log('🔄 Cargando citas (Calendario y Pendientes)...')
        
        // --- LÓGICA DE CARGA ACTUALIZADA ---
        // Hacemos las dos llamadas a la API en paralelo
        const [dataCalendario, dataPendientes] = await Promise.all([
            getCitasCalendarioApi(),
            getCitasPendientesApi()
        ]);

        citas.value = dataCalendario;
        citasPendientes.value = dataPendientes;
        // --- FIN DE LA ACTUALIZACIÓN ---
        
        console.log('✅ Citas cargadas para el calendario:', citas.value.length)
        console.log('✅ Citas pendientes cargadas:', citasPendientes.value.length)

    } catch (error) {
        console.error('❌ Error al cargar citas:', error)
        errorMessage.value = error.detail || error.message || 'Error al cargar las citas'
    } finally {
        loading.value = false
    }
}

// === Funciones de Lógica para los Botones ===

const handleAprobar = async (cita) => {
    try {
        await aprobarCitaApi(cita.id_cita)
        await loadCitas() // Recarga la lista
    } catch (error) {
        errorMessage.value = error.detail || 'Error al aprobar la cita'
    }
}

const handleRechazar = async (cita) => {
    if (!confirm('¿Estás seguro de que deseas rechazar esta cita?')) {
        return
    }
    try {
        await rechazarCitaApi(cita.id_cita)
        await loadCitas() // Recarga la lista
    } catch (error) {
        errorMessage.value = error.detail || 'Error al rechazar la cita'
    }
}

// === Funciones de Formateo de Texto (Helpers) ===

// MODIFICADA: Ahora recibe fecha y hora_inicio por separado
const formatFechaHora = (fechaStr, horaStr) => {
    if (!fechaStr || !horaStr) return '--:--'
    try {
        // Combinamos la fecha (YYYY-MM-DD) y la hora (HH:MM:SS)
        const fecha = new Date(`${fechaStr}T${horaStr}`)
        
        const dia = fecha.getDate().toString().padStart(2, '0')
        const mes = fecha.toLocaleString('es-ES', { month: 'short' })
        const hora = fecha.getHours().toString().padStart(2, '0')
        const minutos = fecha.getMinutes().toString().padStart(2, '0')
        const diaSemana = fecha.toLocaleString('es-ES', { weekday: 'short' })
        
        return `${hora}:${minutos} ${diaSemana}, ${dia} ${mes}`
    } catch (e) { return `${fechaStr} ${horaStr}` }
}

// MODIFICADA: Lee los nuevos campos del schema CitaConDetalles
const getNombrePaciente = (cita) => {
    return `${cita.nombre_paciente || ''} ${cita.apellido_paciente || ''}`.trim() || 'Paciente desconocido'
}

const getTipoAtencionLabel = (cita) => {
    return cita.direccion_domicilio ? 'Visita domiciliaria' : 'En consultorio'
}

const getEstadoLabel = (estado) => {
    if (!estado) return 'Desconocido'
    const estadoLower = estado.toLowerCase()
    const estados = {
        'pendiente': 'Pendiente', 'confirmada': 'Confirmada', 'cancelada': 'Cancelada',
        'atendida': 'Atendida', 'en_viaje': 'En viaje'
    }
    return estados[estadoLower] || estado
}

const getEstadoClass = (estado) => {
    const estadoLower = estado?.toLowerCase() || ''
    const baseClass = "px-2 py-1 rounded-full text-xs font-medium"
    const classes = {
        'pendiente': 'bg-orange-100 text-orange-800', 'cancelada': 'bg-red-100 text-red-800',
        'confirmada': 'bg-green-100 text-green-800', 'atendida': 'bg-gray-100 text-gray-800',
        'en_viaje': 'bg-blue-100 text-blue-800'
    }
    return `${baseClass} ${classes[estadoLower] || 'bg-gray-100 text-gray-800'}`
}

// Carga las citas cuando el componente se monta
onMounted(() => {
    loadCitas()
})
</script>