import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from '../stores/authStore';

import AuthView from "../views/AuthView.vue";
import PendienteEvaluacionView from "../views/PendienteEvaluacionView.vue";
import ValidacionPersonalView from "../views/ValidacionPersonalView.vue"
import DoctorsAvailabilityView from "../views/DoctorsAvailabilityView.vue";
import DoctorsAppointmentView from "../views/DoctorsAppointmentView.vue";
import ChatView from "../views/ChatView.vue";
import EspecialidadesView from "../views/EspecialidadesView.vue";
import ReportesView from "../views/ReportesView.vue";
import GeneradorReportesView from "../views/GeneradorReportesView.vue";

// Implementar en la autenticación cuando se implemente
// const routes = [
//     { path: '/auth', component: AuthView },
//     {
//         path: '/',
//         component: PendienteEvaluacionView,
//         children: [
//             { path: 'validacion_personal', component: ValidacionPersonalView },
//             { path: 'pendiente', component: PendienteEvaluacionView },
//             { path: 'disponibilidad_medico', component: DoctorsAvailabilityView },
//             { path: 'citas_medico', component: DoctorsAppointmentView },
//             { path: 'chat_medico', component: ChatView },
//         ],
//         meta: { requiresAuth: true }
//     },
// ]

// const router = createRouter({
//     history: createWebHistory(),
//     routes,
// });

// router.beforeEach((to, from, next) => {
//     const authStore = useAuthStore()
//     if (to.meta.requiresAuth && !authStore.isAuthenticated) {
//         next('/auth')
//     } else {
//         next()
//     }
// })

// export default router




const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            name: "home",
            redirect: (to) => {
                // Redirigir según el rol del usuario
                const authStore = useAuthStore()
                const user = authStore.user
                
                if (user && user.rol === 'personal_medico') {
                    return '/personal/disponibilidad_personal_med'
                } else if (user && user.rol === 'admin') {
                    return '/admin/validacion'
                } else {
                    return '/auth'
                }
            }
        },
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
            path: "/admin/validacion",
            "name": "validacion_personal",
            component: ValidacionPersonalView
        },
        {
            path: "/personal_med/disponibilidad",
            "name": "disponibilidad_medico",
            component: DoctorsAvailabilityView
        },
        {
            path: "/personal_med/citas",
            "name": "citas_medico",
            component: DoctorsAppointmentView
        },
        {
            path: "/personal_med/chats",
            "name": "chat_medico",
            component: ChatView
        },
        {
            path: "/admin/especialidades",
            "name" : "especialidades",
            component : EspecialidadesView
        },
        {
            path: "/admin/reportes",
            "name": "reportes",
            component: ReportesView
        },
        {
            path: "/admin/reportes/generador",
            "name": "generador_reportes",
            component: GeneradorReportesView
        },
    ]
});

// Protección de rutas
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    
    // Rutas públicas (no requieren autenticación)
    const publicRoutes = ['/auth']
    
    // Si la ruta es pública, permitir acceso
    if (publicRoutes.includes(to.path)) {
        // Si ya está autenticado y va a /auth, redirigir a su dashboard
        if (authStore.isAuthenticated) {
            const user = authStore.user
            if (user && user.rol === 'personal_medico') {
                return next('/personal_med/disponibilidad')
            } else if (user && user.rol === 'admin') {
                return next('/admin/validacion')
            }
        }
        return next()
    }
    
    // Si no está autenticado, redirigir a login
    if (!authStore.isAuthenticated) {
        return next('/auth')
    }
    
    // Permitir acceso
    next()
});

export default router;