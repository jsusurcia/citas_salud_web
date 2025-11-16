import { defineStore } from "pinia"
import { getCentroMedicoPorPersonalApi } from '../api/personal_medico'

export const useAuthStore = defineStore("auth", {
    state: () => ({
        token: localStorage.getItem("access_token") || null,
        user: JSON.parse(localStorage.getItem("user")) || null,
        centroMedico: null
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
    }, 
    actions: {
        login(token, user) {
            this.token = token
            this.user = user

            localStorage.setItem("access_token", token)
            localStorage.setItem("user", JSON.stringify(user))
        },
        async fetchCentroMedico() {
            // 1. Si ya lo tenemos (de una navegación anterior), no hagas la llamada de nuevo
            if (this.centroMedico) return
            
            // 2. Si no hay usuario (sesión cerrada), no hagas nada
            if (!this.user) return

            try {
                // 3. Llama a la API
                const response = await getCentroMedicoPorPersonalApi()
                // 4. Guarda el dato EN EL STORE
                this.centroMedico = response.nombre_centro_medico
            } catch (error) {
                console.error('Error al obtener centro médico en el store:', error)
                this.centroMedico = null // O un valor por defecto
            }
        },
        logout() {
            this.token = null
            this.user = null

            localStorage.removeItem("access_token")
            localStorage.removeItem("user")
        }
    }
})