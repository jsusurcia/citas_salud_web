import apiClient from './auth.js'

export const getCentrosApi = async () => {
  try {
    //console.log('🔍 Obteniendo centros médicos del backend...')
    const res = await apiClient.get('/centro_medico/')


    // { status: "success", message: "...", data: [...] }
    //console.log('✅ Respuesta de centros médicos:', res.data)

    const response = res.data

    // Verificar estructura ItemResponse
    if (response.status === 'success' && Array.isArray(response.data)) {
      //console.log('✅ Formato ItemListResponse correcto')
      return response.data
    } else if (Array.isArray(response)) {
      // Si viene como array directo
      //console.log('⚠️ Formato directo (array)')
      return response
    } else {
      //console.error('❌ Formato de respuesta inesperado:', response)
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }
  } catch (error) {
    console.error('❌ Error al obtener centros médicos:', error)
    /*
    console.error('📋 Detalles del error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    })*/

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
