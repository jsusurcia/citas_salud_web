import axios from 'axios'

// URL del backend FastAPI
const API_URL = 'http://127.0.0.1:8000';

// Configurar instancia de axios con opciones por defecto
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token a las peticiones
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    console.log('🔐 Token agregado a la petición:', config.url)
  } else {
    console.warn('⚠️ No hay token disponible para la petición:', config.url)
  }
  return config
})

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      console.error('❌ Error 401: Token inválido o expirado')
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/auth'
    } else if (error.response?.status === 403) {
      // Error de permisos (403 Forbidden)
      console.error('❌ Error 403: Sin permisos para esta acción')
      console.error('📋 Detalles:', {
        url: error.config?.url,
        method: error.config?.method,
        hasToken: !!localStorage.getItem('access_token'),
        user: JSON.parse(localStorage.getItem('user') || 'null')
      })
    }
    return Promise.reject(error)
  }
)

// Función de login de administrador
export const loginAdminApi = async (correo, contrasena) => {
  try {
    console.log('🔐 Enviando login administrador:', { correo, contrasena: '***' })
    // El backend espera: correo_electronico y constrasena
    const loginData = {
      correo_electronico: correo,
      constrasena: contrasena
    }
    const res = await apiClient.post('/administrador/login', loginData)
    console.log('✅ Respuesta completa del servidor:', res)
    console.log('📦 Datos parseados:', res.data)
    
    // El backend devuelve directamente los datos del admin con access_token
    const response = res.data
    
    // Verificar si tiene access_token (formato directo)
    if (response.access_token) {
      console.log('✅ Formato directo detectado (con access_token)')
      return {
        status: 'success',
        message: 'Login exitoso',
        data: {
          access_token: response.access_token,
          token_type: response.token_type || 'Bearer',
          user: response // El resto de los datos del admin vienen aquí
        }
      }
    } else if (response.status === 'success' && response.data) {
      // Formato ItemResponse
      console.log('✅ Formato ItemResponse detectado')
      return response
    } else {
      // Formato directo sin ItemResponse
      console.log('⚠️ Formato directo (sin ItemResponse)')
      return {
        status: 'success',
        message: 'Login exitoso',
        data: {
          access_token: response.access_token || response.token,
          token_type: response.token_type || 'Bearer',
          user: response
        }
      }
    }
  } catch (error) {
    console.error('❌ Error en loginAdminApi:', error)
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

// Función de login de personal médico
export const loginPersonalMedicoApi = async (correo, clave) => {
  try {
    console.log('🔐 Enviando login personal médico:', { correo, clave: '***' })
    const res = await apiClient.post('/personal_medico/login', { correo, clave })
    
    // El backend devuelve ItemResponse:
    // { status: "success", message: "...", data: { access_token, token_type, personal_medico } }
    console.log('✅ Respuesta completa del servidor:', res)
    console.log('📦 Datos parseados:', res.data)
    
    // Axios parsea automáticamente, res.data ya es el objeto JSON
    const response = res.data
    
    // Verificar estructura ItemResponse
    if (response.status === 'success' && response.data) {
      console.log('✅ Formato ItemResponse correcto')
      return response
    } else if (response.access_token) {
      // Formato directo (sin ItemResponse)
      console.log('⚠️ Formato directo (sin ItemResponse)')
      return response
    } else {
      console.error('❌ Formato de respuesta inesperado:', response)
      throw { detail: 'Formato de respuesta inesperado del servidor' }
    }
  } catch (error) {
    // Mejor manejo de errores para debug
    console.error('❌ Error en loginPersonalMedicoApi:', error)
    console.error('📋 Detalles del error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    })
    
    // Extraer el mensaje de error del backend
    if (error.response?.data) {
      const errorData = error.response.data
      
      // El backend FastAPI puede devolver:
      // - { detail: "mensaje" } (HTTPException)
      // - { detail: [...] } (ValidationError)
      // - Otro formato
      
      if (errorData.detail) {
        // Si detail es un string, devolverlo directamente
        if (typeof errorData.detail === 'string') {
          console.log('📝 Error detail (string):', errorData.detail)
          throw { detail: errorData.detail }
        }
        // Si detail es un array (errores de validación), tomar el primero
        else if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
          const firstError = errorData.detail[0]
          const errorMsg = firstError.msg || firstError.message || JSON.stringify(firstError)
          console.log('📝 Error detail (array):', errorMsg)
          throw { detail: errorMsg }
        }
      }
      
      // Si no tiene detail, devolver todo el objeto de error
      throw errorData
    }
    
    // Si no hay response, lanzar error genérico
    throw { detail: error.message || 'Error al conectar con el servidor' }
  }
}

// Función de login unificado
export const loginApi = async (correo, clave, tipo = 'personal_medico') => {
  console.log('🔑 loginApi llamado:', { correo, tipo })
  
  if (tipo === 'administrador') {
    return await loginAdminApi(correo, clave)
  } else if (tipo === 'personal_medico') {
    return await loginPersonalMedicoApi(correo, clave)
  } else {
    // Modo auto: intenta primero personal médico, luego administrador
    // Solo si el error NO es específico de personal médico (404 o "no encontrado")
    let lastError = null
    let lastErrorMsg = null
    
    // Intentar login de personal médico
    try {
      console.log('🔄 Intentando login personal médico...')
      const result = await loginPersonalMedicoApi(correo, clave)
      console.log('✅ Login personal médico exitoso')
      return result
    } catch (error) {
      console.log('❌ Error en login personal médico:', error)
      
      // Extraer mensaje del error
      let errorMsg = 'Error al iniciar sesión como personal médico'
      if (error && error.detail) {
        errorMsg = error.detail
      } else if (error && error.response && error.response.data && error.response.data.detail) {
        errorMsg = error.response.data.detail
      } else if (error && error.message) {
        errorMsg = error.message
      }
      
      lastError = error
      lastErrorMsg = errorMsg
      
      console.log('📝 Mensaje de error personal médico:', errorMsg)
      
      // Solo intentar administrador si el error NO es "no encontrado" o 404
      const isNotFoundError = 
        errorMsg.toLowerCase().includes('no encontrado') ||
        errorMsg.toLowerCase().includes('not found') ||
        error.response?.status === 404 ||
        error.response?.status === 422
      
      if (isNotFoundError) {
        // Si es error de "no encontrado", no intentar administrador
        console.log('⚠️ Error de "no encontrado" - no se intentará administrador')
        throw error
      }
      
      console.log('🔄 Intentando login administrador como fallback...')
      
      // Si falla personal médico con otro error, intenta administrador
      try {
        const result = await loginAdminApi(correo, clave)
        console.log('✅ Login administrador exitoso')
        return result
      } catch (adminError) {
        console.log('❌ Error en login administrador:', adminError)
        
        // Lanzar el error original de personal médico si ambos fallan
        throw lastError || adminError
      }
    }
  }
}

// Función de registro de personal médico
export const registerPersonalMedicoApi = async (userData) => {
  try {
    const res = await apiClient.post('/personal_medico/', userData)
    return res.data
  } catch (error) {
    throw error.response?.data || error.message
  }
}

// Función de registro de administrador (si la necesitas)
export const registerAdminApi = async (userData) => {
  try {
    const res = await apiClient.post('/administrador/register', userData)
    return res.data
  } catch (error) {
    throw error.response?.data || error.message
  }
}

export default apiClient
