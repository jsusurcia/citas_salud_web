import apiClient from './auth.js'

export const getCentroMedicoPorPersonalApi = async () => {
  try {
    //console.log('🔍 Obteniendo centro médico del backend...')
    const res = await apiClient.get('/personal_medico/centro_medico')
    
    
    // { status: "success", message: "...", data: {...} }
    //console.log('✅ Respuesta del centro médico:', res.data)
    
    const response = res.data
    
    // Verificar estructura ItemResponse (un solo objeto)
    if (response.status === 'success' && typeof response.data === 'object' && response.data !== null && !Array.isArray(response.data)) {
      //console.log('✅ Formato ItemResponse correcto')
      return response.data // Devuelve el objeto { id_centro_medico: 1, ... }
    } 
    
    // (Opcional) Dejamos tu lógica original por si otro endpoint sí devuelve un array
    else if (response.status === 'success' && Array.isArray(response.data)) {
      //console.log('✅ Formato ItemListResponse correcto')
      return response.data
    } 
    
    else if (Array.isArray(response)) {
      // Si viene como array directo
      console.log('⚠️ Formato directo (array)')
      return response
    } 
    
    else {
      console.error('❌ Formato de respuesta inesperado:', response)
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }
  } catch (error) {
    console.error('❌ Error al obtener el centro médico:', error)
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
