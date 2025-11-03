<script setup>
import { ref } from 'vue';

// Define los datos de los filtros de forma reactiva
const filtros = ref({
  fechaInicio: '2024-01-01',
  fechaFin: '2024-01-31',
  tipoReporte: 'resumen_citas'
});

// Define un 'emit' para comunicarnos con el componente padre
const emit = defineEmits(['generar-reporte']);

// Función que se llama al hacer clic en el botón
const handleGenerarReporte = () => {
  // Emite un evento con los datos actuales de los filtros
  emit('generar-reporte', filtros.value);
}
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-4 p-4 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">

    <div class="flex items-center gap-2">
      <label for="fecha-inicio" class="text-sm font-medium text-gray-700">Desde:</label>
      <input type="date" id="fecha-inicio" v-model="filtros.fechaInicio" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">

      <label for="fecha-fin" class="ml-4 text-sm font-medium text-gray-700">Hasta:</label>
      <input type="date" id="fecha-fin" v-model="filtros.fechaFin" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
    </div>

    <div class="flex items-center gap-2">
      <select v-model="filtros.tipoReporte" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
        <option value="resumen_citas">Resumen de citas</option>
        <option value="citas_por_medico">Citas por médico</option>
        <option value="citas_por_especialidad">Citas por especialidad</option>
      </select>
    </div>

    <button @click="handleGenerarReporte" class="px-5 py-2.5 text-sm font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 focus:ring-4 focus:outline-none focus:ring-cyan-300">
      Generar informe
    </button>

  </div>
</template>

<style scoped>
/* Puedes agregar estilos específicos aquí si lo necesitas */
</style>