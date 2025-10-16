<script setup>
// Importaciones para FontAwesome
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faFilter, faFilePdf, faFileExcel, faPlus, faCheck, faXmark, faPenToSquare, faBan } from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';

library.add(faFilter, faFilePdf, faFileExcel, faPlus, faCheck, faXmark, faPenToSquare, faBan);

// Definición de Props
const props = defineProps({
  type: {
    type: String,
    default: 'button'
  },
  variant: {
    type: String,
    default: 'primary', // primary, secondary, success, danger, warning, edit, disable, enable
    validator: (value) => [
      'primary', 
      'secondary', 
      'success', 
      'danger', 
      'warning', 
      'edit', 
      'disable', 
      'enable'
    ].includes(value)
  },
  size: {
    type: String,
    default: 'medium', // small, medium, large
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  icon: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  modalTarget: {
    type: String,
    default: null
  },
  modalToggle: {
    type: String,
    default: null
  }
});

// Component Events
const emit = defineEmits(['click']);
const handleClick = (event) => {
  emit('click', event);
};

// Propiedades Computadas
const buttonClasses = computed(() => {
  const baseClasses = 'font-medium rounded-lg inline-flex items-center justify-center gap-2 focus:ring-4 focus:outline-none';
  
  // Tamaños
  const sizeClasses = {
    small: 'text-xs px-3 py-2',
    medium: 'text-sm px-4 py-2',
    large: 'text-sm px-5 py-2.5'
  };
  
  // Variantes
  const variantClasses = {
    primary: 'text-white bg-[#10A697] hover:bg-[#0e8e85] focus:ring-[#0e8e85]',
    secondary: 'text-gray-900 bg-gray-100 hover:bg-gray-200 focus:ring-gray-100',
    success: 'text-white bg-green-600 hover:bg-green-700 focus:ring-green-600',
    danger: 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-600',
    warning: 'text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500',
    edit: 'text-gray-900 bg-gray-100 hover:bg-gray-200 focus:ring-gray-100 font-normal',
    disable: 'text-red-800 bg-red-100 hover:bg-red-200 focus:ring-red-100 font-normal',
    enable: 'text-green-800 bg-green-100 hover:bg-green-200 focus:ring-green-100 font-normal'
  };
  
  return `${baseClasses} ${sizeClasses[props.size]} ${variantClasses[props.variant]}`;
});
</script>

<template>
  <button
    :type="type"
    :class="buttonClasses"
    :data-modal-target="modalTarget"
    :data-modal-toggle="modalToggle"
    @click="handleClick"
  >
    
    <FontAwesomeIcon v-if="icon" :icon="icon" />
    <span v-if="label">{{ label }}</span>
    <slot v-else></slot>
  </button>
</template>

<style scoped>
</style>