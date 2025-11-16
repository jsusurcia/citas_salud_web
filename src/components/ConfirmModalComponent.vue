<script setup>
// Importar Componentes y demás
import { computed } from 'vue';
import ButtonComponent from './ButtonComponent.vue';

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'success',
    validator: (value) => ['success', 'danger', 'warning', 'info'].includes(value)
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
  },
  confirmLabel: {
    type: String,
    default: 'Confirmar'
  },
  errorMessage: {
    type: String,
    default: ''
  }
})

// Component Events
const emit = defineEmits(['confirm', 'cancel']);
const confirmModal = (event) => {
  emit('confirm', event);
};
const closeModal = (event) => {
  emit('close', event);
};

// Propiedades Computadas
const defaultIcons = {
  danger: 'fa-solid fa-triangle-exclamation',
  success: 'fa-solid fa-circle-check',
  warning: 'fa-solid fa-circle-exclamation',
  info: 'fa-solid fa-circle-info'
}

const iconColors = {
  danger: 'text-red-500',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500'
}

const buttonColors = {
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  info: 'bg-blue-600 hover:bg-blue-700 text-white'
}

const iconClass = computed(() => `${props.icon || defaultIcons[props.type]} ${iconColors[props.type]}`)
const confirmButtonClass = computed(() => buttonColors[props.type])
</script>

<template>
  <!-- Fondo translúcido oscuro -->
  <transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-[1000] flex justify-center items-center bg-black/40 backdrop-blur-sm">
      <!-- Modal -->
      <transition name="scale">
        <div class="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 animate-fade-in-up">
          <!-- Icono de advertencia -->
          <div class="flex flex-col items-center text-center">
            <i :class="iconClass" class="text-5xl mb-4"></i>

            <h3 class="text-lg font-bold text-gray-800 mb-2">{{ title }}</h3>

            <p class="text-sm text-gray-600 mb-6">{{ description }}</p>

            <!-- Mensaje de error -->
            <div v-if="errorMessage" class="w-full mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm text-center">
              {{ errorMessage }}
            </div>

            <!-- Botones -->
            <div class="flex justify-center gap-3 w-full">
              <ButtonComponent type="button" variant="secondary" size="large" label="Cancelar" @click="closeModal" />
              <ButtonComponent type="submit" :variant="type" size="large" :label="confirmLabel"
                @click="confirmModal" />
            </div>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<style scoped>
/* Animaciones suaves */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.25s ease;
}

.scale-enter-from,
.scale-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>
