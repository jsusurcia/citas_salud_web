<script setup>
import { ref, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

import { loginApi, registerPersonalMedicoApi } from '../api/auth'

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
  // Validación básica
  if (!loginForm.correo || !loginForm.contrasena) {
    errorMessage.value = 'Por favor completa todos los campos'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    console.log('🚀 Iniciando login unificado...', { correo: loginForm.correo })

    // 1. LLAMAR A LA API UNIFICADA
    // 'loginApi' se encarga de probar admin/médico y normalizar la respuesta
    const loginData = await loginApi(loginForm.correo, loginForm.contrasena)

    // 'loginData' ya está limpio, gracias a 'normalizeLoginResponse'
    // Tiene este formato: { access_token: "...", user: { id: 1, nombre: "...", rol: "..." } }

    console.log(`✅ Login exitoso como: ${loginData.user.rol}`)

    // 2. GUARDAR EN EL STORE
    // Tu store ya está listo para recibir esto
    authStore.login(loginData.access_token, loginData.user)

    console.log('✅ Login guardado, redirigiendo...')

    // 3. REDIRIGIR
    if (loginData.user.rol === 'personal_medico') {
      router.push('/personal_med/disponibilidad')
    } else if (loginData.user.rol === 'admin') {
      router.push('/admin/validacion')
    } else {
      router.push('/')
    }

  } catch (error) {
    // 4. MANEJAR ERROR
    // 'error.message' ya viene limpio y parseado por el INTERCEPTOR de Axios
    console.error('❌ Error de login:', error.message)
    errorMessage.value = error.message

  } finally {
    // 5. LIMPIAR
    loading.value = false
    console.log('🏁 Login finalizado.')
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
    // No necesitas dynamic import

    const userData = {
      nombres: registerForm.nombreCompleto.split(' ')[0] || registerForm.nombreCompleto,
      apellido_paterno: registerForm.nombreCompleto.split(' ')[1] || '',
      apellido_materno: registerForm.nombreCompleto.split(' ')[2] || '',
      correo: registerForm.correo,
      clave: registerForm.contrasena,
      id_especialidad: parseInt(registerForm.especialidad) || 1,
    }

    // 'registerPersonalMedicoApi' está en 'api/auth.js'
    // El interceptor manejará los errores de FastAPI
    const response = await registerPersonalMedicoApi(userData)

    // El backend devuelve { status: "success", message: "..." }
    alert(response.message || 'Registro exitoso. Espera validación.')
    showLogin()

  } catch (error) {
    // El interceptor ya parseó el error
    console.error('Error en registro:', error.message)
    errorMessage.value = error.message

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
            <input id="login-correo" v-model="loginForm.correo" type="email" placeholder="tu.correo@ejemplo.com"
              required>
          </div>

          <div class="input-box">
            <label for="login-contrasena">Contraseña</label>
            <input id="login-contrasena" v-model="loginForm.contrasena" type="password" placeholder="******" required>
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
            <input id="nombre-completo" v-model="registerForm.nombreCompleto" type="text"
              placeholder="Tu nombre completo" required>
          </div>

          <div class="input-box">
            <label for="register-correo">Correo electrónico</label>
            <input id="register-correo" v-model="registerForm.correo" type="email" placeholder="tu.email@ejemplo.com"
              required>
          </div>

          <div class="input-box">
            <label for="register-contrasena">Contraseña</label>
            <input id="register-contrasena" v-model="registerForm.contrasena" type="password"
              placeholder="Crea una contraseña" required>
          </div>

          <div class="input-box">
            <label for="contrasena-confirmar">Confirmar contraseña</label>
            <input id="contrasena-confirmar" v-model="registerForm.contrasenaConfirmar" type="password"
              placeholder="Confirma tu contraseña" required>
          </div>

          <div class="input-box">
            <label for="especialidad">Especialidad</label>
            <select id="especialidad" v-model="registerForm.especialidad" required>
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