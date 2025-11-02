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
  }
  return config
})

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/auth'
    }
    return Promise.reject(error)
  }
)

// Función de login
export const loginApi = async (email, password) => {
  try {
    const res = await apiClient.post('/administrador/login', { email, password })
    return res.data
  } catch (error) {
    throw error.response?.data || error.message
  }
}

// Función de registro (si la necesitas)
export const registerApi = async (userData) => {
  try {
    const res = await apiClient.post('/administrador/register', userData)
    return res.data
  } catch (error) {
    throw error.response?.data || error.message
  }
}

export default apiClient
