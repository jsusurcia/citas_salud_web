<template>
  <LayoutComponent>
    <!-- Encabezado -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800 tracking-tight">
        Gestionar especialidades
      </h1>

      <button
        @click="openAddModal"
        class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-sm text-sm font-medium transition"
      >
        <i class="fa-solid fa-plus"></i>
        Añadir especialidad
      </button>
    </div>

    <!-- Grid de especialidades -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="especialidad in especialidades"
        :key="especialidad.id"
        class="rounded-xl border border-gray-200 shadow-sm overflow-hidden transition hover:shadow-md"
      >
        <!-- Encabezado gris -->
        <div class="bg-gray-50 p-4 flex justify-between items-start">
          <h2 class="text-lg font-semibold text-gray-900 leading-snug">
            {{ especialidad.nombre }}
          </h2>

          <span
            class="px-2 py-0.5 text-xs font-medium rounded-full"
            :class="especialidad.estado === 'Habilitado'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-600'"
          >
            {{ especialidad.estado }}
          </span>
        </div>

        <!-- Cuerpo blanco -->
        <div class="bg-white p-4 flex flex-col justify-between">
          <p class="text-sm text-gray-600 leading-relaxed mb-4">
            {{ especialidad.descripcion }}
          </p>

          <div class="flex gap-2 mt-auto">
            <button
                @click="openEditModal(especialidad)"
                class="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
            >
                <i class="fa-solid fa-pen text-xs"></i> Editar
            </button>

            <!-- Botón Deshabilitar -->
            <button
                @click="openConfirmModal(especialidad)"
                v-if="especialidad.estado === 'Habilitado'"
                class="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm font-medium bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition"
            >
                <i class="fa-solid fa-ban text-xs"></i> Deshabilitar
            </button>

            <!-- Botón Habilitar -->
            <button
                @click="handleEnable(especialidad)"
                v-else
                class="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm font-medium bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition"
            >
                <i class="fa-solid fa-check text-xs"></i> Habilitar
            </button>
            </div>

        </div>
      </div>
    </div>

    <!-- MODAL: CREAR -->
    <ModalForm
      title="Nueva especialidad"
      :isOpen="isAddModalOpen"
      @close="isAddModalOpen = false"
      @submit="handleCreate"
    >
      <div>
        <label for="nombre" class="block mb-2 text-sm font-medium text-gray-900">
          Nombre de la especialidad
        </label>
        <input
          id="nombre"
          v-model="form.nombre"
          type="text"
          placeholder="Ej. Medicina general"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
          required
        />
      </div>

      <div>
        <label for="descripcion" class="block mb-2 text-sm font-medium text-gray-900">
          Descripción de la especialidad
        </label>
        <textarea
          id="descripcion"
          v-model="form.descripcion"
          rows="3"
          placeholder="Resumen de las principales funciones y enfermedades que trata esta especialidad"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
        ></textarea>
      </div>
    </ModalForm>

    <!-- MODAL: EDITAR -->
    <ModalForm
      title="Editar especialidad"
      :isOpen="isEditModalOpen"
      @close="isEditModalOpen = false"
      @submit="handleEdit"
    >
      <div>
        <label for="edit-nombre" class="block mb-2 text-sm font-medium text-gray-900">
          Nombre de la especialidad
        </label>
        <input
          id="edit-nombre"
          v-model="form.nombre"
          type="text"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
          required
        />
      </div>

      <div>
        <label for="edit-descripcion" class="block mb-2 text-sm font-medium text-gray-900">
          Descripción de la especialidad
        </label>
        <textarea
          id="edit-descripcion"
          v-model="form.descripcion"
          rows="3"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
        ></textarea>
      </div>
    </ModalForm>
    <ConfirmModalComponent
        :isOpen="isConfirmModalOpen"
        :type="actionType === 'Deshabilitar' ? 'danger' : 'success'"
        :title="`¿Está seguro de ${actionType.toLowerCase()} esta especialidad?`"
        :description="
            actionType === 'Deshabilitar'
            ? 'Esta acción deshabilitará la especialidad y dejará de estar disponible para asignaciones o uso activo. Puedes volver a habilitarla más adelante si lo deseas.'
            : 'Esta acción habilitará la especialidad y volverá a estar disponible para asignaciones o uso activo.'
        "
        @confirm="handleConfirmDisable"
        @cancel="isConfirmModalOpen = false"
        />


  </LayoutComponent>
</template>


<script setup>
import { ref } from 'vue'
import LayoutComponent from '../components/LayoutComponent.vue'
import ModalForm from '../components/ModalForm.vue'
import ConfirmModalComponent from '../components/ConfirmModalComponent.vue'

const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isConfirmModalOpen = ref(false)
const form = ref({ nombre: '', descripcion: '' })
const selectedEspecialidad = ref(null)
const selectedToDisable = ref(null)
const actionType = ref('')


const especialidades = ref([
  {
    id: 1,
    nombre: 'Medicina General',
    descripcion:
      'Prevención, diagnóstico y tratamiento de enfermedades comunes, atención para todas las edades.',
    estado: 'Habilitado'
  },
  {
    id: 2,
    nombre: 'Pediatría',
    descripcion:
      'Prevención, diagnóstico y tratamiento de enfermedades infantiles, seguimiento del crecimiento y desarrollo.',
    estado: 'Deshabilitado'
  },
  {
    id: 3,
    nombre: 'Cardiología',
    descripcion:
      'Prevención, diagnóstico y tratamiento de enfermedades cardiovasculares, evaluación del riesgo cardíaco.',
    estado: 'Habilitado'
  }
])

// Abrir modal de agregar
const openAddModal = () => {
  form.value = { nombre: '', descripcion: '' }
  isAddModalOpen.value = true
}

// Crear
const handleCreate = () => {
  if (!form.value.nombre.trim()) return
  especialidades.value.push({
    id: especialidades.value.length + 1,
    nombre: form.value.nombre,
    descripcion: form.value.descripcion,
    estado: 'Habilitado'
  })
  isAddModalOpen.value = false
}

// Abrir modal de editar
const openEditModal = (especialidad) => {
  selectedEspecialidad.value = especialidad
  form.value = { ...especialidad }
  isEditModalOpen.value = true
}

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
  isEditModalOpen.value = false
}

// Habilitar directamente SIN modal
const handleEnable = (especialidad) => {
  const index = especialidades.value.findIndex(e => e.id === especialidad.id)
  if (index !== -1) {
    especialidades.value[index] = {
      ...especialidades.value[index],
      estado: 'Habilitado'
    }
  }
}


// Abrir modal de confirmación solo si está habilitado
const openConfirmModal = (especialidad) => {
  if (especialidad.estado === 'Habilitado') {
    selectedToDisable.value = especialidad
    actionType.value = 'Deshabilitar'
    isConfirmModalOpen.value = true
  } else {
    // Si está deshabilitado, lo habilitamos directamente sin confirmar
    especialidad.estado = 'Habilitado'
  }
}

// Confirmar deshabilitación
const handleConfirmDisable = () => {
  if (!selectedToDisable.value) return

  selectedToDisable.value.estado = 'Deshabilitado'
  isConfirmModalOpen.value = false
}
</script>