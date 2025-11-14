import apiClient from './auth.js'

// --- FUNCIÓN CORREGIDA ---
// Llama al nuevo endpoint que trae solo las citas del calendario
export const getCitasCalendarioApi = async () => {
  try {
    // Ya no necesita personalId, el backend lo toma del token
    console.log(`🔍 Obteniendo citas del calendario...`) 
    const res = await apiClient.get(`/cita/personal/calendario`)
    
    const response = res.data
    
    if (response.status === 'success' && Array.isArray(response.data)) {
      console.log('✅ Citas de calendario encontradas:', response.data.length)
      return response.data
    } else if (Array.isArray(response)) {
      return response
    } else {
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }
  } catch (error) {
    console.error('❌ Error al obtener citas del calendario:', error)
    throw error.response?.data || { detail: error.message || 'Error al conectar' }
  }
}

// Llama al nuevo endpoint que trae solo las citas pendientes
export const getCitasPendientesApi = async () => {
  try {
    // Ya no necesita personalId, el backend lo toma del token
    console.log(`⏳ Obteniendo citas pendientes...`)
    const res = await apiClient.get(`/cita/personal/pendientes`)
    
    const response = res.data
    
    if (response.status === 'success' && Array.isArray(response.data)) {
      console.log('✅ Citas pendientes encontradas:', response.data.length)
      return response.data
    } else if (Array.isArray(response)) {
      return response
    } else {
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }
  } catch (error) {
    console.error('❌ Error al obtener citas pendientes:', error)
    throw error.response?.data || { detail: error.message || 'Error al conectar' }
  }
}
// --- El resto de funciones (aprobar, rechazar, etc.) quedan IGUAL ---

// Función para confirmar/aprobar una cita
export const aprobarCitaApi = async (citaId) => {
  try {
    console.log('✅ Confirmando cita:', citaId)
    const res = await apiClient.post(`/cita/${citaId}/confirmar`)
    const response = res.data
    if (response.status === 'success' && response.data) {
      return response.data
    } else {
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }
  } catch (error) {
    console.error('❌ Error al confirmar cita:', error)
    if (error.response?.data) {
      throw error.response.data
    }
    throw { detail: error.message || 'Error al conectar con el servidor' }
  }
}

// Función para cancelar/rechazar una cita
export const rechazarCitaApi = async (citaId) => {
  try {
    console.log('❌ Cancelando cita:', citaId)
    const res = await apiClient.post(`/cita/${citaId}/cancelar`)
    const response = res.data
    if (response.status === 'success' && response.data) {
      return response.data
    } else {
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }
  } catch (error) {
    console.error('❌ Error al cancelar cita:', error)
    if (error.response?.data) {
      throw error.response.data
    }
    throw { detail: error.message || 'Error al conectar con el servidor' }
  }
}

// Función para marcar una cita como atendida
export const atenderCitaApi = async (citaId) => {
  try {
    console.log('🏥 Marcando cita como atendida:', citaId)
    const res = await apiClient.post(`/cita/${citaId}/atender`)
    
    const response = res.data
    
    if (response.status === 'success' && response.data) {
      console.log('✅ Cita marcada como atendida exitosamente')
      return response.data
    } else {
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }
  } catch (error) {
    console.error('❌ Error al atender cita:', error)
    
    if (error.response?.data) {
      const errorData = error.response.data
      if (errorData.detail) {
        throw { detail: errorData.detail }
      }
      throw errorData
    }
    
    throw { detail: error.message || 'Error al conectar con el servidor' }
  }
}

// Función para postergar una cita
export const postergarCitaApi = async (citaId) => {
  try {
    console.log('⏰ Postergando cita:', citaId)
    const res = await apiClient.post(`/cita/${citaId}/postergar`)
    
    const response = res.data
    
    if (response.status === 'success' && response.data) {
      console.log('✅ Cita postergada exitosamente')
      return response.data
    } else {
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }
  } catch (error) {
    console.error('❌ Error al postergar cita:', error)
    
    if (error.response?.data) {
      const errorData = error.response.data
      if (errorData.detail) {
        throw { detail: errorData.detail }
      }
      throw errorData
    }
    
    throw { detail: error.message || 'Error al conectar con el servidor' }
  }
}

// Función para obtener una cita por ID
export const getCitaByIdApi = async (citaId) => {
  try {
    console.log('🔍 Obteniendo cita por ID:', citaId)
    const res = await apiClient.get(`/cita/${citaId}`)
    
    const response = res.data
    
    if (response.status === 'success' && response.data) {
      return response.data
    } else {
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }
  } catch (error) {
    console.error('❌ Error al obtener cita:', error)
    
    if (error.response?.data) {
      const errorData = error.response.data
      if (errorData.detail) {
        throw { detail: errorData.detail }
      }
      throw errorData
    }
    
    throw { detail: error.message || 'Error al conectar con el servidor' }
  }
}