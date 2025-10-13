import { createRouter, createWebHistory } from "vue-router";
import AuthView from "../views/AuthView.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/auth",
            name: "auth",
            component: AuthView
        }
    ]
});

export default router;