<script setup>
// Importar Componentes y otros
import { ref, computed } from 'vue';
import LayoutComponent from '../components/LayoutComponent.vue';
import cardKPIComponent from '../components/cardKPIComponent.vue';
import ButtonComponent from '../components/ButtonComponent.vue';
import SpanComponent from '../components/SpanComponent.vue';
import ConfirmModalComponent from '../components/ConfirmModalComponent.vue';

// Array de prueba
const personales = ref([
    { id: 1, nombre: 'Juan Pérez', especialidad: 'Medicina general', fechaSolicitud: '2025-10-18', estado: 'Pendiente' },
    { id: 2, nombre: 'María González', especialidad: 'Pediatría', fechaSolicitud: '2025-10-17', estado: 'Pendiente' },
    { id: 3, nombre: 'Carlos Rodríguez', especialidad: 'Dermatología', fechaSolicitud: '2025-10-16', estado: 'Aprobado' },
    { id: 4, nombre: 'Ana Martínez', especialidad: 'Medicina general', fechaSolicitud: '2025-10-15', estado: 'Rechazado' },
    { id: 5, nombre: 'Luis Hernández', especialidad: 'Pediatría', fechaSolicitud: '2025-10-14', estado: 'Aprobado' }
]);

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

const openConfirmModal = (personal, action) => {
    selectedPersonal.value = personal;
    activeModal.value = action;
};
const closeModal = () => {
    selectedPersonal.value = null;
    activeModal.value = null;
};
const handleConfirmAction = () => {
    if (!selectedPersonal.value) return;
    
    const action = activeModal.value;
    const personal = selectedPersonal.value;

    if (action === 'aprobado') {
        personal.estado = 'Aprobado';
    } else if (action === 'rechazado') {
        personal.estado = 'Rechazado';
    } else if (action === 'baja') {
        personal.estado = 'Rechazado';
    }

    closeModal();
}
</script>

<template>
    <LayoutComponent>
        <!-- Título y descripción -->
        <h1 class="mb-4 text-2xl font-bold text-gray-700">Validación de personal médico</h1>
        <p class=" mb-4 font-normal text-gray-500">Administrar solicitudes de doctores pendientes.</p>

        <!-- KPIs -->
        <div class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <cardKPIComponent value="5" label="Solicitudes pendientes" />
            <cardKPIComponent value="1" label="Solicitudes aprobadas hoy" />
            <cardKPIComponent value="1" label="Solicitudes rechazadas hoy" />
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
                            <th scope="col" class="px-6 py-3 whitespace-nowrap">Fecha de solicitud</th>
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
                                {{ personal.fechaSolicitud }}
                            </td>
                            <td class="px-6 py-4">
                                <SpanComponent v-if="personal.estado === 'Aprobado'" variant="primary" label="Aprobado" />
                                <SpanComponent v-if="personal.estado === 'Pendiente'" variant="danger" label="Pendiente" />
                                <SpanComponent v-if="personal.estado === 'Rechazado'" variant="secondary" label="Rechazado" />
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div v-if="personal.estado === 'Pendiente'" class="flex gap-2">
                                    <ButtonComponent type="button" variant="success" size="small" icon="fa-solid fa-check" label="Aprobar" @click="openConfirmModal(personal, 'aprobado')" />
                                    <ButtonComponent type="button" variant="danger" size="small" icon="fa-solid fa-xmark" label="Rechazar" @click="openConfirmModal(personal, 'rechazado')" />
                                </div>
                                <div v-else-if="personal.estado === 'Aprobado'" class="flex gap-2">
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
    </LayoutComponent>
</template>

<style scoped></style>