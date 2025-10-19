<script setup>
// Importar Componentes
import { ref } from 'vue'
import ButtonComponent from './ButtonComponent.vue'

// Props
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  isOpen: {
    type: Boolean,
    default: false
  }
})

// Component Events
const emit = defineEmits(['close', 'submit'])
const closeModal = (event) => {
  emit('close', event);
};
const submitModal = (event) => {
  emit('submit', event);
};
</script>

<template>
  <!-- Fondo oscuro y modal centrado -->
  <transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <!-- Contenedor del modal -->
      <transition name="scale">
        <div class="relative w-full max-w-md bg-white rounded-2xl shadow-lg p-2 animate-fade-in-up">
          <!-- Header -->
          <div class="flex items-center justify-between p-5 pb-0">
            <h3 class="text-lg font-bold text-gray-700">
              {{ title }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition">
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          <!-- Body (slot para contenido) -->
          <form @submit.prevent="submitModal" class="p-4 md:p-5">
            <!-- Cuerpo Formulario -->
            <div class="grid gap-4 mb-4">
              <slot>
                <!-- Aquí van los inputs pertenecientes al formulario -->
              </slot>
            </div>

            <!-- Footer -->
            <div class="flex justify-end gap-2">
              <ButtonComponent type="button" variant="secondary" size="large" label="Cancelar" @click="closeModal" />
              <ButtonComponent type="submit" variant="primary" size="large" label="Guardar" />
            </div>
          </form>
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
