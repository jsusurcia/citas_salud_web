<script setup>
// Importaciones para FontAwesome
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faClock } from '@fortawesome/free-regular-svg-icons'
library.add(faClock)

// Importación de Componentes
import NavbarComponent from '../components/NavbarComponent.vue'
import SidebarComponent from '../components/SidebarComponent.vue'
import { useMenuItems } from '../composables/useMenuItems'
import { useAuthStore } from '../stores/authStore'
import { computed } from 'vue'

// Script para utilizar Flowbite
import { onMounted } from 'vue'
import { initFlowbite } from 'flowbite'

const authStore = useAuthStore()

// Usuario del store de autenticación
const user = computed(() => {
  if (authStore.user) {
    return {
      userName: authStore.user.nombre || authStore.user.nombres || authStore.user.name || 'Usuario',
      userEmail: authStore.user.correo || authStore.user.email || ''
    }
  }
  return {
    userName: 'Usuario',
    userEmail: ''
  }
})

// Rol del usuario para el menú
const userRole = computed(() => {
  return authStore.user?.rol || 'personal_medico'
})

const menuItems = computed(() => useMenuItems(userRole.value))

onMounted(() => {
    initFlowbite();
})
</script>

<template>
    <NavbarComponent />
    <SidebarComponent :menuItems="menuItems" />
    <div class="p-4 sm:ml-64">
        <div class="p-4 border-gray-200 mt-14">
            <slot></slot>
        </div>
    </div>
</template>

<style scoped>
</style>