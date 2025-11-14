<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

import { loginApi, registerPersonalMedicoApi, selectSpecialtyApi } from '../api/auth'

const router = useRouter()
const authStore = useAuthStore()

// Estado para controlar la animación
const isActive = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const selectionData = ref(null)

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
  selectionData.value = null
}

const showLogin = () => {
  isActive.value = false
  errorMessage.value = ''
  selectionData.value = null
}

// Handler de login - Conectado con el backend
const handleLogin = async () => {
  if (!loginForm.correo || !loginForm.contrasena) {
    errorMessage.value = 'Por favor completa todos los campos'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    // 1. LLAMAR A LA API DE LOGIN (que ahora devuelve 'status')
    const result = await loginApi(loginForm.correo, loginForm.contrasena)

    // 2. COMPROBAR LA RESPUESTA
    if (result.status === 'success') {
      // --- CASO 1: LOGIN EXITOSO Y DIRECTO (Admin o Médico con 1 especialidad) ---
      // 'result.data' es { access_token, user }
      const loginData = result.data

      console.log(`✅ Login exitoso como: ${loginData.user.rol}`)

      // 3. GUARDAR EN EL STORE
      authStore.login(loginData.access_token, loginData.user)

      // 4. REDIRIGIR
      if (loginData.user.rol === 'personal_medico') {
        router.push('/personal_med/disponibilidad')
      } else if (loginData.user.rol === 'admin') {
        router.push('/admin/validacion')
      } else {
        router.push('/')
      }

    } else if (result.status === 'requires_selection') {
      // --- CASO 2: SE REQUIERE SELECCIÓN DE ESPECIALIDAD ---
      // 'result.data' es { message, specialties, temp_token }
      console.log('👨‍⚕️ Requiere selección de especialidad.')
      selectionData.value = result.data // <-- Guardamos los datos del Paso 2
      // No redirigimos, la UI reaccionará a 'selectionData'
    }

  } catch (error) {
    // 5. MANEJAR ERROR
    console.error('❌ Error de login:', error.message)
    errorMessage.value = error.message

  } finally {
    // 6. LIMPIAR
    loading.value = false
  }
}

