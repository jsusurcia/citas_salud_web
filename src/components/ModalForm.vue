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

const closeModal = () => {
  emit('close')
}

const handleSubmit = () => {
  emit('submit')
}
</script>

<template>
  <div v-if="isOpen"
    class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-full bg-gray-400 bg-opacity-50">
    <div class="relative p-4 w-full max-w-md max-h-full">
      <div class="relative bg-white rounded-lg shadow">
        
        <!-- Header -->
        <div class="flex items-center justify-between p-5 pb-0">
          <h3 class="text-lg font-bold text-gray-700">{{ title }}</h3>
          <button type="button" 
            @click="closeModal"
            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center">
            <i class="fa-solid fa-xmark"></i>
            <span class="sr-only">Cerrar modal</span>
          </button>
        </div>

        <!-- Body (SLOT para contenido personalizado) -->
        <form @submit.prevent="handleSubmit" class="p-4 md:p-5">
          <div class="grid gap-4 mb-4">
            <slot></slot> <!-- Aquí va el contenido dinámico -->
          </div>

          <!-- Footer -->
          <div class="flex justify-end gap-2">
            <button type="button" 
              @click="closeModal"
              class="text-gray-900 bg-gray-100 hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5">
              Cancelar
            </button>
            <button type="submit" 
              class="text-white bg-[#10A697] hover:bg-[#0e8e85] focus:ring-4 focus:outline-none focus:ring-[#0e8e85] font-medium rounded-lg text-sm px-5 py-2.5">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>