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