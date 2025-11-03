import axios from 'axios'

// URL del backend FastAPI
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Configurar instancia de axios con opciones por defecto
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// === INTERCEPTOR DE PETICIÓN (Request) ===
// Agrega el token a CADA petición
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// === INTERCEPTOR DE RESPUESTA (Response) ===
// Centraliza TODO el manejo de errores aquí
apiClient.interceptors.response.use(
  (response) => response, // Petición exitosa, solo la pasamos
  (error) => {
    const { response } = error

    // 1. Error de Token (401)
    if (response?.status === 401) {
      console.error('❌ Error 401: Token inválido o expirado')
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/auth'
      return Promise.reject(new Error('Sesión expirada. Inicie sesión de nuevo.'))
    }

    // 2. Error de Permisos (403)
    if (response?.status === 403) {
      console.error('❌ Error 403: Sin permisos')
      return Promise.reject(new Error('No tiene permisos para esta acción.'))
    }

    // 3. Error de FastAPI (400, 404, 422, etc.)
    // Aquí parseamos el "detail"
    if (response?.data?.detail) {
      const { detail } = response.data
      let errorMessage = 'Ocurrió un error.'

      if (typeof detail === 'string') {
        // ej: { detail: "No existe la cuenta" }
        errorMessage = detail
      } else if (Array.isArray(detail) && detail.length > 0) {
        // ej: { detail: [{ loc: [...], msg: "..." }] }
        errorMessage = `Error de validación: ${detail[0].msg}`
      }

      // Creamos un nuevo error con el mensaje limpio
      const parsedError = new Error(errorMessage)
      // Adjuntamos la respuesta original por si necesitamos el status
      parsedError.response = response
      return Promise.reject(parsedError)
    }

    // 4. Otros errores de Axios
    return Promise.reject(error)
  }
)

/**
* Normaliza la respuesta de login.
* * 🔽 ESTA ES LA FUNCIÓN CORREGIDA 🔽
*
* Extrae el objeto de usuario (admin o personal_medico) y lo
* coloca en una clave 'user' consistente.
*/
const normalizeLoginResponse = (response) => {
  const data = response.data;

  // 1. Validar formato ItemResponse
  if (data?.status !== 'success' || !data?.data) {
    throw new Error('Formato de respuesta de login inesperado.');
  }

  const loginData = data.data; // Esto es { access_token, ..., admin: {} } O { ..., personal_medico: {} }

  // 2. ¡La magia! Extraer el objeto de usuario sin importar la clave
  const userObject = loginData.admin || loginData.personal_medico;

  if (!userObject) {
    // Esto pasaría si el backend responde con éxito pero no viene ni 'admin' ni 'personal_medico'
    throw new Error('No se encontró el objeto de usuario (admin/personal_medico) en la respuesta.');
  }

  // 3. Construir la respuesta final y limpia
  return {
    access_token: loginData.access_token,
    token_type: loginData.token_type,
    user: userObject // userObject es { id, nombre, ..., rol }
  };
}

// === API DE AUTENTICACIÓN UNIFICADA ===

/**
* Función de login "inteligente" y unificada.
*
* 🔽 ESTA ES LA FUNCIÓN ACTUALIZADA 🔽
* * (Solo le quitamos el parámetro 'role' a normalizeLoginResponse)
*/
export const loginApi = async (correo, clave) => {
  // 1. Intentar como Personal Médico (el caso más común)
  try {
    console.log('🏥 Intentando login como personal médico...')
    const res = await apiClient.post('/personal_medico/login', { correo, clave })
    // Normalizamos la respuesta (ya no pasamos el rol)
    return normalizeLoginResponse(res)

  } catch (medicoError) {
    console.warn('⚠️ Login personal médico falló:', medicoError.message)

    // 2. Comprobar si fue un error "No Encontrado"
    const isNotFoundError =
      medicoError.response?.status === 404 ||
      medicoError.message.toLowerCase().includes('no existe') ||
      medicoError.message.toLowerCase().includes('no encontrado')

    // 3. Si NO fue "No Encontrado" (ej: "contraseña incorrecta"),
    // lanzamos el error inmediatamente. No probamos como admin.
    if (!isNotFoundError) {
      throw medicoError
    }

    // 4. Si FUE "No Encontrado", intentamos como Administrador
    console.log('👨‍💼 Fallback: Intentando login como administrador...')
    try {
      const res = await apiClient.post('/administrador/login', {
        correo_electronico: correo,
        constrasena: clave,
      })
      // Normalizamos la respuesta (ya no pasamos el rol)
      return normalizeLoginResponse(res)

    } catch (adminError) {
      console.error('❌ Login administrador también falló:', adminError.message)
      // Lanzamos el error de admin, que es el último que falló
      throw adminError
    }
  }
}
/**
 * Funciones de registro (ahora súper limpias)
 * El interceptor se encarga del 'catch'
 */
export const registerPersonalMedicoApi = async (userData) => {
  const res = await apiClient.post('/personal_medico/', userData)
  return res.data // En éxito, solo devolvemos los datos
}

export const registerAdminApi = async (userData) => {
  const res = await apiClient.post('/administrador/register', userData)
  return res.data
}

export default apiClient