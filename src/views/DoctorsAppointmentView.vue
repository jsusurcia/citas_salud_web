<template>
    <LayoutComponent>
        <!-- Título y descripción -->
        <h1 class="mb-4 text-2xl font-bold text-gray-700">Gestión de tus citas</h1>
        <div class="mb-4">
            <DoctorCalendarComponent />
        </div>
    </LayoutComponent>
</template>

<script setup>
import DoctorCalendarComponent from '../components/DoctorCalendarComponent.vue'
import LayoutComponent from '../components/LayoutComponent.vue';
</script>