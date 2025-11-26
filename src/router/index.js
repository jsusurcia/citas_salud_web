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
import ReportesCalificacionesView from "../views/ReportesCalificacionesView.vue"; // 🆕 AGREGADO

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            name: "home",
            redirect: (to) => {
                const authStore = useAuthStore()
                const user = authStore.user
                
                if (user && user.rol === 'personal_medico') {
                    return '/personal_med/disponibilidad'
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
            name: "validacion_personal",
            component: ValidacionPersonalView
        },
        {
            path: "/personal_med/disponibilidad",
            name: "disponibilidad_medico",
            component: DoctorsAvailabilityView
        },
        {
            path: "/personal_med/citas",
            name: "citas_medico",
            component: DoctorsAppointmentView
        },
        {
            path: "/personal_med/chats",
            name: "chat_medico",
            component: ChatView
        },
        {
            path: "/admin/especialidades",
            name: "especialidades",
            component: EspecialidadesView
        },
        {
            path: "/admin/reportes",
            name: "reportes",
            component: ReportesView
        },
        {
            path: "/admin/reportes/generador",
            name: "generador_reportes",
            component: GeneradorReportesView
        },
        //  Reportes de Calificaciones
        {
            path: "/admin/reportes/calificaciones",
            name: "reportes_calificaciones",
            component: ReportesCalificacionesView,
            meta: { 
                requiresAuth: true, 
                role: 'admin'
            }
        }
    ]
});

// Protección de rutas
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    
    const publicRoutes = ['/auth', '/pendiente']
    
    if (publicRoutes.includes(to.path)) {
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
    
    if (!authStore.isAuthenticated) {
        return next('/auth')
    }
    
    next()
});

export default router;