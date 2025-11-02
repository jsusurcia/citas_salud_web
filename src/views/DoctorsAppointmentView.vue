<template>
    <LayoutComponent>
        <!-- Título -->
        <h1 class="mb-4 text-2xl font-bold text-gray-700">Gestión de tus citas</h1>

        <!-- Mensaje de error -->
        <div v-if="errorMessage" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {{ errorMessage }}
        </div>

        <!-- Loader -->
        <div v-if="loading" class="flex justify-center items-center py-12">
            <LoaderComponent />
        </div>

        <!-- Calendario Semanal con Citas -->
        <div v-else class="mb-8">
            <DoctorCalendarComponent 
                :citas="citas" 
                @refresh="loadCitas" />
        </div>

        <!-- Pendientes de Aprobación -->
        <div v-if="!loading && citasPendientes.length > 0">
            <h2 class="text-xl font-semibold text-gray-700 mb-4">Pendientes de aprobación</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div 
                    v-for="cita in citasPendientes" 
                    :key="cita.id"
                    class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div class="mb-3 flex items-center justify-between">
                        <div class="text-sm text-gray-500">
                            <i class="fa-solid fa-clock mr-1"></i>
                            {{ formatFechaHora(cita.fecha_hora) }}
                        </div>
                        <span 
                            :class="{
                                'bg-orange-100 text-orange-800': cita.estado?.toLowerCase() === 'pendiente',
                                'bg-red-100 text-red-800': cita.estado?.toLowerCase() === 'cancelada',
                                'bg-green-100 text-green-800': cita.estado?.toLowerCase() === 'confirmada',
                                'bg-blue-100 text-blue-800': cita.estado?.toLowerCase() === 'en_viaje' || cita.estado?.toLowerCase() === 'atendida'
                            }"
                            class="px-2 py-1 rounded-full text-xs font-medium">
                            {{ getEstadoLabel(cita.estado) }}
                        </span>
                    </div>
                    
                    <div class="mb-3">
                        <p class="font-semibold text-gray-800">{{ getNombrePaciente(cita) }}</p>
                    </div>
                    
                    <div class="text-sm text-gray-600 mb-4">
                        <p>{{ cita.especialidad?.nombre || 'Medicina General' }} - {{ cita.tipo_atencion || 'En consultorio' }}</p>
                    </div>
                    
                    <div v-if="cita.estado?.toLowerCase() === 'pendiente'" class="flex gap-2">
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

        <!-- Mensaje cuando no hay citas pendientes -->
        <div v-else-if="!loading && citasPendientes.length === 0 && citas.length > 0" class="text-center py-6 text-gray-500">
            <p>No hay citas pendientes de aprobación</p>
        </div>

        <!-- Mensaje cuando no hay citas -->
        <div v-else-if="!loading" class="text-center py-12 text-gray-500">
            <p>No hay citas programadas</p>
        </div>
    </LayoutComponent>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LayoutComponent from '../components/LayoutComponent.vue'
import DoctorCalendarComponent from '../components/DoctorCalendarComponent.vue'
import ButtonComponent from '../components/ButtonComponent.vue'
import LoaderComponent from '../components/LoaderComponent.vue'
import { useAuthStore } from '../stores/authStore'
import { 
    getCitasApi, 
    getCitasPendientesApi,
    aprobarCitaApi, 
    rechazarCitaApi 
} from '../api/citas'

const authStore = useAuthStore()
const citas = ref([])
const citasPendientes = ref([])
const loading = ref(false)
const errorMessage = ref('')

