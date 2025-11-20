import apiClient from './auth.js'

//Función para obtener el KPI 1
export const getPendientesApi = async () => {
    try {
        const res = await apiClient.get('/administrador/kpi/pending_requests')
        const response = res.data

        if (response.status === 'success' && Number.isInteger(response.data)) {
            return response.data
        } else if (Number.isInteger(response.data)) {
            // Si viene el número directamente sin el wrapper ItemResponse
            return response.data
        } else {
            throw { detail: 'Formato de respuesta inesperado del servidor' }
        }
    } catch (error) {
        console.error('Error al obtener pendientes:', error)
        throw error.response?.data || { detail: error.message || 'Error al conectar' }
    }
}

//Función para obtener el KPI 2
export const getAprobadosHoyApi = async () => {
    try {
        const res = await apiClient.get('/administrador/kpi/approved_requests')
        const response = res.data

        if (response.status === 'success' && Number.isInteger(response.data)) {
            return response.data
        } else if (Number.isInteger(response.data)) {
            // Si viene el número directamente sin el wrapper ItemResponse
            return response.data
        } else {
            throw { detail: 'Formato de respuesta inesperado del servidor' }
        }
    } catch (error) {
        console.error('Error al obtener aprobados hoy:', error)
        throw error.response?.data || { detail: error.message || 'Error al conectar' }
    }
}

//Función para obtener el KPI 3
export const getRechazadosHoyApi = async () => {
    try {
        const res = await apiClient.get('/administrador/kpi/rejected_requests')
        const response = res.data

        if (response.status === 'success' && Number.isInteger(response.data)) {
            return response.data
        } else if (Number.isInteger(response.data)) {
            // Si viene el número directamente sin el wrapper ItemResponse
            return response.data
        } else {
            throw { detail: 'Formato de respuesta inesperado del servidor' }
        }
    } catch (error) {
        console.error('Error al obtener rechazados hoy:', error)
        throw error.response?.data || { detail: error.message || 'Error al conectar' }
    }
}

//Función para mostrar las solicitudes pendientes (Tabla)
export const getSolicitudesPendientesApi = async () => {
    try{
        const res = await apiClient.get('/administrador/pending_requests')
        const response = res.data

        if (response.status === 'success' && Array.isArray(response.data)) {
            return response.data
        } else if (Array.isArray(response.data)) {
            return response.data
        } else {
            throw { detail: 'Formato de respuesta inesperado del servidor' }
        }
    } catch (error) {
        console.error('Error al obtener solicitudes pendientes:', error)
        throw error.response?.data || { detail: error.message || 'Error al conectar' }
    }
}

//Función para aprobar una solicitud
export const aprobarSolicitudApi = async (idPersonalEspecialidad) => {
    try {
        // El ID se interpola en la URL usando template literals
        const res = await apiClient.post(`/administrador/validar_personal/${idPersonalEspecialidad}`)
        const response = res.data

        if (response.status === 'success' && response.data) {
            return response.data
        } else if (response.status === 'success') {
            // Si solo viene el status sin data
            return response
        } else {
            throw { detail: 'Formato de respuesta inesperado del servidor' }
        }
    } catch (error) {
        console.error('Error al aprobar solicitud:', error)
        throw error.response?.data || { detail: error.message || 'Error al conectar' }
    }
}

//Función para rechazar una solicitud
export const rechazarSolicitudApi = async (idPersonalEspecialidad) => {
    try {
        //El ID se interpola en la URL
        const res = await apiClient.post(`/administrador/rechazar_personal/${idPersonalEspecialidad}`)
        const response = res.data

        if (response.status === 'success' && response.data) {
            return response.data
        } else if (response.status === 'success') {
            return response
        } else {
            throw { detail: 'Formato de respuesta inesperado del servidor' }
        }
    } catch (error) {
        console.error('Error al rechazar solicitud:', error)
        throw error.response?.data || { detail: error.message || 'Error al conectar' }
    }
}