<script setup>
import LayoutComponent from '../components/LayoutComponent.vue';
import cardKPIComponent from '../components/cardKPIComponent.vue';
import ButtonComponent from '../components/ButtonComponent.vue';
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
        <form class="mb-6">
            <div class="flex flex-col md:flex-row gap-4">
                <div class="flex-1 md:max-w-xs">
                    <input type="text"
                        class="bg-white border border-gray-200 text-sm rounded-lg focus:ring-[#10A697] focus:border-[#10A697] block w-full px-4 py-2.5"
                        placeholder="Buscar por nombre..." />
                </div>
                <div class="flex-1 md:max-w-xs">
                    <select
                        class="bg-white border border-gray-200 text-sm rounded-lg focus:ring-[#10A697] focus:border-[#10A697] block w-full px-4 py-2.5">
                        <option value="" selected disabled>Filtrar por especialidad</option>
                        <option value="medicina_general">Medicina general</option>
                        <option value="pediatria">Pediatría</option>
                        <option value="dermatologia">Dermatología</option>
                    </select>
                </div>
                <ButtonComponent type="submit" variant="primary" size="large" icon="filter" label="Filtrar"
                    @click="handleFilter" />
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
                        <tr class="bg-white border-b border-gray-200 hover:bg-gray-50">
                            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                Juan Pérez
                            </th>
                            <td class="px-6 py-4 whitespace-nowrap">Medicina general</td>
                            <td class="px-6 py-4 whitespace-nowrap">2025-10-07</td>
                            <td class="px-6 py-4">
                                <span
                                    class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap">Aprobado</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <ButtonComponent type="button" variant="warning" size="medium" icon="xmark" label="Dar de baja"
                                    @click="handleDeactivate" />
                            </td>
                        </tr>
                        <tr class="bg-white border-b border-gray-200 hover:bg-gray-50">
                            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                María González
                            </th>
                            <td class="px-6 py-4 whitespace-nowrap">Pediatría</td>
                            <td class="px-6 py-4 whitespace-nowrap">2025-10-07</td>
                            <td class="px-6 py-4">
                                <span
                                    class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap">Pendiente</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex gap-2">
                                    <ButtonComponent type="button" variant="success" size="medium" icon="check" label="Aprobar"
                                        @click="handleApprove" />
                                    <ButtonComponent type="button" variant="danger" size="medium" icon="xmark" label="Rechazar"
                                        @click="handleReject" />
                                </div>
                            </td>
                        </tr>
                        <tr class="bg-white border-b border-gray-200 hover:bg-gray-50">
                            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                Carlos Rodríguez
                            </th>
                            <td class="px-6 py-4 whitespace-nowrap">Dermatología</td>
                            <td class="px-6 py-4 whitespace-nowrap">2025-10-06</td>
                            <td class="px-6 py-4">
                                <span
                                    class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap">Rechazado</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="text-gray-400 text-sm">Sin acciones</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </LayoutComponent>
</template>

<style scoped></style>