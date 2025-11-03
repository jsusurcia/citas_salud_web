<script setup>
import { ref, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { loginApi } from '../api/auth'

const router = useRouter()
const authStore = useAuthStore()

// Estado para controlar la animación
const isActive = ref(false)
const loading = ref(false)
const errorMessage = ref('')

// Formulario de login
const loginForm = reactive({
  correo: '',
  contrasena: ''
})

// Formulario de registro
const registerForm = reactive({
  nombreCompleto: '',
  correo: '',
  contrasena: '',
  contrasenaConfirmar: '',
  especialidad: ''
})

// Funciones para cambiar entre login y registro
const showRegister = () => {
  isActive.value = true
  errorMessage.value = ''
}

const showLogin = () => {
  isActive.value = false
  errorMessage.value = ''
}

// Handler de login - Conectado con el backend
const handleLogin = async () => {
  // Validación básica antes de enviar
  if (!loginForm.correo || !loginForm.contrasena) {
    errorMessage.value = 'Por favor completa todos los campos'
    return
  }
  
  loading.value = true
  errorMessage.value = ''
  
  try {
    console.log('🚀 Iniciando login...', { correo: loginForm.correo })
    
    // Intentar login automáticamente: primero admin, luego personal médico
    let response = null
    let user = null
    let token = null
    let rol = null
    
    // Intento 1: Login como administrador
    let adminTried = false
    let medicoTried = false
    
    try {
      console.log('👨‍💼 Intentando login como administrador...')
      const { loginAdminApi } = await import('../api/auth')
      response = await loginAdminApi(loginForm.correo, loginForm.contrasena)
      console.log('✅ Login admin exitoso')
      rol = 'admin'
      adminTried = true
    } catch (adminError) {
      adminTried = true
      const status = adminError?.response?.status
      const statusText = adminError?.response?.statusText
      
      console.log(`⚠️ Login admin falló: ${status} ${statusText}`)
      
      // Si es 404, el endpoint no existe, no tiene sentido intentar personal médico
      if (status === 404) {
        console.log('❌ Endpoint de admin no encontrado (404)')
      }
      // Si es 422, los datos están mal formateados pero el endpoint existe
      else if (status === 422) {
        console.log('⚠️ Datos de admin incorrectos (422), puede ser problema de formato')
      }
      
      // Intento 2: Login como personal médico
      try {
        console.log('🏥 Intentando login como personal médico...')
        const { loginPersonalMedicoApi } = await import('../api/auth')
        response = await loginPersonalMedicoApi(loginForm.correo, loginForm.contrasena)
        console.log('✅ Login personal médico exitoso')
        rol = 'personal_medico'
        medicoTried = true
      } catch (medicoError) {
        medicoTried = true
        const medicoStatus = medicoError?.response?.status
        
        console.error('❌ Ambos tipos de login fallaron')
        console.error('📋 Resumen de errores:', {
          admin: { status: adminError?.response?.status, detail: adminError?.response?.data?.detail },
          personal_medico: { status: medicoStatus, detail: medicoError?.response?.data?.detail }
        })
        
        // Si ambos devuelven 404, probablemente los endpoints no existen
        if (status === 404 && medicoStatus === 404) {
          throw { detail: 'Los endpoints de login no están disponibles. Verifica la configuración del backend.' }
        }
        
        // Si personal médico falla con 404, mostrar mensaje específico
        if (medicoStatus === 404) {
          throw { detail: 'Endpoint de personal médico no encontrado. Verifica la ruta /personal_medico/login en el backend.' }
        }
        
        // Si personal médico falla con otro error, usar su mensaje
        if (medicoError?.detail || medicoError?.response?.data?.detail) {
          throw medicoError
        }
        
        // Si admin falló con 422 y personal médico con otro error, usar el de personal médico
        throw medicoError
      }
    }
    
    console.log('✅ Respuesta recibida:', response)
    
    // El backend devuelve un ItemResponse con estructura:
    // { status, message, data: { access_token, token_type, personal_medico/user } }
    
    // Verificar estructura de respuesta según el formato del backend
    if (rol === 'admin') {
      // Admin devuelve formato directo: { **admin.dict(), access_token, token_type }
      if (response && response.data && response.data.access_token) {
        // Si viene envuelto en ItemResponse
        console.log('📦 Formato ItemResponse para admin detectado')
        token = response.data.access_token
        user = response.data.user || response.data // Los datos del admin están en response.data
      } else if (response && response.access_token) {
        // Formato directo (sin ItemResponse) - el backend devuelve directamente
        console.log('📦 Formato directo para admin detectado')
        token = response.access_token
        // El backend devuelve todos los campos del admin más access_token y token_type
        // Necesitamos extraer los datos del admin sin access_token y token_type
        user = { ...response }
        delete user.access_token
        delete user.token_type
      } else {
        console.error('❌ Formato de respuesta desconocido para admin:', response)
        throw new Error('Formato de respuesta inesperado del servidor')
      }
    } else {
      // Personal médico devuelve formato ItemResponse
      if (response && response.data) {
        // Formato ItemResponse: { status, message, data: {...} }
        console.log('📦 Formato ItemResponse para personal médico detectado')
        token = response.data.access_token || response.data.token
        user = response.data.personal_medico || response.data
      } else if (response && response.access_token) {
        // Formato directo (sin ItemResponse)
        console.log('📦 Formato directo para personal médico detectado')
        token = response.access_token || response.token
        user = response.personal_medico || response
      } else {
        console.error('❌ Formato de respuesta desconocido para personal médico:', response)
        throw new Error('Formato de respuesta inesperado del servidor')
      }
    }
    
    if (!token) {
      console.error('❌ No se recibió token')
      throw new Error('No se recibió token de autenticación')
    }
    
    console.log('✅ Token obtenido:', token.substring(0, 20) + '...')
    console.log('✅ Usuario:', user)
    
    // Completar datos del usuario si faltan
    if (user && !user.email && !user.correo) {
      user.email = loginForm.correo
      user.correo = loginForm.correo
    }
    
    // Asegurar que el rol esté establecido
    if (user && !user.rol) {
      user.rol = rol // Usar el rol detectado automáticamente
    }
    
    console.log('✅ Usuario completo:', user)
    console.log('🔑 Rol del usuario:', user?.rol || 'no especificado')
    
    // Guardar en el store
    authStore.login(token, user)
    console.log('✅ Login exitoso, redirigiendo...')
    
    // Redirigir según el rol del usuario
    if (user && user.rol === 'personal_medico') {
      console.log('🏥 Redirigiendo a vista de personal médico...')
      router.push('/personal_med/disponibilidad')
    } else if (user && user.rol === 'admin') {
      console.log('👨‍💼 Redirigiendo a vista de administrador...')
      router.push('/admin/validacion')
    } else {
      console.log('⚠️ Rol no identificado, redirigiendo a página principal...')
      router.push('/')
    }
  } catch (error) {
    // Manejo de errores del backend FastAPI
    console.error('❌ Error completo en login:', error)
    console.error('📋 Estructura del error:', {
      tipo: typeof error,
      tieneDetail: !!error?.detail,
      tieneResponse: !!error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    
    // Extraer mensaje de error - múltiples niveles de verificación
    let errorMsg = 'Error al iniciar sesión. Verifica tus credenciales.'
    
    // Prioridad 1: error.detail (ya viene del API)
    if (error?.detail) {
      errorMsg = error.detail
      console.log('✅ Error detail encontrado:', error.detail)
    }
    // Prioridad 2: error.response.data.detail (formato FastAPI directo)
    else if (error?.response?.data?.detail) {
      errorMsg = error.response.data.detail
      console.log('✅ Error detail en response.data:', error.response.data.detail)
      
      // Si detail es un array (validación de FastAPI), tomar el primero
      if (Array.isArray(errorMsg) && errorMsg.length > 0) {
        const firstErr = errorMsg[0]
        errorMsg = firstErr.msg || firstErr.loc?.join('.') + ': ' + firstErr.msg || JSON.stringify(firstErr)
        console.log('✅ Error de validación:', errorMsg)
      }
    }
    // Prioridad 3: error.message
    else if (error?.message) {
      errorMsg = error.message
      console.log('✅ Error message encontrado:', error.message)
    }
    // Prioridad 4: error.response.data.message
    else if (error?.response?.data?.message) {
      errorMsg = error.response.data.message
      console.log('✅ Error message en response.data:', error.response.data.message)
    }
    // Prioridad 5: string directo
    else if (typeof error === 'string') {
      errorMsg = error
      console.log('✅ Error como string:', error)
    }
    // Prioridad 6: error.response.statusText
    else if (error?.response?.statusText) {
      errorMsg = `Error ${error.response.status}: ${error.response.statusText}`
      console.log('✅ Error statusText:', errorMsg)
    }
    // Prioridad 7: Mensaje genérico según status
    else if (error?.response?.status === 401) {
      errorMsg = 'Credenciales incorrectas o cuenta no validada'
      console.log('⚠️ Error 401 genérico')
    }
    
    // Asegurar que siempre se muestre un mensaje
    errorMessage.value = errorMsg || 'Error desconocido al iniciar sesión'
    console.log('📝 Mensaje de error final que se mostrará:', errorMessage.value)
    console.log('🎯 errorMessage.value asignado:', errorMessage.value)
    
    // Forzar actualización de la UI
    await nextTick()
    console.log('🔄 UI actualizada')
  } finally {
    loading.value = false
    console.log('🏁 Login finalizado, loading:', loading.value)
  }
}

const handleRegister = async () => {
  if (registerForm.contrasena !== registerForm.contrasenaConfirmar) {
    errorMessage.value = 'Las contraseñas no coinciden'
    return
  }
  
  loading.value = true
  errorMessage.value = ''
  
  try {
    // Importar la función de registro de personal médico
    const { registerPersonalMedicoApi } = await import('../api/auth')
    
    // Preparar los datos según el formato esperado por el backend
    const userData = {
      nombres: registerForm.nombreCompleto.split(' ')[0] || registerForm.nombreCompleto,
      apellido_paterno: registerForm.nombreCompleto.split(' ')[1] || '',
      apellido_materno: registerForm.nombreCompleto.split(' ')[2] || '',
      correo: registerForm.correo,
      clave: registerForm.contrasena,
      id_especialidad: parseInt(registerForm.especialidad) || 1,
      // Agregar otros campos requeridos según tu schema
    }
    
    const response = await registerPersonalMedicoApi(userData)
    
    if (response.status === 'success') {
      alert(response.message || 'Registro exitoso. Espera validación.')
      // Cambiar al formulario de login
      showLogin()
    }
  } catch (error) {
    // Manejo de errores
    if (error.detail) {
      errorMessage.value = error.detail
    } else if (error.message) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Error al registrarse. Intenta nuevamente.'
    }
    console.error('Error en registro:', error)
  } finally {
    loading.value = false
  }
}

const handleForgotPassword = () => {
  console.log('Forgot password clicked')
  // Aquí puedes agregar tu lógica de recuperación de contraseña
}
</script>

<template>
  <div class="min-h-screen flex justify-center items-center bg-gradient-to-r from-[#e2e2e2] to-[#c9ffea]">
    <div :class="['container-box', { active: isActive }]">
      <!-- Login Form -->
      <div class="form-box login">
        <form @submit.prevent="handleLogin">
          <h1>Iniciar sesión</h1>
          <p>Bienvenido de nuevo. Inicia sesión en tu cuenta</p>
          
          <div class="input-box">
            <label for="login-correo">Correo electrónico</label>
            <input 
              id="login-correo"
              v-model="loginForm.correo"
              type="email" 
              placeholder="tu.correo@ejemplo.com" 
              required
            >
          </div>
          
          <div class="input-box">
            <label for="login-contrasena">Contraseña</label>
            <input 
              id="login-contrasena"
              v-model="loginForm.contrasena"
              type="password" 
              placeholder="******" 
              required
            >
          </div>
          
          <div class="forgot-link">
            <a href="#" @click.prevent="handleForgotPassword">Olvidé mi contraseña</a>
          </div>
          
          <!-- Mensaje de error -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          
          <button type="submit" class="btn" :disabled="loading">
            <span v-if="loading">Cargando...</span>
            <span v-else>Iniciar sesión</span>
          </button>
        </form>
      </div>

      <!-- Register Form -->
      <div class="form-box register">
        <form @submit.prevent="handleRegister">
          <h1>Crear una cuenta</h1>
          <p>Ingresa tus datos para registrarte en el portal</p>
          
          <div class="input-box">
            <label for="nombre-completo">Nombre completo</label>
            <input 
              id="nombre-completo"
              v-model="registerForm.nombreCompleto"
              type="text" 
              placeholder="Tu nombre completo" 
              required
            >
          </div>
          
          <div class="input-box">
            <label for="register-correo">Correo electrónico</label>
            <input 
              id="register-correo"
              v-model="registerForm.correo"
              type="email" 
              placeholder="tu.email@ejemplo.com" 
              required
            >
          </div>
          
          <div class="input-box">
            <label for="register-contrasena">Contraseña</label>
            <input 
              id="register-contrasena"
              v-model="registerForm.contrasena"
              type="password" 
              placeholder="Crea una contraseña" 
              required
            >
          </div>
          
          <div class="input-box">
            <label for="contrasena-confirmar">Confirmar contraseña</label>
            <input 
              id="contrasena-confirmar"
              v-model="registerForm.contrasenaConfirmar"
              type="password" 
              placeholder="Confirma tu contraseña" 
              required
            >
          </div>
          
          <div class="input-box">
            <label for="especialidad">Especialidad</label>
            <select 
              id="especialidad"
              v-model="registerForm.especialidad"
              required
            >
              <option value="" disabled>Seleccione su especialidad</option>
              <option value="1">Medicina general</option>
              <option value="2">Pediatría</option>
              <option value="3">Dermatología</option>
              <!-- Ajusta los valores según los IDs reales de tu base de datos -->
            </select>
          </div>
          
          <!-- Mensaje de error -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          
          <button type="submit" class="btn" :disabled="loading">
            <span v-if="loading">Cargando...</span>
            <span v-else>Registrarse</span>
          </button>
        </form>
      </div>

      <!-- Toggle Box -->
      <div class="toggle-box">
        <!-- Panel Izquierdo -->
        <div class="toggle-panel toggle-left">
          <img src="/img/citas_salud_logo.png" alt="citas_salud_logo" class="logo">
          <h1>¡Bienvenido!</h1>
          <p>
            ¿Primera vez con nosotros? <br>
            <b>¡Regístrate ya!</b>
          </p>
          <button class="btn register-btn" @click="showRegister">Registrar</button>
        </div>
        
        <!-- Panel Derecho -->
        <div class="toggle-panel toggle-right">
          <img src="/img/citas_salud_logo.png" alt="citas_salud_logo" class="logo">
          <h1>¡Hola de nuevo!</h1>
          <p>
            ¿Ya tienes una cuenta? <br>
            <b>¡Inicia sesión!</b>
          </p>
          <button class="btn login-btn" @click="showLogin">Iniciar Sesión</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=ADLaM+Display&family=Exo:ital,wght@0,100..900;1,100..900&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=SUSE+Mono:ital,wght@0,100..800;1,100..800&display=swap');

* {
  font-family: "Exo", sans-serif;
  box-sizing: border-box;
}

.container-box {
  position: relative;
  width: 850px;
  height: 650px;
  background-color: white;
  margin: 20px;
  border-radius: 30px;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.container-box h1 {
  font-family: "Inter", sans-serif;
  font-weight: bold;
  font-size: 20px;
  margin: -10px 0;
}

.container-box p {
  font-size: 14px;
  margin: 15px 0;
}

form {
  width: 100%;
}

.form-box {
  position: absolute;
  right: 0;
  width: 50%;
  height: 100%;
  background: #fff;
  display: flex;
  align-items: center;
  color: #333;
  text-align: center;
  padding: 40px;
  z-index: 1;
  transition: 0.6s ease-in-out 1.2s, visibility 0s 1s;
}

.container-box.active .form-box {
  right: 50%;
}

.form-box.register {
  visibility: hidden;
}

.container-box.active .form-box.register {
  visibility: visible;
}

.form-box.login {
  visibility: visible;
}

.container-box.active .form-box.login {
  right: 50%;
}

.input-box {
  position: relative;
  margin: 20px 0;
}

.input-box input,
.input-box select {
  width: 100%;
  padding: 8px 50px 8px 20px;
  background: #eee;
  border-radius: 8px;
  border: none;
  outline: none;
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

.input-box input::placeholder {
  color: #888;
  font-weight: 400;
}

.input-box label {
  font-size: 14px;
  font-weight: 600;
  color: #555;
  display: block;
  margin-bottom: 8px;
  text-align: start;
}

.input-box select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0Ij4KICA8cGF0aCBkPSJNMTkgOS41bC03IDctNy03eiIvPgo8L3N2Zz4=');
  background-repeat: no-repeat;
  background-position: right 15px center;
  background-size: 12px;
  padding-right: 40px;
  cursor: pointer;
}

.forgot-link {
  margin: -15px 0 15px;
  text-align: end;
}

.forgot-link a {
  font-size: 14.5px;
  color: #10A697;
}

.btn {
  width: 100%;
  height: 38px;
  background: #10A697;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border: none;
  outline: none;
  cursor: pointer;
  font-size: 16px;
  color: #fff;
  font-weight: 600;
  transition: opacity 0.3s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  margin: 10px 0;
  padding: 12px;
  background: #fee;
  color: #c33;
  border-radius: 6px;
  font-size: 13px;
  text-align: center;
  border: 1px solid #fcc;
  display: block;
  min-height: 20px;
  word-wrap: break-word;
  z-index: 10;
  position: relative;
}

.toggle-box {
  position: absolute;
  width: 100%;
  height: 100%;
}

.toggle-box::before {
  content: '';
  position: absolute;
  left: -250%;
  width: 300%;
  height: 100%;
  background: #10A697;
  border-radius: 100px;
  z-index: 2;
  transition: 1.8s ease-in-out;
}

.container-box.active .toggle-box::before {
  left: 50%;
}

.toggle-panel {
  position: absolute;
  width: 50%;
  height: 100%;
  color: #fff;
  display: flex;
  flex-direction: column;
  text-align: center;
  justify-content: center;
  align-items: center;
  z-index: 2;
  transition: 0.6s ease-in-out;
}

.toggle-panel.toggle-left {
  left: 0;
  transition-delay: 1.2s;
}

.container-box.active .toggle-panel.toggle-left {
  left: -50%;
  transition-delay: 0.6s;
}

.toggle-panel.toggle-right {
  right: -50%;
  transition-delay: 0.6s;
}

.container-box.active .toggle-panel.toggle-right {
  right: 0;
  transition-delay: 1.2s;
}

.toggle-panel p {
  margin-bottom: 20px;
}

.toggle-panel .btn {
  width: 160px;
  height: 46px;
  background: transparent;
  border: 2px solid #fff;
  box-shadow: none;
}

.logo {
  width: 180px;
  margin-bottom: 20px;
}

.toggle-panel h1 {
  font-family: "ADLaM Display", sans-serif;
}
</style>