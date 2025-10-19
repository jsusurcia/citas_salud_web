<script setup>
import { ref } from 'vue'

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

const emit = defineEmits(['close', 'submit'])

const closeModal = () => emit('close')
const handleSubmit = () => emit('submit')
</script>

<template>
  <!-- Fondo oscuro y modal centrado -->
  <transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <!-- Contenedor del modal -->
      <transition name="scale">
        <div
          class="relative w-full max-w-md bg-white rounded-2xl shadow-lg p-6 animate-fade-in-up"
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-gray-800">
              {{ title }}
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition"
            >
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          <!-- Body (slot para contenido) -->
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <slot></slot>

            <!-- Footer -->
            <div class="flex justify-end gap-2 pt-2">
              <button
                type="button"
                @click="closeModal"
                class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-5 py-2.5 text-sm font-medium text-white bg-[#10A697] hover:bg-[#0e8e85] rounded-lg transition"
              >
                Guardar
              </button>
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
