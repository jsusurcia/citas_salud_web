<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import ConfirmModalComponent from './ConfirmModalComponent.vue'

// Importaciones para FontAwesome
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faBars, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons'
import { faBell } from '@fortawesome/free-regular-svg-icons'
library.add(faBars, faArrowRightFromBracket, faBell)

const router = useRouter()
const authStore = useAuthStore()

// Estado del modal de confirmación
const showLogoutModal = ref(false)

const centroMedico = computed(() => authStore.centroMedico)
onMounted(() => {
    authStore.fetchCentroMedico()
})

// Obtener usuario del store
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

// Función para abrir modal de confirmación
const handleLogout = () => {
    showLogoutModal.value = true
}

// Función para cerrar el modal
const closeLogoutModal = () => {
    showLogoutModal.value = false
}

// Función para confirmar y cerrar sesión
const confirmLogout = () => {
    //console.log('🚪 Cerrando sesión...')
    authStore.logout()
    router.push('/auth')
    //console.log('✅ Sesión cerrada')
    showLogoutModal.value = false
}
</script>

<template>
    <nav class="fixed top-0 z-50 w-full bg-white border-b border-gray-200">
        <div class="px-3 py-3 lg:px-5 lg:pl-3">
            <div class="flex items-center justify-between">
                <div class="flex items-center justify-start rtl:justify-end">
                    <button data-drawer-target="logo-sidebar" data-drawer-toggle="logo-sidebar"
                        aria-controls="logo-sidebar" type="button"
                        class="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200">
                        <span class="sr-only">Open sidebar</span>
                        <font-awesome-icon :icon="['fas', 'bars']" />
                    </button>
                    <a href="#" class="flex ms-2 md:me-24">
                        <img src="/img/citas_salud_logo.png" class="h-8 me-3" alt="citas_salud_logo" />
                        <span class="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap">CitaSalud</span>
                    </a>
                </div>
                <div class="flex items-center">
                    <div class="flex items-center ms-3 space-x-5">
                        <div v-if="centroMedico" class="text-sm font-medium text-gray-700 hidden sm:block"
                            title="Centro Médico">
                            {{ centroMedico }}
                        </div>
                        <div class="rounded-lg hover:bg-gray-100 p-2">
                            <button type="button">
                                <font-awesome-icon :icon="['far', 'bell']" />
                            </button>
                        </div>
                        <div class="rounded-lg hover:bg-gray-100 p-2">
                            <button type="button" class="text-red-600" @click="handleLogout" title="Cerrar sesión">
                                <font-awesome-icon :icon="['fas', 'arrow-right-from-bracket']" />
                            </button>
                        </div>
                        <div>
                            <button type="button"
                                class="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300"
                                aria-expanded="false" data-dropdown-toggle="dropdown-user">
                                <span class="sr-only">Open user menu</span>
                                <img class="w-8 h-8 rounded-full"
                                    src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                                    alt="{{user.userName}}">
                            </button>
                        </div>
                        <div class="z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-sm shadow-sm"
                            id="dropdown-user">
                            <div class="px-4 py-3" role="none">
                                <p class="text-sm text-gray-900" role="none">
                                    {{ user.userName }}
                                </p>
                                <p class="text-sm font-medium text-gray-900 truncate" role="none">
                                    {{ user.userEmail }}
                                </p>
                            </div>
                            <ul class="py-1" role="none">
                                <li>
                                    <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        role="menuitem">Perfil</a>
                                </li>
                                <li>
                                    <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        role="menuitem">Soporte técnico</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <!-- Modal de confirmación para cerrar sesión -->
    <ConfirmModalComponent :isOpen="showLogoutModal" type="warning" title="¿Cerrar sesión?"
        description="¿Estás seguro de que deseas cerrar sesión? Tendrás que iniciar sesión nuevamente para acceder al sistema."
        confirmLabel="Sí, cerrar sesión" @confirm="confirmLogout" @close="closeLogoutModal" />
</template>


<style scoped></style>