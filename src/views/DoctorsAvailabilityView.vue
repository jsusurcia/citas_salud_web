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
        @actualizar-horario="handleActualizar" @editar-horario="handleEditar" />
    </div>

    <!-- MODAL DE EDICIÓN -->
    <ModalForm :is-open="isEditModalOpen" title="Editar horario" :is-loading="isLoading" @close="closeEditModal"
      @submit="guardarEdicion">

      <div v-if="editingHorario">
        <div class="mb-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">
          <p><strong>Fecha:</strong> {{ editingHorario.fecha }}</p>
          <p><strong>Hora:</strong> {{ editingHorario.hora_inicio }} - {{ editingHorario.hora_fin }}</p>
          <p class="mt-1 text-xs text-blue-600">El horario no se puede modificar, solo la ubicación.</p>
        </div>

        <div v-if="editingHorario.en_centro_medico">
          <div class="mb-4">
            <label for="editPiso" class="block mb-2 text-sm font-medium text-gray-900">Piso</label>
            <input type="text" id="editPiso" v-model="editPiso"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              required />
          </div>
          <div class="mb-4">
            <label for="editSala" class="block mb-2 text-sm font-medium text-gray-900">Consultorio</label>
            <input type="text" id="editSala" v-model="editSala"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              required />
          </div>
        </div>
        <div v-else class="p-4 text-center text-gray-500 italic">
          Las visitas domiciliarias no tienen ubicación fija para editar.
        </div>

        <div class="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
          <button type="button" @click="handleEliminarDesdeModal"
            class="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-2">
            <i class="fa-solid fa-trash"></i> Eliminar este horario
          </button>
        </div>
      </div>
    </ModalForm>

  </LayoutComponent>
</template>


<script setup>
import { onMounted, computed, ref, watch } from 'vue'
import { useHorarioStore } from '../stores/horarioStore'

// Componentes de UI
import LayoutComponent from '../components/LayoutComponent.vue'
import DoctorCalendarHorariosComponent from '../components/DoctorCalendarHorariosComponent.vue'
import ButtonComponent from '../components/ButtonComponent.vue'
import LoaderComponent from '../components/LoaderComponent.vue'
import ModalForm from '../components/ModalForm.vue'

// 1. Inicializar el Store
const horarioStore = useHorarioStore()

// 2. Crear referencias reactivas al estado del store
const horarios = computed(() => horarioStore.horarios)
const isLoading = computed(() => horarioStore.isLoading)
const error = computed(() => horarioStore.error)

const tipoAtencion = ref(true)
const piso = ref('')
const sala = ref('')

// --- ESTADO PARA EL MODAL DE EDICIÓN ---
const isEditModalOpen = ref(false)
const editingHorario = ref(null)
const editPiso = ref('')
const editSala = ref('')

watch(tipoAtencion, (esEnCentro) => {
  if (esEnCentro === false) {
    piso.value = ''
    sala.value = ''
  }
})

// 3. Cargar los datos iniciales
onMounted(() => {
  horarioStore.fetchHorarios()
})

// 4. Handlers de Eventos

const handleCrear = (timeData) => {
  //console.log('Vista: Recibido evento @crear-horario (solo tiempo)', timeData)

  const horarioData = {
    ...timeData,
    en_centro_medico: tipoAtencion.value,
  };

  if (horarioData.en_centro_medico === true) {
    const pisoVal = piso.value.trim()
    const salaVal = sala.value.trim()

    if (!pisoVal || !salaVal) {
      horarioStore.error = "Para atención en centro médico, el piso y el consultorio son obligatorios."
      alert("Para atención en centro médico, el piso y el consultorio son obligatorios.")
      return
    }

    horarioData.piso = pisoVal;
    horarioData.sala = salaVal;
  }

  horarioStore.addHorario(horarioData)
}

const handleActualizar = (horarioId, timeData) => {
  //console.log('Vista: Recibido @actualizar-horario', horarioId, timeData);

  // 1. Buscar el horario original en el store
  const horarioOriginal = horarioStore.horarios.find(h => h.id_horario === horarioId);

  if (!horarioOriginal) {
    //console.error('Vista: No se encontró el horario original para actualizar.');
    return;
  }

  // 2. Crear el payload de actualización COMPLETO
  const fullUpdateData = {
    // Datos originales que no cambian
    en_centro_medico: horarioOriginal.en_centro_medico,
    piso: horarioOriginal.piso,
    sala: horarioOriginal.sala,
    estado: horarioOriginal.estado,

    // Nuevos datos de tiempo (sobrescriben los originales)
    ...timeData
  };

  //console.log('Vista: Enviando payload de actualización completo al store', fullUpdateData);

  // 3. Enviar el payload completo al store
  horarioStore.updateHorario(horarioId, fullUpdateData);
}

// --- LÓGICA DE EDICIÓN ---

const handleEditar = (horarioId) => {
  //console.log('Vista: Abriendo modal de edición para ID:', horarioId);
  const horario = horarioStore.horarios.find(h => h.id_horario === horarioId);

  if (!horario) return;

  editingHorario.value = horario;
  editPiso.value = horario.piso || '';
  editSala.value = horario.sala || '';

  isEditModalOpen.value = true;
}

const closeEditModal = () => {
  isEditModalOpen.value = false;
  editingHorario.value = null;
  editPiso.value = '';
  editSala.value = '';
}

const guardarEdicion = async () => {
  if (!editingHorario.value) return;

  if (!editingHorario.value.en_centro_medico) {
    closeEditModal();
    return;
  }

  const updateData = {
    piso: editPiso.value,
    sala: editSala.value
  };

  try {
    await horarioStore.updateHorario(editingHorario.value.id_horario, updateData);
    closeEditModal();
  } catch (e) {
    console.error("Error al guardar edición:", e);
  }
}

const handleEliminarDesdeModal = async () => {
  if (!editingHorario.value) return;

  const id = editingHorario.value.id_horario;

  if (!confirm("¿Estás seguro de eliminar este horario?")) return;

  try {
    await horarioStore.removeHorario(id);
    closeEditModal();
  } catch (error) {
    if (error.status === 409 || error.status === '409' || error.statusCode === 409) {
      const mensaje = error.detail || "Este horario tiene citas asociadas. ¿Deseas eliminarlo de todas formas? Se notificará al paciente.";
      if (confirm(mensaje)) {
        try {
          await horarioStore.removeHorario(id, true);
          closeEditModal();
        } catch (retryError) {
          alert("No se pudo eliminar: " + (retryError.detail || retryError.message));
        }
      }
    } else {
      alert("Error al eliminar: " + (error.detail || error.message));
    }
  }
}

const handleRefresh = () => {
  horarioStore.fetchHorarios()
}
</script>