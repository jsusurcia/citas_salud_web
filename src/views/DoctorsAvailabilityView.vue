<template>
  <LayoutComponent>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-gray-700">Gestión de horarios</h1>
      
      <ButtonComponent 
        type="button" 
        variant="secondary" 
        size="large" 
        :icon="isLoading ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-sync'"
        label="Recargar"
        :disabled="isLoading"
        @click="handleRefresh" 
      />
    </div>

    <div v-if="error" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
      <strong>Error:</strong> {{ error }}
    </div>

    <div v-if="isLoading && horarios.length === 0" class="flex justify-center items-center py-12">
      <LoaderComponent />
      <span class="ml-4 text-gray-500">Cargando horarios...</span>
    </div>

    <div v-else>
      <div class="p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg mb-6 text-sm">
        <i class="fa-solid fa-circle-info mr-2"></i>
        <strong>Modo de uso:</strong>
        <ul class="list-disc list-inside ml-4 mt-2">
          <li><strong>Crear:</strong> Arrastra el mouse sobre un día para crear un nuevo bloque.</li>
          <li><strong>Actualizar:</strong> Arrastra o redimensiona un bloque existente.</li>
          <li><strong>Eliminar:</strong> Haz clic sobre un bloque para confirmar su eliminación.</li>
        </ul>
      </div>

      <div class="mb-4">
        <label for="tipoAtencion" class="block mb-2 text-sm font-medium text-gray-900">
          Tipo de atención
        </label>
        <select 
          id="tipoAtencion" 
          v-model="tipoAtencion"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full max-w-xs p-2.5"
        >
          <option :value="true">En centro médico (Posta)</option>
          <option :value="false">Visita domiciliar</option>
        </select>
      </div>

      <DoctorCalendarHorariosComponent 
        :horarios="horarios"
        @crear-horario="handleCrear"
        @actualizar-horario="handleActualizar"
        @eliminar-horario="handleEliminar"
      />
    </div>

  </LayoutComponent>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { useHorarioStore } from '../stores/horarioStore' // Asegúrate que la ruta sea correcta

// Componentes de UI
import LayoutComponent from '../components/LayoutComponent.vue'
import DoctorCalendarHorariosComponent from '../components/DoctorCalendarHorariosComponent.vue'
import ButtonComponent from '../components/ButtonComponent.vue'
import LoaderComponent from '../components/LoaderComponent.vue'

// 1. Inicializar el Store
const horarioStore = useHorarioStore()

// 2. Crear referencias reactivas al estado del store
// 'computed' asegura que la vista siempre refleje el estado actual
const horarios = computed(() => horarioStore.horarios)
const isLoading = computed(() => horarioStore.isLoading)
const error = computed(() => horarioStore.error)


const tipoAtencion = ref(true)

// 3. Cargar los datos iniciales
// Cuando el componente se monta, llama a la acción 'fetchHorarios' del store
onMounted(() => {
  horarioStore.fetchHorarios()
})

// 4. Handlers de Eventos
// Estas funciones "conectan" los eventos del calendario con las acciones del store.

/**
 * Se llama cuando el calendario emite '@crear-horario'.
 * Pasa los datos del nuevo horario a la acción del store.
 */
const handleCrear = (timeData) => { // timeData es {fecha, hora_inicio, hora_fin}
  console.log('Vista: Recibido evento @crear-horario (solo tiempo)', timeData)
  console.log('Vista: Usando tipo de atención:', tipoAtencion.value ? 'En Posta' : 'Visita')

  // 1. Ensamblar el payload final
  const horarioData = {
    ...timeData,
    en_centro_medico: tipoAtencion.value, // <-- El valor de nuestro <select>
  };

  // 2. Añadir datos condicionales
  if (horarioData.en_centro_medico === true) {
    // Si es en posta, añadimos los datos (puedes hacerlos dinámicos si quieres)
    horarioData.nombre_centro_medico = "Posta Principal"; 
    horarioData.direccion_centro_medico = "Plaza de Armas s/n";
  }
  // Si es 'false' (visita), no añadimos 'nombre' ni 'direccion',
  // y se guardarán como 'null' en el backend (que es lo correcto).
  
  console.log('Vista: Enviando payload completo al store', horarioData)

  // 3. Llamar al store
  horarioStore.addHorario(horarioData)
}

/**
 * Se llama cuando el calendario emite '@actualizar-horario'.
 */
const handleActualizar = (horarioId, data) => {
  //console.log('Vista: Recibido evento @actualizar-horario', horarioId, data)
  horarioStore.updateHorario(horarioId, data)
}

/**
 * Se llama cuando el calendario emite '@eliminar-horario'.
 */
const handleEliminar = (horarioId) => {
  console.log('Vista: Recibido evento @eliminar-horario', horarioId)
  horarioStore.removeHorario(horarioId)
}

/**
 * Se llama al hacer clic en el botón "Recargar".
 */
const handleRefresh = () => {
  console.log('Vista: Forzando recarga de horarios...')
  horarioStore.fetchHorarios()
}
</script>