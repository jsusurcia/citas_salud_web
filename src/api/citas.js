import apiClient from './auth.js'

// Llama al nuevo endpoint que trae solo las citas del calendario
export const getCitasCalendarioApi = async () => {
  try {
    //console.log(`🔍 Obteniendo citas del calendario...`)
    const res = await apiClient.get(`/cita/personal/calendario`)

    const response = res.data

    if (response.status === 'success' && Array.isArray(response.data)) {
      //console.log('✅ Citas de calendario encontradas:', response.data.length)
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
    //console.log(`⏳ Obteniendo citas pendientes...`)
    const res = await apiClient.get(`/cita/personal/pendientes`)

    const response = res.data

    if (response.status === 'success' && Array.isArray(response.data)) {
      //console.log('✅ Citas pendientes encontradas:', response.data.length)
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

export const getCitasEnAtencionApi = async () => {
  try {
    //console.log(`⏳ Obteniendo cita en atención...`)
    const res = await apiClient.get(`/cita/personal/en-atencion-activa`)

    const response = res.data

    if (response.status === 'success') {
      const data = response.data

      if (data === null) {
        //console.log('✅ No hay cita en atención actualmente')
        return null
      }

      //console.log('✅ Cita en atención encontrada')
      return data
    }

    throw { detail: 'Respuesta inesperada del servidor' }

  } catch (error) {
    console.error('❌ Error al obtener cita en atención:', error)
    throw error.response?.data || { detail: error.message || 'Error al conectar' }
  }
}


// Función para confirmar/aprobar una cita
export const aprobarCitaApi = async (citaId) => {
  try {
    //console.log('✅ Confirmando cita:', citaId)
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
    //console.log('❌ Cancelando cita:', citaId)
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

// Función para postergar una cita
export const postergarCitaApi = async (citaId) => {
  try {
    //console.log('⏰ Postergando cita:', citaId)
    const res = await apiClient.post(`/cita/${citaId}/postergar`)

    const response = res.data

    if (response.status === 'success' && response.data) {
      //console.log('✅ Cita postergada exitosamente')
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
    //console.log('🔍 Obteniendo cita por ID:', citaId)
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

// Función para marcar asistencia usando QR
export const registrarAsistenciaQrApi = async (qrCode) => {
  try {
    //console.log('🏥 Marcando asistencia via QR:', qrCode)
    // El backend espera /cita/registrar-asistencia-qr?qr_code=XYZ
    const res = await apiClient.post(`/cita/registrar-asistencia-qr?qr_code=${encodeURIComponent(qrCode)}`)

    const response = res.data

    if (response.status === 'success') {
      //console.log('✅ Asistencia marcada exitosamente via QR')
      return response
    } else {
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }
  } catch (error) {
    console.error('❌ Error al marcar asistencia via QR:', error)

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

// Función para terminar la atención (EN_ATENCION -> ATENDIDA)
export const registrarAtencionApi = async (citaId) => {
  try {
    //console.log('🏁 Terminando atención para cita:', citaId)
    // El backend espera /registrar-atencion?id_cita=123
    const res = await apiClient.post(`/cita/registrar-atencion?id_cita=${citaId}`)

    const response = res.data

    if (response.status === 'success') {
      //console.log('✅ Atención terminada exitosamente')
      return response
    } else {
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }
  } catch (error) {
    console.error('❌ Error al terminar atención:', error)

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