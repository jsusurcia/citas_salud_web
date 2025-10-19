<script setup>
import { ref } from 'vue'
import LayoutComponent from '../components/LayoutComponent.vue'
import ModalForm from '../components/ModalForm.vue'
import ConfirmModalComponent from '../components/ConfirmModalComponent.vue'
import ButtonComponent from '../components/ButtonComponent.vue'
import EspecialidadCardComponent from '../components/EspecialidadCardComponent.vue'

const activeModal = ref(null)
const selectedEspecialidad = ref(null)
const form = ref({ nombre: '', descripcion: '' })
// const selectedEspecialidad = ref(null)
// const selectedToDisable = ref(null)
// const actionType = ref('')

const especialidades = ref([
  {
    id: 1,
    nombre: 'Medicina General',
    descripcion: 'Prevención, diagnóstico y tratamiento de enfermedades comunes, atención para todas las edades.',
    habilitada: true
  },
  {
    id: 2,
    nombre: 'Pediatría',
    descripcion: 'Prevención, diagnóstico y tratamiento de enfermedades infantiles, seguimiento del crecimiento y desarrollo.',
    habilitada: false
  },
  {
    id: 3,
    nombre: 'Cardiología',
    descripcion: 'Prevención, diagnóstico y tratamiento de enfermedades cardiovasculares, evaluación del riesgo cardíaco.',
    habilitada: true
  }
]);

// Abrir modal de agregar
const closeModal = () => {
  activeModal.value = null
  selectedEspecialidad.value = null // Limpiamos la selección al cerrar
};

const openAddModal = () => {
  form.value = { nombre: '', descripcion: '' } // Reseteamos el formulario
  activeModal.value = 'add'
};

// Crear especialidad
const handleCreate = () => {
  if (!form.value.nombre.trim()) return
  especialidades.value.push({
    id: especialidades.value.length + 1,
    nombre: form.value.nombre,
    descripcion: form.value.descripcion,
    habilitada: true
  })
  closeModal()
};

// Abrir modal de editar
const openEditModal = (especialidad) => {
  selectedEspecialidad.value = especialidad
  form.value = { ...especialidad } // Copiamos los datos al formulario
  activeModal.value = 'edit'
};

// Guardar edición
const handleEdit = () => {
  if (!selectedEspecialidad.value) return
  const index = especialidades.value.findIndex(e => e.id === selectedEspecialidad.value.id)
  if (index !== -1) {
    especialidades.value[index] = {
      ...especialidades.value[index],
      nombre: form.value.nombre,
      descripcion: form.value.descripcion
    }
  }
  closeModal()
};

// Abrir modal de confirmación para deshabilitar
const openConfirmModal = (especialidad) => {
  selectedEspecialidad.value = especialidad
  // Decidimos qué modal abrir basado en el estado actual
  activeModal.value = especialidad.habilitada ? 'disableConfirm' : 'enableConfirm'
};

const handleToggleStatus = () => {
  if (!selectedEspecialidad.value) return
  const index = especialidades.value.findIndex(e => e.id === selectedEspecialidad.value.id)
  if (index !== -1) {
    // Invertimos el estado
    especialidades.value[index].habilitada = !especialidades.value[index].habilitada
  }
  closeModal()
}
</script>

<template>
  <LayoutComponent>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-gray-700">Gestionar especialidades</h1>
      <ButtonComponent 
        type="button" 
        variant="primary" 
        size="large" 
        icon="fa-solid fa-plus" 
        label="Añadir especialidad"
        @click="openAddModal" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <EspecialidadCardComponent 
        v-for="especialidad in especialidades" 
        :key="especialidad.id"
        :title="especialidad.nombre" 
        :description="especialidad.descripcion" 
        :is-enabled="especialidad.habilitada"
        @edit="openEditModal(especialidad)" 
        @disable="openConfirmModal(especialidad)" 
        @enable="openConfirmModal(especialidad)" 
      />
    </div>

    <ModalForm 
      title="Nueva especialidad" 
      :isOpen="activeModal === 'add'" 
      @close="closeModal"
      @submit="handleCreate">
      <div>
        <label for="nombre" class="block mb-2 text-sm font-medium text-gray-900">Nombre</label>
        <input id="nombre" v-model="form.nombre" type="text" placeholder="Ej. Medicina general" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5" required />
      </div>
      <div>
        <label for="descripcion" class="block mb-2 text-sm font-medium text-gray-900">Descripción</label>
        <textarea id="descripcion" v-model="form.descripcion" rows="3" placeholder="Resumen de las funciones..." class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"></textarea>
      </div>
    </ModalForm>

    <ModalForm 
      title="Editar especialidad" 
      :isOpen="activeModal === 'edit'" 
      @close="closeModal"
      @submit="handleEdit">
      <div>
        <label for="edit-nombre" class="block mb-2 text-sm font-medium text-gray-900">Nombre</label>
        <input id="edit-nombre" v-model="form.nombre" type="text" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5" required />
      </div>
      <div>
        <label for="edit-descripcion" class="block mb-2 text-sm font-medium text-gray-900">Descripción</label>
        <textarea id="edit-descripcion" v-model="form.descripcion" rows="3" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"></textarea>
      </div>
    </ModalForm>

    <ConfirmModalComponent 
      :isOpen="activeModal === 'disableConfirm'" 
      type="danger"
      title="¿Deshabilitar esta especialidad?" 
      description="La especialidad dejará de estar disponible para asignaciones. Podrás volver a habilitarla más adelante."
      @confirm="handleToggleStatus" 
      @close="closeModal" />

    <ConfirmModalComponent 
      :isOpen="activeModal === 'enableConfirm'" 
      type="success"
      title="¿Habilitar esta especialidad?" 
      description="La especialidad volverá a estar disponible para asignaciones y uso activo en el sistema."
      @confirm="handleToggleStatus" 
      @close="closeModal" />

  </LayoutComponent>
</template>