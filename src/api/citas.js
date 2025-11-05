import apiClient from './auth.js'

// --- FUNCIÓN MODIFICADA ---
// Ahora llama al nuevo endpoint /cita/personal/{personalId}
export const getCitasApi = async (personalId) => {
  try {
    console.log(`🔍 Obteniendo citas del personal médico ID: ${personalId}`)
    // Llama al nuevo endpoint que filtra por ID en el backend
    const res = await apiClient.get(`/cita/personal/${personalId}`)
    
    const response = res.data
    
    // El backend ya devuelve ItemListResponse
    if (response.status === 'success' && Array.isArray(response.data)) {
      console.log('✅ Formato ItemListResponse correcto')
      return response.data // Devuelve los datos directamente
    } 
    // Manejo de fallback por si la API devuelve solo el array
    else if (Array.isArray(response)) {
      console.warn('⚠️ Respuesta de API directa (array), se esperaba ItemListResponse')
      return response
    } else {
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }
  } catch (error) {
    console.error('❌ Error al obtener citas:', error)
    throw error.response?.data || { detail: error.message || 'Error al conectar con el servidor' }
  }
}

// --- FUNCIÓN MODIFICADA ---
// Ahora simplemente filtra la lista que ya obtuvimos (mucho más rápido)
export const getCitasPendientesApi = async (personalId) => {
  try {
    console.log('⏳ Obteniendo citas pendientes...')
    // 1. Obtenemos la lista ya filtrada por médico
    const todasLasCitasDelMedico = await getCitasApi(personalId)
    
    // 2. Filtramos solo por estado en el frontend
    const citasPendientes = todasLasCitasDelMedico.filter(c => {
      const estado = c.estado?.toLowerCase() || c.estado_cita?.toLowerCase() || ''
      return estado === 'pendiente' || estado === 'pendiente_aprobacion'
    })
    
    console.log(`✅ Citas pendientes encontradas: ${citasPendientes.length}`)
    return citasPendientes

  } catch (error) {
    console.error('❌ Error al obtener citas pendientes:', error)
    // El error ya fue manejado por getCitasApi, pero lo volvemos a lanzar
    throw error
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
      console.log('✅ Cita confirmada exitosamente')
      return response.data
    } else {
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }
  } catch (error) {
    console.error('❌ Error al confirmar cita:', error)
    
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

// Función para cancelar/rechazar una cita
export const rechazarCitaApi = async (citaId) => {
  try {
    console.log('❌ Cancelando cita:', citaId)
    const res = await apiClient.post(`/cita/${citaId}/cancelar`)
    
    const response = res.data
    
    if (response.status === 'success' && response.data) {
      console.log('✅ Cita cancelada exitosamente')
      return response.data
    } else {
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }
  } catch (error) {
    console.error('❌ Error al cancelar cita:', error)
    
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