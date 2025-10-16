import { defineStore } from "pinia"

export const useAuthStore = defineStore("auth", {
    state: () => ({
        token: localStorage.getItem("access_token") || null,
        user: JSON.parse(localStorage.getItem("user")) || null,
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
        logout() {
            this.token = null
            this.user = null

            localStorage.removeItem("access_token")
            localStorage.removeItem("user")
        }
    }
})