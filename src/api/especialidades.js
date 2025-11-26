import apiClient from './auth.js'

// --- HELPER: Convierte objetos JS a FormData automáticamente ---
const toFormData = (data) => {
  // Si ya es FormData, lo devolvemos tal cual
  if (data instanceof FormData) {
    return data
  }

  const formData = new FormData()
  
  // Recorremos las claves del objeto
  Object.keys(data).forEach(key => {
    const value = data[key]
    
    // Ignoramos nulos o indefinidos para no enviar strings "null"
    if (value !== null && value !== undefined) {
      // Si es un archivo (File) o un Blob, se adjunta directo
      // Si es otro tipo (bool, numero), se convierte a string
      formData.append(key, value)
    }
  })
  
  return formData
}
// -------------------------------------------------------------

// Función para obtener todas las especialidades
export const getEspecialidadesApi = async () => {
  try {
    const res = await apiClient.get('/especialidades/')
    const response = res.data
    
    if (response.status === 'success' && Array.isArray(response.data)) {
      return response.data
    } else if (Array.isArray(response)) {
      return response
    } else {
      console.error('❌ Formato de respuesta inesperado:', response)
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }
  } catch (error) {
    handleApiError(error, 'obtener especialidades')
  }
}

// Función para crear una nueva especialidad (Soporta Imagen)
export const createEspecialidadApi = async (especialidadData) => {
  try {
    // 1. Convertimos a FormData (el backend espera multipart/form-data)
    const payload = toFormData(especialidadData)

    // 2. Enviamos con POST
    // Axios detecta FormData y pone el header "Content-Type: multipart/form-data" automáticamente
    const res = await apiClient.post('/especialidades/', payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    const response = res.data
    
    if (response.status === 'success' && response.data) {
      return response.data
    } else if (response.id_especialidad || response.id) {
      console.warn('⚠️ Formato directo (objeto)')
      return response
    } else {
      console.error('❌ Formato de respuesta inesperado:', response)
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }
  } catch (error) {
    handleApiError(error, 'crear especialidad')
  }
}

// Función para actualizar especialidad (Soporta Imagen)
export const updateEspecialidadApi = async (especialidadId, especialidadData) => {
  try {
    // 1. Convertimos a FormData
    const payload = toFormData(especialidadData)

    // 2. Enviamos con PUT
    const res = await apiClient.put(`/especialidades/${especialidadId}`, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    const response = res.data
    
    if (response.status === 'success' && response.data) {
      return response.data
    } else if (response.id_especialidad || response.id) {
      console.warn('⚠️ Formato directo (objeto)')
      return response
    } else {
      console.error('❌ Formato de respuesta inesperado:', response)
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }
  } catch (error) {
    handleApiError(error, 'actualizar especialidad')
  }
}

// Función para actualizar el estado (Este suele seguir siendo JSON, no necesita FormData)
export const updateEstadoEspecialidadApi = async (especialidadId, estado) => {
  try {
    // El backend para estado suele ser un PATCH simple con JSON, no Form
    const estadoData = { estado } 
    const res = await apiClient.patch(`/especialidades/${especialidadId}/estado`, estadoData)
    
    const response = res.data
    
    if (response.status === 'success' && response.data) {
      return response.data
    } else if (response.id_especialidad || response.id) {
      return response
    } else {
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }
  } catch (error) {
    handleApiError(error, 'actualizar estado de especialidad')
  }
}

// Función para eliminar una especialidad
export const deleteEspecialidadApi = async (especialidadId) => {
  try {
    const res = await apiClient.delete(`/especialidades/${especialidadId}`)
    const response = res.data

    if (response?.status === 'success') {
      return response.data ?? true
    }
    return true
  } catch (error) {
    handleApiError(error, 'eliminar especialidad')
  }
}

// --- HELPER DE ERROR (Para no repetir código en cada try/catch) ---
const handleApiError = (error, action) => {
    console.error(`❌ Error al ${action}:`, error)
    
    if (error.response?.data) {
      const errorData = error.response.data
      
      // Manejo de errores de validación de FastAPI (Pydantic)
      if (errorData.detail) {
        if (typeof errorData.detail === 'string') {
          throw { detail: errorData.detail }
        } else if (Array.isArray(errorData.detail)) {
          // Extraer el primer error de validación legible
          const msgs = errorData.detail.map(e => `${e.loc[1]}: ${e.msg}`).join(', ')
          throw { detail: msgs }
        }
      }
      throw errorData
    }
    
    throw { detail: error.message || 'Error al conectar con el servidor' }
}