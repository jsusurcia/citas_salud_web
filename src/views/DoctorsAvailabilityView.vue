<template>
  <LayoutComponent>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-gray-700">Gestión de horarios</h1>

      <ButtonComponent type="button" variant="secondary" size="large"
        :icon="isLoading ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-sync'" label="Recargar" :disabled="isLoading"
        @click="handleRefresh" />
    </div>

    <div v-if="error" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
      <strong>Error:</strong> {{ error }}
    </div>

    <div v-if="isLoading && horarios.length === 0" class="flex justify-center items-center py-12">
      <LoaderComponent />
      <span class="ml-4 text-gray-500">Cargando horarios...</span>
    </div>

    <div v-else>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

        <div>
          <label for="tipoAtencion" class="block mb-2 text-sm font-medium text-gray-900">
            Tipo de atención
          </label>
          <select id="tipoAtencion" v-model="tipoAtencion"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5">
            <option :value="true">En centro médico</option>
            <option :value="false">Visita domiciliar</option>
          </select>
        </div>

        <div v-if="tipoAtencion === true">
          <label for="piso" class="block mb-2 text-sm font-medium text-gray-900">
            Piso <span class="text-red-500">*</span>
          </label>
          <input type="text" id="piso" v-model="piso" placeholder="Ingrese el piso del consultorio"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5" />
        </div>

        <div v-if="tipoAtencion === true">
          <label for="sala" class="block mb-2 text-sm font-medium text-gray-900">
            Consultorio <span class="text-red-500">*</span>
          </label>
          <input type="text" id="sala" v-model="sala" placeholder="Ingrese el número del consultorio"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5" />
        </div>

      </div>
      <DoctorCalendarHorariosComponent :horarios="horarios" @crear-horario="handleCrear"
        @actualizar-horario="handleActualizar" @eliminar-horario="handleEliminar" />
    </div>

  </LayoutComponent>
</template>


<script setup>
import { onMounted, computed, ref, watch } from 'vue'
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
const piso = ref('')
const sala = ref('')

watch(tipoAtencion, (esEnCentro) => {
  if (esEnCentro === false) {
    piso.value = ''
    sala.value = ''
  }
})

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
const handleCrear = (timeData) => {
  console.log('Vista: Recibido evento @crear-horario (solo tiempo)', timeData)
  console.log('Vista: Usando tipo de atención:', tipoAtencion.value ? 'En centro médico' : 'Visita')

  const horarioData = {
    ...timeData,
    en_centro_medico: tipoAtencion.value,
  };

  // 2. Añadir datos condicionales Y VALIDAR
  if (horarioData.en_centro_medico === true) {

    const pisoVal = piso.value.trim()
    const salaVal = sala.value.trim()

    if (!pisoVal || !salaVal) {
      // Si uno o ambos están vacíos, mostramos error y paramos.
      // Usamos el 'error' del store, ya que tu vista lo está mostrando.
      horarioStore.error = "Para atención en centro médico, el piso y el consultorio son obligatorios."
      alert("Para atención en centro médico, el piso y el consultorio son obligatorios.")
      console.warn('Vista: Validación fallida. Faltan piso o sala.')
      return
    }


    horarioData.piso = pisoVal;
    horarioData.sala = salaVal;

  }


  console.log('Vista: Enviando payload completo al store', horarioData)

  horarioStore.addHorario(horarioData)
}

/**
 * Se llama cuando el calendario emite '@actualizar-horario'.
 */
const handleActualizar = (horarioId, timeData) => { // timeData es {fecha, hora_inicio, hora_fin}
  console.log('Vista: Recibido @actualizar-horario', horarioId, timeData);

  // 1. Buscar el horario original en el store
  const horarioOriginal = horarioStore.horarios.find(h => h.id_horario === horarioId);

  if (!horarioOriginal) {
    console.error('Vista: No se encontró el horario original para actualizar.');
    return;
  }

  // 2. Crear el payload de actualización COMPLETO
  //    (Mezcla los datos originales con los nuevos datos de tiempo)
  const fullUpdateData = {
    // Datos originales que no cambian
    en_centro_medico: horarioOriginal.en_centro_medico,
    piso: horarioOriginal.piso,
    sala: horarioOriginal.sala,
    estado: horarioOriginal.estado,
    // (Añade 'nombre_centro_medico', etc., si también los tienes en el objeto)

    // Nuevos datos de tiempo (sobrescriben los originales)
    ...timeData
  };

  console.log('Vista: Enviando payload de actualización completo al store', fullUpdateData);

  // 3. Enviar el payload completo al store
  horarioStore.updateHorario(horarioId, fullUpdateData);
}

/**
 * Se llama cuando el calendario emite '@eliminar-horario'.
 */
const handleEliminar = async (horarioId) => {
  console.log('Vista: Recibido evento @eliminar-horario', horarioId)

  try {
    // 1. Intentar eliminar sin confirmación
    await horarioStore.removeHorario(horarioId)
  } catch (error) {
    // 2. Si el backend devuelve 409 (Conflict), es porque hay citas asociadas
    if (error.status === 409 || error.status === '409' || error.statusCode === 409) {
      const mensaje = error.detail || "Este horario tiene citas asociadas. ¿Deseas eliminarlo de todas formas? Se notificará al paciente.";

      // 3. Pedir confirmación al usuario
      if (confirm(mensaje)) {
        console.log('Vista: Usuario confirmó eliminación forzada.');
        try {
          // 4. Reintentar con confirmación = true
          await horarioStore.removeHorario(horarioId, true)
        } catch (retryError) {
          console.error('Vista: Error al eliminar incluso con confirmación', retryError);
          alert("No se pudo eliminar el horario: " + (retryError.detail || retryError.message));
        }
      } else {
        console.log('Vista: Usuario canceló la eliminación.');
      }
    } else {
      // Otros errores
      console.error('Vista: Error al eliminar horario', error);
      // El store ya maneja el error en 'horarioStore.error', pero podemos mostrar un alert extra si queremos
    }
  }
}

/**
 * Se llama al hacer clic en el botón "Recargar".
 */
const handleRefresh = () => {
  console.log('Vista: Forzando recarga de horarios...')
  horarioStore.fetchHorarios()
}
</script>