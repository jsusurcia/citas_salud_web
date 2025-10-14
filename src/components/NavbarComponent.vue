<script setup>
// Definición de Props
defineProps({
    user: {
        userName: String,
        userEmail: String
    }
})

// Importaciones para FontAwesome
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faBars, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons'
import { faBell } from '@fortawesome/free-regular-svg-icons'
library.add(faBars, faArrowRightFromBracket, faBell)
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
                        <span class="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap">CitasSalud</span>
                    </a>
                </div>
                <div class="flex items-center">
                    <div class="flex items-center ms-3 space-x-5">
                        <div class="rounded-lg hover:bg-gray-100 p-2">
                            <button type="button">
                                <font-awesome-icon :icon="['far', 'bell']" />
                            </button>
                        </div>
                        <div class="rounded-lg hover:bg-gray-100 p-2">
                            <button type="button" class="text-red-600">
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
</template>


<style scoped>
</style>