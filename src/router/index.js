import { createRouter, createWebHistory } from "vue-router";
import AuthView from "../views/AuthView.vue";
import PendienteEvaluacionView from "../views/PendienteEvaluacionView.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/auth",
            name: "auth",
            component: AuthView
        },
        {
            path: "/pendiente",
            name: "pendiente",
            component: PendienteEvaluacionView
        }
    ]
});

export default router;