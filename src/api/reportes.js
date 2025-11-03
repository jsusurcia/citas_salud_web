import apiClient from './auth.js'

/**
 * Obtiene el reporte de citas por especialidad desde la API.
 */
export const getReporteCitasPorEspecialidadApi = async (filtros) => {
  try {
    console.log('🔍 Obteniendo reporte (especialidad) con filtros:', filtros)
    
    // axios convierte esto en:
    // /reportes/citas_por_especialidad?fecha_inicio=...&fecha_fin=...
    const res = await apiClient.get('/reportes/citas_por_especialidad', {
      params: {
        fecha_inicio: filtros.fechaInicio, // Traduce de JS a Python
        fecha_fin: filtros.fechaFin       // Traduce de JS a Python
      }
    })
    
    const response = res.data

    // 1. Revisa si es formato ItemListResponse
    if (response.status === 'success' && Array.isArray(response.data)) {
      console.log('✅ Reporte (especialidad) [ItemListResponse]:', response.data.length, 'registros')
      return response.data
    } 
    // 2. Revisa si es un array directo (el fallback)
    else if (Array.isArray(response)) {
      console.log('⚠️ Reporte (especialidad) [Array Directo]:', response.length, 'registros')
      return response
    }
    // 3. Si no es ninguno, es un error
    else {
      console.error('❌ Formato de respuesta inesperado (especialidad):', response)
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }

  } catch (error) {
    console.error('❌ Error en getReporteCitasPorEspecialidadApi:', error)
    // Re-lanza el error para que la vista lo atrape
    throw error.response?.data || { detail: error.message || 'Error al conectar' }
  }
}

/**
 * Obtiene el reporte de citas diarias desde la API.
 */
export const getReporteCitasDiariasApi = async (filtros) => {
  try {
    console.log('🔍 Obteniendo reporte (diario) con filtros:', filtros)
    
    const res = await apiClient.get('/reportes/citas_diarias', {
      params: {
        fecha_inicio: filtros.fechaInicio,
        fecha_fin: filtros.fechaFin
      }
    })
    
    const response = res.data

    // 1. Revisa si es formato ItemListResponse
    if (response.status === 'success' && Array.isArray(response.data)) {
      console.log('✅ Reporte (diario) [ItemListResponse]:', response.data.length, 'registros')
      return response.data
    }
    // 2. Revisa si es un array directo (el fallback)
    else if (Array.isArray(response)) {
      console.log('⚠️ Reporte (diario) [Array Directo]:', response.length, 'registros')
      return response
    }
    // 3. Si no es ninguno, es un error
    else {
      console.error('❌ Formato de respuesta inesperado (diario):', response)
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }

  } catch (error) {
    console.error('❌ Error en getReporteCitasDiariasApi:', error)
    // Re-lanza el error para que la vista lo atrape
    throw error.response?.data || { detail: error.message || 'Error al conectar' }
  }
}

