<script setup>
//Importaciones para FontAwesome
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faTriangleExclamation, faCircleCheck, faCircleExclamation, faCircleInfo, faXmark } from '@fortawesome/free-solid-svg-icons';

import ButtonComponent from '../components/ButtonComponent.vue';

import { computed } from 'vue';

const props = defineProps({
  modalId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'danger',
    validator: (value) => ['danger', 'success', 'warning', 'info'].includes(value)
  },
  icon: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['confirm', 'cancel']);

// Configuración de iconos por defecto según el tipo
const defaultIcons = {
  danger: 'fa-solid fa-triangle-exclamation',
  success: 'fa-solid fa-circle-check',
  warning: 'fa-solid fa-circle-exclamation',
  info: 'fa-solid fa-circle-info'
};

// Configuración de colores de icono según el tipo
const iconColors = {
  danger: 'text-red-400',
  success: 'text-green-400',
  warning: 'text-yellow-400',
  info: 'text-blue-400'
};

// Configuración de estilos de botón de confirmación según el tipo
const confirmButtonStyles = {
  danger: 'text-red-800 bg-red-100 hover:bg-red-200 focus:ring-red-100',
  success: 'text-green-800 bg-green-100 hover:bg-green-200 focus:ring-green-100',
  warning: 'text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:ring-yellow-100',
  info: 'text-blue-800 bg-blue-100 hover:bg-blue-200 focus:ring-blue-100'
};

const iconClasses = computed(() => {
  const iconClass = props.icon || defaultIcons[props.type];
  const colorClass = iconColors[props.type];
  return `${iconClass} ${colorClass}`;
});

const confirmButtonClasses = computed(() => {
  return confirmButtonStyles[props.type];
});

const handleConfirm = () => {
  emit('confirm');
};
</script>

<template>
  <div
    :id="modalId"
    tabindex="-1"
    class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
  >
    <div class="relative p-4 w-full max-w-md max-h-full">
      <div class="relative bg-white rounded-lg shadow-sm">
        <!-- Botón de cierre -->
        <button
          type="button"
          class="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
          :data-modal-hide="modalId"
        >
          <i class="fa-solid fa-xmark"></i>
          <span class="sr-only">Cerrar modal</span>
        </button>

        <div class="p-4 md:p-5 text-center">
          <!-- Ícono -->
          <i :class="iconClasses" class="text-5xl mb-4"></i>

          <!-- Título -->
          <h3 class="text-lg font-bold text-gray-700 mb-4">
            {{ title }}
          </h3>

          <!-- Texto descriptivo -->
          <p class="mb-6 text-sm text-gray-600">
            {{ description }}
          </p>

          <!-- Botones -->
          <div class="flex flex-column justify-center gap-2">
            <button
              type="button"
              class="text-gray-900 bg-gray-100 hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-10 py-2.5 inline-flex items-center justify-center gap-2"
              :data-modal-hide="modalId"
            >
              Cancelar
            </button>
            <button
              type="button"
              :class="confirmButtonClasses"
              class="font-medium rounded-lg text-sm px-10 py-2.5 inline-flex items-center justify-center gap-2 focus:ring-4 focus:outline-none"
              @click="handleConfirm"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>