import apiClient from './auth.js'

/**
 * Obtiene el reporte de citas por especialidad desde la API.
 */
export const getReporteCitasPorEspecialidadApi = async (filtros) => {
  try {
    console.log('🔍 Obteniendo reporte (especialidad) con filtros:', filtros)
    
    const res = await apiClient.get('/reportes/citas_por_especialidad', {
      params: {
        fecha_inicio: filtros.fechaInicio,
        fecha_fin: filtros.fechaFin
      }
    })
    
    const response = res.data

    if (response.status === 'success' && Array.isArray(response.data)) {
      console.log('✅ Reporte (especialidad) [ItemListResponse]:', response.data.length, 'registros')
      return response.data
    } 
    else if (Array.isArray(response)) {
      console.log('✅ Reporte (especialidad) [Array Directo]:', response.length, 'registros')
      return response
    }
    else {
      console.error('❌ Formato de respuesta inesperado (especialidad):', response)
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }

  } catch (error) {
    console.error('❌ Error en getReporteCitasPorEspecialidadApi:', error)
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

    if (response.status === 'success' && Array.isArray(response.data)) {
      console.log('✅ Reporte (diario) [ItemListResponse]:', response.data.length, 'registros')
      return response.data
    }
    else if (Array.isArray(response)) {
      console.log('✅ Reporte (diario) [Array Directo]:', response.length, 'registros')
      return response
    }
    else {
      console.error('❌ Formato de respuesta inesperado (diario):', response)
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }

  } catch (error) {
    console.error('❌ Error en getReporteCitasDiariasApi:', error)
    throw error.response?.data || { detail: error.message || 'Error al conectar' }
  }
}

// ========== NUEVA FUNCIÓN: REPORTE DE CALIFICACIONES ==========

/**
 * Obtiene el reporte completo de calificaciones de pacientes.
 */
export const getReporteCalificacionesApi = async (filtros) => {
  try {
    console.log('🔍 Obteniendo reporte de calificaciones con filtros:', filtros)
    
    // Este endpoint es POST (a diferencia de los otros que son GET)
    const res = await apiClient.post('/reportes/calificaciones', {
      fecha_inicio: filtros.fechaInicio,
      fecha_fin: filtros.fechaFin,
      tipo_resumen: filtros.tipoResumen || 'todas'
    })
    
    const response = res.data

    // 1. Revisa si es formato ItemResponse
    if (response.status === 'success' && response.data) {
      console.log('✅ Reporte de calificaciones recibido')
      console.log('   📊 Promedio:', response.data.calificacion_promedio)
      console.log('   📊 Total:', response.data.total_resenas)
      return response.data
    }
    // 2. Si viene el objeto directo
    else if (response.calificacion_promedio !== undefined) {
      console.log('✅ Reporte de calificaciones [Objeto Directo]')
      return response
    }
    // 3. Error: formato inesperado
    else {
      console.error('❌ Formato inesperado:', response)
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }

  } catch (error) {
    console.error('❌ Error en getReporteCalificacionesApi:', error)
    
    // Manejo de errores de validación
    if (error.response?.data?.detail) {
      const errorDetail = error.response.data.detail
      
      if (Array.isArray(errorDetail)) {
        const errorMessages = errorDetail.map(err => 
          `${err.loc.join('.')}: ${err.msg}`
        ).join(', ')
        throw { detail: errorMessages }
      }
      
      throw { detail: errorDetail }
    }
    
    throw error.response?.data || { detail: error.message || 'Error al conectar con el servidor' }
  }
}