// Cargar citas del backend
const loadCitas = async () => {
    loading.value = true
    errorMessage.value = ''
    
    try {
        console.log('🔄 Cargando citas...')
        const personalId = authStore.user?.id || authStore.user?.id_personal
        
        if (!personalId) {
            errorMessage.value = 'No se pudo obtener el ID del personal médico'
            return
        }
        
        // Cargar citas aprobadas/programadas (excluyendo pendientes)
        const dataCitas = await getCitasApi(personalId)
        // Filtrar citas confirmadas, atendidas o en viaje (excluir pendientes y canceladas)
        const citasConfirmadas = dataCitas.filter(c => {
            const estado = c.estado_cita?.toLowerCase() || c.estado?.toLowerCase() || ''
            return estado === 'confirmada' || estado === 'atendida' || estado === 'en_viaje'
        })
        citas.value = citasConfirmadas.map(c => ({
            id: c.id_cita || c.id,
            fecha_hora: c.fecha_hora || c.fecha_cita,
            estado: c.estado_cita || c.estado,
            tipo_atencion: c.tipo_atencion || c.modalidad || 'En consultorio',
            paciente: c.paciente || c.paciente_data,
            especialidad: c.especialidad || c.especialidad_data,
            direccion: c.direccion || null,
            id_personal: c.id_personal
        }))
        
        // Cargar citas pendientes
        const dataPendientes = await getCitasPendientesApi(personalId)
        citasPendientes.value = dataPendientes.map(c => ({
            id: c.id_cita || c.id,
            fecha_hora: c.fecha_hora || c.fecha_cita,
            estado: c.estado_cita || c.estado,
            tipo_atencion: c.tipo_atencion || c.modalidad || 'En consultorio',
            paciente: c.paciente || c.paciente_data,
            especialidad: c.especialidad || c.especialidad_data,
            direccion: c.direccion || null,
            id_personal: c.id_personal
        }))
        
        console.log('✅ Citas cargadas:', citas.value.length)
        console.log('✅ Citas pendientes:', citasPendientes.value.length)
    } catch (error) {
        console.error('❌ Error al cargar citas:', error)
        
        if (error.detail) {
            errorMessage.value = error.detail
        } else if (error.message) {
            errorMessage.value = error.message
        } else {
            errorMessage.value = 'Error al cargar las citas'
        }
    } finally {
        loading.value = false
    }
}

// Funciones de utilidad
const formatFechaHora = (fechaHora) => {
    if (!fechaHora) return '--/--/---- --:--'
    
    try {
        const fecha = new Date(fechaHora)
        const dia = fecha.getDate().toString().padStart(2, '0')
        const mes = fecha.toLocaleString('es-ES', { month: 'short' })
        const hora = fecha.getHours().toString().padStart(2, '0')
        const minutos = fecha.getMinutes().toString().padStart(2, '0')
        const diaSemana = fecha.toLocaleString('es-ES', { weekday: 'short' })
        
        return `${hora}:${minutos} ${diaSemana}, ${dia} ${mes}`
    } catch (error) {
        return fechaHora
    }
}

const getNombrePaciente = (cita) => {
    if (!cita.paciente) return 'Paciente desconocido'
    
    if (typeof cita.paciente === 'string') {
        return cita.paciente
    }
    
    const paciente = cita.paciente
    const nombres = paciente.nombres || paciente.nombre || ''
    const apellidoPaterno = paciente.apellido_paterno || paciente.apellidoPaterno || ''
    const apellidoMaterno = paciente.apellido_materno || paciente.apellidoMaterno || ''
    
    return `${nombres} ${apellidoPaterno} ${apellidoMaterno}`.trim() || 'Paciente desconocido'
}

const getEstadoLabel = (estado) => {
    if (!estado) return 'Desconocido'
    
    const estadoLower = estado.toLowerCase()
    const estados = {
        'pendiente': 'Pendiente',
        'confirmada': 'Confirmada',
        'cancelada': 'Cancelada',
        'atendida': 'Atendida',
        'en_viaje': 'En viaje',
        'postergada': 'Postergada'
    }
    
    return estados[estadoLower] || estado
}

// Aprobar cita
const handleAprobar = async (cita) => {
    try {
        console.log('✅ Aprobando cita:', cita.id)
        await aprobarCitaApi(cita.id)
        console.log('✅ Cita aprobada exitosamente')
        
        // Recargar citas
        await loadCitas()
        
    } catch (error) {
        console.error('❌ Error al aprobar cita:', error)
        
        if (error.detail) {
            errorMessage.value = error.detail
        } else if (error.message) {
            errorMessage.value = error.message
        } else {
            errorMessage.value = 'Error al aprobar la cita'
        }
    }
}

// Rechazar cita
const handleRechazar = async (cita) => {
    if (!confirm('¿Estás seguro de que deseas rechazar esta cita?')) {
        return
    }
    
    try {
        console.log('❌ Rechazando cita:', cita.id)
        await rechazarCitaApi(cita.id)
        console.log('✅ Cita rechazada exitosamente')
        
        // Recargar citas
        await loadCitas()
        
    } catch (error) {
        console.error('❌ Error al rechazar cita:', error)
        
        if (error.detail) {
            errorMessage.value = error.detail
        } else if (error.message) {
            errorMessage.value = error.message
        } else {
            errorMessage.value = 'Error al rechazar la cita'
        }
    }
}

// Cargar citas al montar el componente
onMounted(() => {
    loadCitas()
})
</script>