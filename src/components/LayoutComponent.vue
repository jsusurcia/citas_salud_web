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

// Script para utilizar Flowbite
import { onMounted } from 'vue'
import { initFlowbite } from 'flowbite'

onMounted(() => {
    initFlowbite();
})

// Usuario de prueba
const user = {
    userName: "Jesus Urcia",
    userEmail: "urciajesus72@gmail.com",
    userRole: "admin"
}
const menuItems = useMenuItems(user.userRole)
</script>

<template>
    <NavbarComponent :user="user" />
    <SidebarComponent :menuItems="menuItems" />
    <div class="p-4 sm:ml-64">
        <div class="p-4 border-gray-200 mt-14">
            <slot></slot>
        </div>
    </div>
</template>

<style scoped>
</style>