// 4. Nueva función para manejar el Paso 2
const handleSelectSpecialty = async (specialtyId) => {
  if (!selectionData.value?.temp_token) return

  loading.value = true
  errorMessage.value = ''

  try {
    // 1. LLAMAR A LA NUEVA API
    const finalLoginData = await selectSpecialtyApi(
      specialtyId,
      selectionData.value.temp_token
    )

    // 'finalLoginData' es { access_token, user }
    console.log(`✅ Login completado como: ${finalLoginData.user.rol}`)

    // 2. GUARDAR EN EL STORE
    authStore.login(finalLoginData.access_token, finalLoginData.user)

    // 3. REDIRIGIR
    router.push('/personal_med/disponibilidad')

  } catch (error) {
    console.error('❌ Error seleccionando especialidad:', error.message)
    errorMessage.value = error.message
  } finally {
    loading.value = false
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
    const userData = {
      nombres: registerForm.nombreCompleto.split(' ')[0] || registerForm.nombreCompleto,
      apellido_paterno: registerForm.nombreCompleto.split(' ')[1] || '',
      apellido_materno: registerForm.nombreCompleto.split(' ')[2] || '',
      correo: registerForm.correo,
      clave: registerForm.contrasena,
      id_especialidad: parseInt(registerForm.especialidad) || 1,
    }

    const response = await registerPersonalMedicoApi(userData)

    // El backend devuelve { status: "success", message: "..." }
    alert(response.message || 'Registro exitoso. Espera validación.')
    showLogin()

  } catch (error) {
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
  <!-- 1. Fondo y fuente principal aplicados con Tailwind -->
  <div class="min-h-screen flex justify-center items-center bg-gradient-to-r from-[#e2e2e2] to-[#c9ffea] font-exo">

    <!-- 2. Contenedor principal de la animación -->
    <div :class="['container-box', { active: isActive }]">

      <!-- === FORMULARIO DE LOGIN === -->
      <div class="form-box login">
        <form v-if="!selectionData" @submit.prevent="handleLogin" class="w-full">

          <!-- 3. Tipografía migrada a Tailwind -->
          <h1 class="font-inter font-bold text-xl mb-2.5">Iniciar sesión</h1>
          <p class="text-sm text-gray-700 mb-4">Bienvenido de nuevo. Inicia sesión en tu cuenta</p>

          <!-- 4. Input-box migrado a Tailwind -->
          <div class="mb-5 text-left">
            <label for="login-correo" class="block mb-2 text-sm font-semibold text-gray-600">Correo electrónico</label>
            <input id="login-correo" v-model="loginForm.correo" type="email" placeholder="tu.correo@ejemplo.com"
              required
              class="w-full px-5 py-2 bg-gray-100 rounded-lg border-none outline-none text-sm text-gray-800 font-medium placeholder-gray-400 focus:ring-2 focus:ring-[#10A697]">
          </div>

          <!-- 5. Input-box migrado a Tailwind -->
          <div class="mb-5 text-left">
            <label for="login-contrasena" class="block mb-2 text-sm font-semibold text-gray-600">Contraseña</label>
            <input id="login-contrasena" v-model="loginForm.contrasena" type="password" placeholder="******" required
              class="w-full px-5 py-2 bg-gray-100 rounded-lg border-none outline-none text-sm text-gray-800 font-medium placeholder-gray-400 focus:ring-2 focus:ring-[#10A697]">
          </div>

          <!-- 6. Forgot-link migrado a Tailwind -->
          <div class="text-right -mt-2.5 mb-4">
            <a href="#" @click.prevent="handleForgotPassword" class="text-sm text-[#10A697] hover:underline">Olvidé mi
              contraseña</a>
          </div>

          <!-- 7. Error-message migrado a Tailwind -->
          <div v-if="errorMessage"
            class="my-2.5 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm text-center break-words z-10 relative">
            {{ errorMessage }}
          </div>

          <!-- 8. Botón migrado a Tailwind -->
          <button type="submit" :disabled="loading"
            class="w-full h-10 bg-[#10A697] text-white rounded-lg shadow-sm text-base font-semibold transition-opacity duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
            <span v-if="loading">Cargando...</span>
            <span v-else>Iniciar sesión</span>
          </button>
        </form>

        <div v-if="selectionData" class="w-full">

          <h1 class="font-inter font-bold text-xl mb-2.5">Selecciona tu especialidad</h1>
          <p class="text-sm text-gray-700 mb-4">{{ selectionData.message }}</p>

          <!-- Lista de botones de especialidad -->
          <div class="flex flex-col gap-3">
            <button v-for="spec in selectionData.especialidades" :key="spec.id_especialidad"
              @click="handleSelectSpecialty(spec.id_especialidad)" :disabled="loading"
              class="w-full h-10 bg-[#10A697] text-white rounded-lg shadow-sm text-base font-semibold transition-opacity duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
              <span v-if="loading">Cargando...</span>
              <span v-else>{{ spec.nombre }}</span>
            </button>
          </div>
        </div>


        <div v-if="selectionData && errorMessage"
          class="my-2.5 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm text-center break-words z-10 relative w-full mt-4">
          <!-- <--- MODIFICADO: Movido fuera del form -->
          {{ errorMessage }}
        </div>

      </div>

      <!-- === FORMULARIO DE REGISTRO === -->
      <div class="form-box register">
        <form @submit.prevent="handleRegister" class="w-full">
          <h1 class="font-inter font-bold text-xl mb-2.5">Crear una cuenta</h1>
          <p class="text-sm text-gray-700 mb-4">Ingresa tus datos para registrarte</p>

          <!-- Input nombre completo -->
          <div class="mb-5 text-left">
            <label for="nombre-completo" class="block mb-2 text-sm font-semibold text-gray-600">Nombre completo</label>
            <input id="nombre-completo" v-model="registerForm.nombreCompleto" type="text"
              placeholder="Tu nombre completo" required
              class="w-full px-5 py-2 bg-gray-100 rounded-lg border-none outline-none text-sm text-gray-800 font-medium placeholder-gray-400 focus:ring-2 focus:ring-[#10A697]">
          </div>

          <!-- Input correo -->
          <div class="mb-5 text-left">
            <label for="register-correo" class="block mb-2 text-sm font-semibold text-gray-600">Correo
              electrónico</label>
            <input id="register-correo" v-model="registerForm.correo" type="email" placeholder="tu.email@ejemplo.com"
              required
              class="w-full px-5 py-2 bg-gray-100 rounded-lg border-none outline-none text-sm text-gray-800 font-medium placeholder-gray-400 focus:ring-2 focus:ring-[#10A697]">
          </div>

          <!-- Input contraseña -->
          <div class="mb-5 text-left">
            <label for="register-contrasena" class="block mb-2 text-sm font-semibold text-gray-600">Contraseña</label>
            <input id="register-contrasena" v-model="registerForm.contrasena" type="password"
              placeholder="Crea una contraseña" required
              class="w-full px-5 py-2 bg-gray-100 rounded-lg border-none outline-none text-sm text-gray-800 font-medium placeholder-gray-400 focus:ring-2 focus:ring-[#10A697]">
          </div>

          <!-- Input confirmar contraseña -->
          <div class="mb-5 text-left">
            <label for="contrasena-confirmar" class="block mb-2 text-sm font-semibold text-gray-600">Confirmar
              contraseña</label>
            <input id="contrasena-confirmar" v-model="registerForm.contrasenaConfirmar" type="password"
              placeholder="Confirma tu contraseña" required
              class="w-full px-5 py-2 bg-gray-100 rounded-lg border-none outline-none text-sm text-gray-800 font-medium placeholder-gray-400 focus:ring-2 focus:ring-[#10A697]">
          </div>

          <!-- 9. Select (Enfoque Híbrido) -->
          <!-- Usamos .input-box aquí para re-utilizar el estilo del <select> del CSS original -->
          <div class="input-box text-left">
            <label for="especialidad" class="block mb-2 text-sm font-semibold text-gray-600">Especialidad</label>
            <select id="especialidad" v-model="registerForm.especialidad" required>
              <option value="" disabled>Seleccione su especialidad</option>
              <option value="1">Medicina general</option>
              <option value="2">Pediatría</option>
              <option value="3">Dermatología</option>
            </select>
          </div>

          <!-- Mensaje de error -->
          <div v-if="errorMessage"
            class="my-2.5 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm text-center break-words z-10 relative">
            {{ errorMessage }}
          </div>

          <!-- Botón de registro -->
          <button type="submit" :disabled="loading"
            class="w-full mt-2 h-10 bg-[#10A697] text-white rounded-lg shadow-sm text-base font-semibold transition-opacity duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
            <span v-if="loading">Cargando...</span>
            <span v-else>Registrarse</span>
          </button>
        </form>
      </div>

      <!-- === PANELES DESLIZANTES (ANIMACIÓN) === -->
      <div class="toggle-box">
        <!-- Panel Izquierdo (se muestra con Login) -->
        <div class="toggle-panel toggle-left">
          <img src="/img/citas_salud_logo.png" alt="citas_salud_logo" class="w-44 mb-5"> <!-- 10. Logo migrado -->
          <h1 class="font-adlam font-bold text-xl mb-2.5">¡Bienvenido!</h1> <!-- 11. Tipografía migrada -->
          <p class="text-sm mb-5"> <!-- 12. Párrafo migrado -->
            ¿Primera vez con nosotros? <br>
            <b>¡Regístrate ya!</b>
          </p>
          <!-- 13. Botón de Toggle migrado (variante) -->
          <button @click="showRegister"
            class="w-40 h-12 bg-transparent border-2 border-white rounded-lg shadow-none text-base font-semibold text-white transition-opacity duration-300 cursor-pointer">
            Registrar
          </button>
        </div>

        <!-- Panel Derecho (se muestra con Registro) -->
        <div class="toggle-panel toggle-right">
          <img src="/img/citas_salud_logo.png" alt="citas_salud_logo" class="w-44 mb-5">
          <h1 class="font-adlam font-bold text-xl mb-2.5">¡Hola de nuevo!</h1>
          <p class="text-sm mb-5">
            ¿Ya tienes una cuenta? <br>
            <b>¡Inicia sesión!</b>
          </p>
          <button @click="showLogin"
            class="w-40 h-12 bg-transparent border-2 border-white rounded-lg shadow-none text-base font-semibold text-white transition-opacity duration-300 cursor-pointer">
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
/* --- FUENTES --- */
@import url('https://fonts.googleapis.com/css2?family=ADLaM+Display&family=Exo:ital,wght@0,100..900;1,100..900&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=SUSE+Mono:ital,wght@0,100..800;1,100..800&display=swap');

/* Clases de utilidad de fuentes para el template */
.font-exo {
  font-family: "Exo", sans-serif;
}

.font-adlam {
  font-family: "ADLaM Display", sans-serif;
}

.font-inter {
  font-family: "Inter", sans-serif;
}


/* --- CSS DE ANIMACIÓN --- */
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


/* Mantenemos el estilo del <select> ya que es complejo y 
   lo re-utilizamos con la clase .input-box */
.input-box {
  position: relative;
  margin: 20px 0;
}

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
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0Ij4KICA8cGF0aCBkPSJNMTkgOS41bC03IDctNy03eiIvPgo8L3N2Zz4=');
  background-repeat: no-repeat;
  background-position: right 15px center;
  background-size: 12px;
  cursor: pointer;
}
</style>