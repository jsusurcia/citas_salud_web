<script setup>
// Importar Componentes y otros
import { ref, computed, onMounted } from 'vue';
import LayoutComponent from '../components/LayoutComponent.vue';
import cardKPIComponent from '../components/cardKPIComponent.vue';
import ButtonComponent from '../components/ButtonComponent.vue';
import SpanComponent from '../components/SpanComponent.vue';
import ConfirmModalComponent from '../components/ConfirmModalComponent.vue';
import LoaderComponent from '../components/LoaderComponent.vue';

// Importar API
import { getPendientesApi, getAprobadosHoyApi, getRechazadosHoyApi, getSolicitudesPendientesApi, aprobarSolicitudApi } from '../api/admin_validaciones';

// Array de personales pendientes para la tabla
const personales = ref([])

// Configuración para los filtros
const searchName = ref('');
const searchSpeciality = ref('');

const filterPersonal = computed(() => {
    return personales.value.filter(personal => {
        const nombre = personal.nombre.toLowerCase().includes(searchName.value.toLowerCase());
        const especialidad = personal.especialidad === searchSpeciality.value || !searchSpeciality.value;
        return nombre && especialidad;
    });
}) ;

// Configuración para los modales
const activeModal = ref(null);
const selectedPersonal = ref(null);
const creating = ref(false); // Estado de carga para operaciones

const openConfirmModal = (personal, action) => {
    selectedPersonal.value = personal;
    activeModal.value = action;
    errorMessage.value = ''; // Limpiar errores previos
};
const closeModal = () => {
    selectedPersonal.value = null;
    activeModal.value = null;
    errorMessage.value = ''; // Limpiar errores al cerrar
};

// Método de carga inicial de KPIs
const pendientes = ref(0)
const aprobadosHoy = ref(0)
const rechazadosHoy = ref(0)
const loading = ref(false)
const errorMessage = ref('')
const loadKPIs = async () => {
    loading.value = true

    try {
        const dataPendientes = await getPendientesApi()
        const dataAprobadosHoy = await getAprobadosHoyApi()
        const dataRechazadosHoy = await getRechazadosHoyApi()

        // Asegurar que sean números
        pendientes.value = typeof dataPendientes === 'number' ? dataPendientes : 0
        aprobadosHoy.value = typeof dataAprobadosHoy === 'number' ? dataAprobadosHoy : 0
        rechazadosHoy.value = typeof dataRechazadosHoy === 'number' ? dataRechazadosHoy : 0
    } catch (error) {
        console.error('❌ Error al cargar KPIs:', error)
        errorMessage.value = error.detail || error.message || 'Error al cargar los KPIs'
        // En caso de error, mantener los valores en 0
        pendientes.value = 0
        aprobadosHoy.value = 0
        rechazadosHoy.value = 0
    } finally {
        loading.value = false
    }
}

const loadSolicitudesPendientes = async () => {
    loading.value = true
    try {
        const data = await getSolicitudesPendientesApi()
        personales.value = data.map(personal => ({
            id: personal.id_personal_especialidad,
            nombre: personal.nombre_personal,
            especialidad: personal.especialidad,
            nroColegiatura: personal.nro_colegiatura,
            estado: personal.estado
        }))
    } catch (error) {
        if (error.detail) {
            errorMessage.value = error.detail
        } else {
            errorMessage.value = error.message || 'Error al cargar las solicitudes pendientes'
        }
    } finally {
        loading.value = false
    }
}

// Método para aprobar una solicitud
const handleApproveRequest = async () => {
    if (!selectedPersonal.value) return;
    
    creating.value = true;
    errorMessage.value = '';
    
    try {
        const idPersonalEspecialidad = selectedPersonal.value.id;
        
        console.log('✅ Aprobando solicitud...', { idPersonalEspecialidad });
        
        // Llamar a la API para aprobar la solicitud
        await aprobarSolicitudApi(idPersonalEspecialidad, 'aprobado');
        
        console.log('✅ Solicitud aprobada exitosamente');
        
        // Cerrar el modal
        closeModal();
        
        // Recargar los datos para reflejar los cambios
        await Promise.all([
            loadKPIs(),                    // Actualizar KPIs
            loadSolicitudesPendientes()    // Actualizar la tabla
        ]);
        
    } catch (error) {
        console.error('❌ Error al aprobar solicitud:', error);
        
        // Mostrar mensaje de error más específico
        let errorMsg = 'Error al aprobar la solicitud';
        
        if (error.response?.status === 404) {
            errorMsg = 'Solicitud no encontrada';
        } else if (error.response?.status === 403) {
            errorMsg = 'No tienes permisos para aprobar solicitudes. Solo los administradores pueden realizar esta acción.';
        } else if (error.detail) {
            errorMsg = error.detail;
        } else if (error.message) {
            errorMsg = error.message;
        }
        
        errorMessage.value = errorMsg;
    } finally {
        creating.value = false;
    }
};

// Método para rechazar una solicitud (placeholder - implementar cuando esté lista la API)
const handleRejectRequest = async () => {
    console.warn('⚠️ Función de rechazar solicitud aún no implementada');
    errorMessage.value = 'La funcionalidad de rechazar solicitudes aún no está implementada.';
    closeModal();
};

onMounted(() => {
    loadKPIs()
    loadSolicitudesPendientes()
})
</script>

