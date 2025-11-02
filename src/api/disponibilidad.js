import apiClient from './auth.js'

// Función para obtener la disponibilidad del personal médico
// El endpoint devuelve todos los horarios, pero filtramos por id_personal en el frontend
export const getDisponibilidadApi = async (personalId) => {
  try {
    console.log('🔍 Obteniendo disponibilidad del personal médico...', personalId)
    const res = await apiClient.get('/horarios_disponibles/')
    
    const response = res.data
    
    if (response.status === 'success' && Array.isArray(response.data)) {
      console.log('✅ Formato ItemListResponse correcto')
      // Filtrar horarios por id_personal si se proporciona
      let horarios = response.data
      if (personalId) {
        horarios = response.data.filter(h => {
          const idPersonal = h.id_personal || h.personal_medico?.id_personal || h.personal_medico?.id
          return idPersonal == personalId || idPersonal === personalId
        })
        console.log(`✅ Horarios filtrados para personal ${personalId}:`, horarios.length)
      }
      return horarios
    } else if (Array.isArray(response)) {
      // Si viene como array directo
      let horarios = response
      if (personalId) {
        horarios = response.filter(h => {
          const idPersonal = h.id_personal || h.personal_medico?.id_personal || h.personal_medico?.id
          return idPersonal == personalId || idPersonal === personalId
        })
      }
      return horarios
    } else {
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }
  } catch (error) {
    console.error('❌ Error al obtener disponibilidad:', error)
    throw error.response?.data || { detail: error.message || 'Error al conectar con el servidor' }
  }
}

// Función para crear disponibilidad
export const createDisponibilidadApi = async (disponibilidadData) => {
  try {
    console.log('➕ Creando disponibilidad:', disponibilidadData)
    const res = await apiClient.post('/horarios_disponibles/', disponibilidadData)
    
    const response = res.data
    
    if (response.status === 'success' && response.data) {
      console.log('✅ Horario creado exitosamente')
      return response.data
    } else if (response.id || response.id_horario_disponible) {
      return response
    } else {
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }
  } catch (error) {
    console.error('❌ Error al crear disponibilidad:', error)
    
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

// Función para actualizar disponibilidad
export const updateDisponibilidadApi = async (disponibilidadId, disponibilidadData) => {
  try {
    console.log('✏️ Actualizando disponibilidad:', disponibilidadId)
    const res = await apiClient.put(`/horarios_disponibles/${disponibilidadId}`, disponibilidadData)
    
    const response = res.data
    
    if (response.status === 'success' && response.data) {
      console.log('✅ Horario actualizado exitosamente')
      return response.data
    } else {
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }
  } catch (error) {
    console.error('❌ Error al actualizar disponibilidad:', error)
    
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

// Función para eliminar disponibilidad (soft delete)
export const deleteDisponibilidadApi = async (disponibilidadId) => {
  try {
    console.log('🗑️ Eliminando disponibilidad:', disponibilidadId)
    const res = await apiClient.delete(`/horarios_disponibles/${disponibilidadId}`)
    
    const response = res.data
    
    if (response.status === 'success') {
      console.log('✅ Horario eliminado exitosamente')
      return response.data || response
    } else {
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }
  } catch (error) {
    console.error('❌ Error al eliminar disponibilidad:', error)
    
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

