import apiClient from './auth.js'

// Función para obtener las citas del personal médico
// El endpoint devuelve todas las citas, pero filtramos por id_personal en el frontend
export const getCitasApi = async (personalId) => {
  try {
    console.log('🔍 Obteniendo citas del personal médico...', personalId)
    const res = await apiClient.get('/cita/')
    
    const response = res.data
    
    if (response.status === 'success' && Array.isArray(response.data)) {
      console.log('✅ Formato ItemListResponse correcto')
      // Filtrar citas por id_personal si se proporciona
      let citas = response.data
      if (personalId) {
        citas = response.data.filter(c => {
          const idPersonal = c.id_personal || c.personal_medico?.id_personal || c.personal_medico?.id
          return idPersonal == personalId || idPersonal === personalId
        })
        console.log(`✅ Citas filtradas para personal ${personalId}:`, citas.length)
      }
      return citas
    } else if (Array.isArray(response)) {
      // Si viene como array directo
      let citas = response
      if (personalId) {
        citas = response.filter(c => {
          const idPersonal = c.id_personal || c.personal_medico?.id_personal || c.personal_medico?.id
          return idPersonal == personalId || idPersonal === personalId
        })
      }
      return citas
    } else {
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }
  } catch (error) {
    console.error('❌ Error al obtener citas:', error)
    throw error.response?.data || { detail: error.message || 'Error al conectar con el servidor' }
  }
}

// Función para obtener citas pendientes de aprobación
// Filtramos las citas con estado "PENDIENTE" o "pendiente"
export const getCitasPendientesApi = async (personalId) => {
  try {
    console.log('⏳ Obteniendo citas pendientes...', personalId)
    // Primero obtenemos todas las citas del personal médico
    const todasLasCitas = await getCitasApi(personalId)
    
    // Filtrar solo las que están pendientes
    const citasPendientes = todasLasCitas.filter(c => {
      const estado = c.estado?.toLowerCase() || c.estado_cita?.toLowerCase() || ''
      return estado === 'pendiente' || estado === 'pendiente_aprobacion'
    })
    
    console.log(`✅ Citas pendientes encontradas: ${citasPendientes.length}`)
    return citasPendientes
  } catch (error) {
    console.error('❌ Error al obtener citas pendientes:', error)
    throw error.response?.data || { detail: error.message || 'Error al conectar con el servidor' }
  }
}

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
    
    // Extraer mensaje de error del backend
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
    
    // Extraer mensaje de error del backend
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

