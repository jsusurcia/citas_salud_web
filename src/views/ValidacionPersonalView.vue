<script setup>
import LayoutComponent from '../components/LayoutComponent.vue';
import cardKPIComponent from '../components/cardKPIComponent.vue';
</script>

<template>
    <LayoutComponent>
        <!-- Título y descripción -->
        <h1 class="mb-4 text-2xl font-bold text-gray-700">Validación de personal médico</h1>
        <p class=" mb-4 font-normal text-gray-500">Administrar solicitudes de doctores pendientes.</p>

        <!-- KPIs -->
        <div class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <cardKPIComponent value="5" label="Solicitudes Pendientes" />
            <cardKPIComponent value="1" label="Solicitudes Aprobadas Hoy" />
            <cardKPIComponent value="1" label="Solicitudes Rechazadas Hoy" />
        </div>
    </LayoutComponent>
</template>

<style scoped>
</style>