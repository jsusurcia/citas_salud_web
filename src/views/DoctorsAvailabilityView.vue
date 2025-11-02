<template>
    <LayoutComponent>
        <!-- Título y botón -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 class="text-2xl font-bold text-gray-700">Gestión de los horarios</h1>
            <ButtonComponent 
                type="button" 
                variant="primary" 
                size="large" 
                icon="fa-solid fa-plus" 
                label="Añadir horario"
                @click="openAddModal" />
        </div>

        <!-- Mensaje de error -->
        <div v-if="errorMessage" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {{ errorMessage }}
        </div>

        <!-- Loader -->
        <div v-if="loading" class="flex justify-center items-center py-12">
            <LoaderComponent />
        </div>

        <!-- Calendario Semanal -->
        <div v-else class="mb-8">
            <DoctorCalendarComponent 
                :horarios="horarios" 
                @refresh="loadHorarios" />
        </div>

        <!-- Lista de Horarios -->
        <div v-if="!loading && horarios.length > 0">
            <h2 class="text-xl font-semibold text-gray-700 mb-4">Lista de horarios</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div 
                    v-for="horario in horarios" 
                    :key="horario.id"
                    class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div class="mb-3">
                        <span class="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                            {{ horario.especialidad?.nombre || 'Sin especialidad' }}
                        </span>
                    </div>
                    <div class="space-y-2 text-sm text-gray-600 mb-4">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-calendar text-gray-400"></i>
                            <span>Día: {{ getDiaSemana(horario.dia_semana) }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-clock text-gray-400"></i>
                            <span>Inicio: {{ formatHora(horario.hora_inicio) }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-clock text-gray-400"></i>
                            <span>Fin: {{ formatHora(horario.hora_fin) }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-location-dot text-gray-400"></i>
                            <span>Atención: {{ horario.tipo_atencion || 'En consultorio' }}</span>
                        </div>
                    </div>
                    <div class="flex gap-2 justify-end">
                        <ButtonComponent 
                            type="button" 
                            variant="edit" 
                            size="medium" 
                            icon="fa-regular fa-pen-to-square" 
                            label="Editar"
                            @click="openEditModal(horario)" />
                        <ButtonComponent 
                            type="button" 
                            variant="danger" 
                            size="medium" 
                            icon="fa-solid fa-trash" 
                            label="Borrar"
                            @click="openDeleteModal(horario)" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Mensaje cuando no hay horarios -->
        <div v-else-if="!loading" class="text-center py-12 text-gray-500">
            <p>No hay horarios configurados</p>
        </div>

        <!-- Modal para agregar/editar horario -->
        <ModalForm 
            :title="activeModal === 'add' ? 'Nuevo horario' : 'Editar horario'" 
            :isOpen="activeModal === 'add' || activeModal === 'edit'" 
            :isLoading="saving"
            @close="closeModal"
            @submit="handleSave">
            <div class="space-y-4">
                <div>
                    <label for="dia_semana" class="block mb-2 text-sm font-medium text-gray-900">Día de la semana</label>
                    <select 
                        id="dia_semana" 
                        v-model="form.dia_semana" 
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5" 
                        required>
                        <option value="" disabled>Seleccione un día</option>
                        <option value="1">Lunes</option>
                        <option value="2">Martes</option>
                        <option value="3">Miércoles</option>
                        <option value="4">Jueves</option>
                        <option value="5">Viernes</option>
                        <option value="6">Sábado</option>
                        <option value="7">Domingo</option>
                    </select>
                </div>
                <div>
                    <label for="hora_inicio" class="block mb-2 text-sm font-medium text-gray-900">Hora de inicio</label>
                    <input 
                        id="hora_inicio" 
                        v-model="form.hora_inicio" 
                        type="time" 
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5" 
                        required />
                </div>
                <div>
                    <label for="hora_fin" class="block mb-2 text-sm font-medium text-gray-900">Hora de fin</label>
                    <input 
                        id="hora_fin" 
                        v-model="form.hora_fin" 
                        type="time" 
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5" 
                        required />
                </div>
                <div>
                    <label for="tipo_atencion" class="block mb-2 text-sm font-medium text-gray-900">Tipo de atención</label>
                    <select 
                        id="tipo_atencion" 
                        v-model="form.tipo_atencion" 
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5">
                        <option value="En consultorio">En consultorio</option>
                        <option value="A domicilio">A domicilio</option>
                        <option value="Virtual">Virtual</option>
                    </select>
                </div>
            </div>
        </ModalForm>

        <!-- Modal de confirmación para eliminar -->
        <ConfirmModalComponent 
            :isOpen="activeModal === 'deleteConfirm'" 
            type="danger"
            title="¿Eliminar este horario?" 
            description="Esta acción no se puede deshacer. El horario será eliminado permanentemente."
            @confirm="handleDelete" 
            @close="closeModal" />
    </LayoutComponent>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LayoutComponent from '../components/LayoutComponent.vue'
import DoctorCalendarComponent from '../components/DoctorCalendarComponent.vue'
import ButtonComponent from '../components/ButtonComponent.vue'
import ModalForm from '../components/ModalForm.vue'
import ConfirmModalComponent from '../components/ConfirmModalComponent.vue'
import LoaderComponent from '../components/LoaderComponent.vue'
import { useAuthStore } from '../stores/authStore'
import { 
    getDisponibilidadApi, 
    createDisponibilidadApi, 
    updateDisponibilidadApi, 
    deleteDisponibilidadApi 
} from '../api/disponibilidad'

const authStore = useAuthStore()
const horarios = ref([])
const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const activeModal = ref(null)
const selectedHorario = ref(null)
const form = ref({
    dia_semana: '',
    hora_inicio: '',
    hora_fin: '',
    tipo_atencion: 'En consultorio'
})

// Cargar horarios del backend
const loadHorarios = async () => {
    loading.value = true
    errorMessage.value = ''
    
    try {
        console.log('🔄 Cargando horarios...')
        const personalId = authStore.user?.id || authStore.user?.id_personal
        
        if (!personalId) {
            errorMessage.value = 'No se pudo obtener el ID del personal médico'
            return
        }
        
        const data = await getDisponibilidadApi(personalId)
        
        horarios.value = data.map(h => ({
            id: h.id_horario_disponible || h.id_disponibilidad || h.id,
            dia_semana: h.dia_semana,
            hora_inicio: h.hora_inicio,
            hora_fin: h.hora_fin,
            tipo_atencion: h.tipo_atencion || h.modalidad || 'En consultorio',
            especialidad: h.especialidad || h.id_especialidad || null,
            id_personal: h.id_personal,
            estado: h.estado !== false
        }))
        
        console.log('✅ Horarios cargados:', horarios.value.length)
    } catch (error) {
        console.error('❌ Error al cargar horarios:', error)
        
        if (error.detail) {
            errorMessage.value = error.detail
        } else if (error.message) {
            errorMessage.value = error.message
        } else {
            errorMessage.value = 'Error al cargar los horarios'
        }
    } finally {
        loading.value = false
    }
}

// Funciones de utilidad
const getDiaSemana = (dia) => {
    const dias = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    return dias[dia] || 'Desconocido'
}

const formatHora = (hora) => {
    if (!hora) return '--:--'
    // Si viene en formato HH:MM:SS, solo tomar HH:MM
    return hora.substring(0, 5)
}

// Modales
const openAddModal = () => {
    form.value = {
        dia_semana: '',
        hora_inicio: '',
        hora_fin: '',
        tipo_atencion: 'En consultorio'
    }
    activeModal.value = 'add'
    errorMessage.value = ''
}

const openEditModal = (horario) => {
    selectedHorario.value = horario
    form.value = {
        dia_semana: horario.dia_semana?.toString() || '',
        hora_inicio: formatHora(horario.hora_inicio),
        hora_fin: formatHora(horario.hora_fin),
        tipo_atencion: horario.tipo_atencion || 'En consultorio'
    }
    activeModal.value = 'edit'
    errorMessage.value = ''
}

const openDeleteModal = (horario) => {
    selectedHorario.value = horario
    activeModal.value = 'deleteConfirm'
}

const closeModal = () => {
    activeModal.value = null
    selectedHorario.value = null
}

// Guardar horario (crear o editar)
const handleSave = async () => {
    if (!form.value.dia_semana || !form.value.hora_inicio || !form.value.hora_fin) {
        errorMessage.value = 'Por favor completa todos los campos requeridos'
        return
    }
    
    saving.value = true
    errorMessage.value = ''
    
    try {
        const personalId = authStore.user?.id || authStore.user?.id_personal
        
        if (!personalId) {
            throw new Error('No se pudo obtener el ID del personal médico')
        }
        
        const horarioData = {
            id_personal: personalId,
            dia_semana: parseInt(form.value.dia_semana),
            hora_inicio: form.value.hora_inicio,
            hora_fin: form.value.hora_fin,
            tipo_atencion: form.value.tipo_atencion
        }
        
        if (activeModal.value === 'edit' && selectedHorario.value) {
            // Actualizar
            await updateDisponibilidadApi(selectedHorario.value.id, horarioData)
            console.log('✅ Horario actualizado')
        } else {
            // Crear
            await createDisponibilidadApi(horarioData)
            console.log('✅ Horario creado')
        }
        
        closeModal()
        await loadHorarios()
        
    } catch (error) {
        console.error('❌ Error al guardar horario:', error)
        
        if (error.detail) {
            errorMessage.value = error.detail
        } else if (error.message) {
            errorMessage.value = error.message
        } else {
            errorMessage.value = 'Error al guardar el horario'
        }
    } finally {
        saving.value = false
    }
}

// Eliminar horario
const handleDelete = async () => {
    if (!selectedHorario.value) return
    
    saving.value = true
    errorMessage.value = ''
    
    try {
        await deleteDisponibilidadApi(selectedHorario.value.id)
        console.log('✅ Horario eliminado')
        
        closeModal()
        await loadHorarios()
        
    } catch (error) {
        console.error('❌ Error al eliminar horario:', error)
        
        if (error.detail) {
            errorMessage.value = error.detail
        } else if (error.message) {
            errorMessage.value = error.message
        } else {
            errorMessage.value = 'Error al eliminar el horario'
        }
    } finally {
        saving.value = false
    }
}

// Cargar horarios al montar el componente
onMounted(() => {
    loadHorarios()
})
</script>