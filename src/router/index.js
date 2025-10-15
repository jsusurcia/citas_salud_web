import { createRouter, createWebHistory } from "vue-router";
import AuthView from "../views/AuthView.vue";
import PendienteEvaluacionView from "../views/PendienteEvaluacionView.vue";
import ValidacionPersonalView from "../views/ValidacionPersonalView.vue"
import DoctorsAvailabilityView from "../views/DoctorsAvailabilityView.vue";
import DoctorsAppointmentView from "../views/DoctorsAppointmentView.vue";
import ChatView from "../views/ChatView.vue";

/* Implementar en la autenticación cuando se implemente
const router = [
    { path: '/', redirect: '/auth' },
    {
        path: '/auth',
        name: 'auth',
        component: AuthView,
        children: [
            { path: 'validacion_personal', component: ValidacionPersonalView },
            { path: 'pendiente', component: PendienteEvaluacionView },
        ],
        meta: { requiresAuth: true }
    },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

*/

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
        },
        {
            path: "/validacion_personal",
            "name": "validacion_personal",
            component: ValidacionPersonalView
        },
        {
            path: "/disponibilidad_medico",
            "name": "disponibilidad_medico",
            component: DoctorsAvailabilityView
        },
        {
            path: "/citas_medico",
            "name": "citas_medico",
            component: DoctorsAppointmentView
        },
        {
            path: "/chat_medico",
            "name": "chat_medico",
            component: ChatView
        },
    ]
});

export default router;