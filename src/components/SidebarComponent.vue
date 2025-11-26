<script setup>
// Importaciones para FontAwesome
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faVialCircleCheck, faUserDoctor, faChartSimple, faClock, faCalendar, faComment } from '@fortawesome/free-solid-svg-icons'
library.add(faVialCircleCheck, faUserDoctor, faChartSimple, faClock, faCalendar, faComment)

// Definición de Props
defineProps({
    menuItems: {
        type: Array,
        required: true
    }
})
</script>

<template>
  <aside id="logo-sidebar"
    class="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0"
    aria-label="Sidebar">
    <div class="h-full px-3 pb-4 overflow-y-auto bg-white">
      <ul class="space-y-2 font-medium">
        <!-- Ahora hacemos un v-for para iterar sobre los items que recibimos -->
        <li v-for="item in menuItems" :key="item.id">
          <router-link 
            :to="item.route"
            class="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
            <!-- Icono dinámico según el item -->
            <font-awesome-icon 
              :icon="['fas', item.icon]"
              class="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" 
            />
            <span class="ms-3">{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </div>
  </aside>
</template>

<style scoped>
</style>