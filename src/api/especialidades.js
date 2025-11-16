import apiClient from './auth.js'

// Función para obtener todas las especialidades
export const getEspecialidadesApi = async () => {
  try {
    //console.log('🔍 Obteniendo especialidades del backend...')
    const res = await apiClient.get('/especialidades/')
    
    // El backend devuelve ItemListResponse:
    // { status: "success", message: "...", data: [...] }
    //console.log('✅ Respuesta de especialidades:', res.data)
    
    const response = res.data
    
    // Verificar estructura ItemResponse
    if (response.status === 'success' && Array.isArray(response.data)) {
      //console.log('✅ Formato ItemListResponse correcto')
      return response.data
    } else if (Array.isArray(response)) {
      // Si viene como array directo
      console.log('⚠️ Formato directo (array)')
      return response
    } else {
      console.error('❌ Formato de respuesta inesperado:', response)
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }
  } catch (error) {
    console.error('❌ Error al obtener especialidades:', error)
    console.error('📋 Detalles del error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    })
    
    // Extraer el mensaje de error del backend
    if (error.response?.data) {
      const errorData = error.response.data
      
      if (errorData.detail) {
        if (typeof errorData.detail === 'string') {
          throw { detail: errorData.detail }
        } else if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
          const firstError = errorData.detail[0]
          const errorMsg = firstError.msg || firstError.message || JSON.stringify(firstError)
          throw { detail: errorMsg }
        }
      }
      
      throw errorData
    }
    
    throw { detail: error.message || 'Error al conectar con el servidor' }
  }
}

// Función para crear una nueva especialidad
export const createEspecialidadApi = async (especialidadData) => {
  try {
    //console.log('➕ Creando especialidad:', especialidadData)
    const res = await apiClient.post('/especialidades/', especialidadData)
    
    // El backend devuelve ItemResponse:
    // { status: "success", message: "...", data: {...} }
    //console.log('✅ Respuesta de creación:', res.data)
    
    const response = res.data
    
    // Verificar estructura ItemResponse
    if (response.status === 'success' && response.data) {
      //console.log('✅ Formato ItemResponse correcto')
      return response.data
    } else if (response.id_especialidad || response.id) {
      // Si viene como objeto directo
      console.warn('⚠️ Formato directo (objeto)')
      return response
    } else {
      console.error('❌ Formato de respuesta inesperado:', response)
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }
  } catch (error) {
    console.error('❌ Error al crear especialidad:', error)
    console.error('📋 Detalles del error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    })
    
    // Extraer el mensaje de error del backend
    if (error.response?.data) {
      const errorData = error.response.data
      
      if (errorData.detail) {
        if (typeof errorData.detail === 'string') {
          throw { detail: errorData.detail }
        } else if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
          const firstError = errorData.detail[0]
          const errorMsg = firstError.msg || firstError.message || JSON.stringify(firstError)
          throw { detail: errorMsg }
        }
      }
      
      throw errorData
    }
    
    throw { detail: error.message || 'Error al conectar con el servidor' }
  }
}

export const updateEspecialidadApi = async (especialidadId, especialidadData) => {
  try {
    //console.log('✏️ Actualizando especialidad:', { especialidadId, especialidadData })
    const res = await apiClient.put(`/especialidades/${especialidadId}`, especialidadData)
    
    // El backend devuelve ItemResponse:
    // { status: "success", message: "...", data: {...} }
    //console.log('✅ Respuesta de actualización:', res.data)
    
    const response = res.data
    
    // Verificar estructura ItemResponse
    if (response.status === 'success' && response.data) {
      //console.log('✅ Formato ItemResponse correcto')
      return response.data
    } else if (response.id_especialidad || response.id) {
      // Si viene como objeto directo
      console.warn('⚠️ Formato directo (objeto)')
      return response
    } else {
      console.error('❌ Formato de respuesta inesperado:', response)
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }
  } catch (error) {
    console.error('❌ Error al actualizar especialidad:', error)
    console.error('📋 Detalles del error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    })
    
    // Extraer el mensaje de error del backend
    if (error.response?.data) {
      const errorData = error.response.data
      
      if (errorData.detail) {
        if (typeof errorData.detail === 'string') {
          throw { detail: errorData.detail }
        } else if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
          const firstError = errorData.detail[0]
          const errorMsg = firstError.msg || firstError.message || JSON.stringify(firstError)
          throw { detail: errorMsg }
        }
      }
      
      throw errorData
    }
    
    throw { detail: error.message || 'Error al conectar con el servidor' }
  }
}

// Función para actualizar el estado (habilitar/deshabilitar) de una especialidad
export const updateEstadoEspecialidadApi = async (especialidadId, estado) => {
  try {
    //console.log('🔄 Actualizando estado de especialidad:', { especialidadId, estado })
    
    // El backend espera: PATCH /especialidades/{especialidad_id}/estado
    // Con body: { estado: boolean } envuelto en EspecialidadEstadoUpdate
    const estadoData = { estado }
    const res = await apiClient.patch(`/especialidades/${especialidadId}/estado`, estadoData)
    
    // El backend devuelve ItemResponse:
    // { status: "success", message: "...", data: {...} }
    //console.log('✅ Respuesta de actualización de estado:', res.data)
    
    const response = res.data
    
    // Verificar estructura ItemResponse
    if (response.status === 'success' && response.data) {
      //console.log('✅ Formato ItemResponse correcto')
      return response.data
    } else if (response.id_especialidad || response.id) {
      // Si viene como objeto directo
      console.warn('⚠️ Formato directo (objeto)')
      return response
    } else {
      console.error('❌ Formato de respuesta inesperado:', response)
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }
  } catch (error) {
    console.error('❌ Error al actualizar estado de especialidad:', error)
    console.error('📋 Detalles del error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    })
    
    // Extraer el mensaje de error del backend
    if (error.response?.data) {
      const errorData = error.response.data
      
      if (errorData.detail) {
        if (typeof errorData.detail === 'string') {
          throw { detail: errorData.detail }
        } else if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
          const firstError = errorData.detail[0]
          const errorMsg = firstError.msg || firstError.message || JSON.stringify(firstError)
          throw { detail: errorMsg }
        }
      }
      
      throw errorData
    }
    
    throw { detail: error.message || 'Error al conectar con el servidor' }
  }
}

// Función para eliminar una especialidad
export const deleteEspecialidadApi = async (especialidadId) => {
  try {
    //console.log('🗑️ Eliminando especialidad:', especialidadId)
    const res = await apiClient.delete(`/especialidades/${especialidadId}`)

    //console.log('✅ Respuesta de eliminación:', res.data)

    const response = res.data

    if (response?.status === 'success') {
      return response.data ?? true
    }

    // Algunos backends devuelven 204 sin cuerpo
    return true
  } catch (error) {
    console.error('❌ Error al eliminar especialidad:', error)
    console.error('📋 Detalles del error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    })

    if (error.response?.data) {
      const errorData = error.response.data

      if (errorData.detail) {
        if (typeof errorData.detail === 'string') {
          throw { detail: errorData.detail }
        } else if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
          const firstError = errorData.detail[0]
          const errorMsg = firstError.msg || firstError.message || JSON.stringify(firstError)
          throw { detail: errorMsg }
        }
      }

      throw errorData
    }

    throw { detail: error.message || 'Error al conectar con el servidor' }
  }
}