<template>
    <LayoutComponent>
        <!-- Título y descripción -->
        <h1 class="mb-4 text-2xl font-bold text-gray-700">Validación de personal médico</h1>
        <p class=" mb-4 font-normal text-gray-500">Administrar solicitudes de doctores pendientes.</p>

        <!-- Loader -->
        <div v-if="loading && personales.length === 0" class="flex justify-center items-center py-12">
            <LoaderComponent />
        </div>        

        <div v-else>
            <!-- KPIs -->
            <div class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <cardKPIComponent :value="String(pendientes)" label="Solicitudes pendientes" />
                <cardKPIComponent :value="String(aprobadosHoy)" label="Solicitudes aprobadas hoy" />
                <cardKPIComponent value="0" label="Solicitudes rechazadas hoy" />
            </div>
    
            <!-- Filtros -->
            <form class="mb-6" @submit.prevent>
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1 md:max-w-xs">
                        <input type="text" v-model="searchName"
                            class="bg-white border border-gray-200 text-sm rounded-lg focus:ring-[#10A697] focus:border-[#10A697] block w-full px-4 py-2.5"
                            placeholder="Buscar por nombre..." />
                    </div>
                    <div class="flex-1 md:max-w-xs">
                        <select v-model="searchSpeciality"
                            class="bg-white border border-gray-200 text-sm rounded-lg focus:ring-[#10A697] focus:border-[#10A697] block w-full px-4 py-2.5">
                            <option value="" selected disabled>Filtrar por especialidad</option>
                            <option value="Medicina general">Medicina general</option>
                            <option value="Pediatría">Pediatría</option>
                            <option value="Dermatología">Dermatología</option>
                        </select>
                    </div>
                    <ButtonComponent type="submit" variant="primary" size="large" icon="fa-solid fa-filter" label="Filtrar" />
                </div>
            </form>
            
            <!-- Tabla -->
            <div class="bg-white border border-gray-200 rounded-lg p-6">
                <div class="overflow-x-auto">
                    <h1 class="mb-4 text-lg font-bold text-gray-700">Solicitudes pendientes</h1>
                    <table class="w-full text-sm text-left text-gray-500">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" class="px-6 py-3 whitespace-nowrap">Nombre del personal</th>
                                <th scope="col" class="px-6 py-3 whitespace-nowrap">Especialidad</th>
                                <th scope="col" class="px-6 py-3 whitespace-nowrap">Nro Colegiatura</th>
                                <th scope="col" class="px-6 py-3 whitespace-nowrap">Estado</th>
                                <th scope="col" class="px-6 py-3 whitespace-nowrap">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="personal in personales" :key="personal.id" class="bg-white border-b border-gray-200 hover:bg-gray-50">
                                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                    {{ personal.nombre }}
                                </th>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    {{ personal.especialidad }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    {{ personal.nroColegiatura }}
                                </td>
                                <td class="px-6 py-4">
                                    <SpanComponent v-if="personal.estado === 'aprobado'" variant="primary" label="Aprobado" />
                                    <SpanComponent v-if="personal.estado === 'pendiente'" variant="danger" label="Pendiente" />
                                    <SpanComponent v-if="personal.estado === 'rechazado'" variant="secondary" label="Rechazado" />
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div v-if="personal.estado === 'pendiente'" class="flex gap-2">
                                        <ButtonComponent type="button" variant="success" size="small" icon="fa-solid fa-check" label="Aprobar" @click="openConfirmModal(personal, 'aprobado')" />
                                        <ButtonComponent type="button" variant="danger" size="small" icon="fa-solid fa-xmark" label="Rechazar" @click="openConfirmModal(personal, 'rechazado')" />
                                    </div>
                                    <div v-else-if="personal.estado === 'aprobado'" class="flex gap-2">
                                        <ButtonComponent type="button" variant="warning" size="small" icon="fa-solid fa-xmark" label="Dar de baja" @click="openConfirmModal(personal, 'baja')" />
                                    </div>
                                    <span v-else class="text-gray-400 text-sm">Sin acciones</span>
                                </td>
                            </tr>
                            <tr v-if="personales.length === 0">
                                <td colspan="5" class="text-center py-8 text-gray-500">No se encontraron solicitudes.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!--Modal de confirmación para aprobar la solicitud-->
            <ConfirmModalComponent 
                :isOpen="activeModal === 'aprobado'" 
                type="success"
                title="¿Aprobar esta solicitud?" 
                description="Esta acción aprobará la solicitud del personal médico. El personal podrá acceder al sistema después de la aprobación."
                confirmLabel="Sí, aprobar"
                :errorMessage="activeModal === 'aprobado' ? errorMessage : ''"
                @confirm="handleApproveRequest" 
                @close="closeModal" />

            <!--Modal de confirmación para rechazar la solicitud-->
            <ConfirmModalComponent 
                :isOpen="activeModal === 'rechazado'" 
                type="danger"
                title="¿Rechazar esta solicitud?" 
                description="Esta acción rechazará la solicitud de forma permanente. No podrás recuperarla luego."
                confirmLabel="Sí, rechazar"
                :errorMessage="activeModal === 'rechazado' ? errorMessage : ''"
                @confirm="handleRejectRequest" 
                @close="closeModal" />
        </div>
    </LayoutComponent>
</template>

<style scoped></style>