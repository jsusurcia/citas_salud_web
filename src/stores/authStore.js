import { defineStore } from "pinia"
import { getCentroMedicoPorPersonalApi } from '../api/personal_medico'

export const useAuthStore = defineStore("auth", {
    state: () => ({
        token: localStorage.getItem("access_token") || null,
        // Aquí se guardará todo el objeto 'personal_medico' incluido 'id_chat_actual'
        user: JSON.parse(localStorage.getItem("user")) || null,
        centroMedico: null
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
        
        currentUserIdForChat: (state) => {
            if (!state.user) return null;
            const idToUse = state.user.id_chat_actual || state.user.id;
            return idToUse ? idToUse.toString() : null;
        }
    }, 
    actions: {
        login(token, user) {
            this.token = token
            this.user = user

            localStorage.setItem("access_token", token)
            localStorage.setItem("user", JSON.stringify(user))
        },
        async fetchCentroMedico() {
            if (this.centroMedico) return
            if (!this.user) return

            try {
                const response = await getCentroMedicoPorPersonalApi()
                this.centroMedico = response.nombre_centro_medico
            } catch (error) {
                //console.error('Error al obtener centro médico en el store:', error)
                this.centroMedico = null
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