import apiClient from './auth.js'

// Función para obtener la disponibilidad del personal médico
// El endpoint devuelve todos los horarios, pero filtramos por id_personal en el frontend
export const getDisponibilidadApi = async () => {
  try {
    console.log('🔍 Obteniendo disponibilidad (GET /mis_horarios)...')

    // 1. Llamamos al endpoint.
    const res = await apiClient.get('/horarios_disponibles/mis_horarios')
    // (Asegúrate que la ruta base 'horarios_disponibles' esté correcta)

    const response = res.data // { status, message, data }

    // 2. Verificamos la respuesta del backend
    if (response.status === 'success' && Array.isArray(response.data)) {
      console.log(`✅ Horarios recibidos: ${response.data.length}`)
      return response.data // Devolvemos el array de horarios
    } else {
      console.error('❌ Formato de respuesta inesperado:', response)
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }
  } catch (error) {
    console.error('❌ Error al obtener disponibilidad:', error)
    // El interceptor de Axios ('auth.js') ya debería haber parseado el error
    throw error.response?.data || { detail: error.message || 'Error al conectar con el servidor' }
  }
}

// Función para crear disponibilidad
export const createDisponibilidadApi = async (disponibilidadData) => {
  try {
    console.log('➕ Creando disponibilidad (POST /horarios_disponibles/):', disponibilidadData)
    const res = await apiClient.post('/horarios_disponibles/', disponibilidadData)

    const response = res.data // { status, message, data }

    if (response.status === 'success' && response.data) {
      console.log('✅ Horario creado exitosamente')
      return response.data
    } else {
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }
  } catch (error) {
    console.error('❌ Error al crear disponibilidad:', error)

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
    //console.log('✏️ Actualizando disponibilidad:', disponibilidadId)
    const res = await apiClient.put(`/horarios_disponibles/${disponibilidadId}`, disponibilidadData)

    const response = res.data

    if (response.status === 'success' && response.data) {
      //console.log('✅ Horario actualizado exitosamente')
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
export const deleteDisponibilidadApi = async (disponibilidadId, confirmarEliminacion = false) => {
  try {
    console.log(`🗑️ Eliminando disponibilidad: ${disponibilidadId} (Confirmado: ${confirmarEliminacion})`)
    const res = await apiClient.delete(`/horarios_disponibles/${disponibilidadId}`, {
      params: { confirmar_eliminacion: confirmarEliminacion }
    })

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
    if (error.response) {
      const status = error.response.status
      const errorData = error.response.data || {}

      const errorToThrow = {
        status: status,
        detail: errorData.detail || error.message || 'Error al conectar con el servidor',
        ...errorData
      }
      throw errorToThrow
    }

    throw { detail: error.message || 'Error al conectar con el servidor' }
  }
}
