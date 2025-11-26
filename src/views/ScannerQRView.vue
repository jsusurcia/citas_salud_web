<template>
    <LayoutComponent>
        <div class="flex flex-col items-center justify-center min-h-[80vh] p-4">
            <h1 class="text-2xl font-bold text-gray-800 mb-6">Escanear código QR</h1>

            <!-- Contenedor del escáner -->
            <div v-if="!scanResult" class="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
                <div id="reader" class="w-full min-h-[300px] bg-black relative">
                    <!-- Overlay cuando no hay cámara activa -->
                    <div v-if="!isCameraRunning"
                        class="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                        <i class="fa-solid fa-camera text-4xl mb-4"></i>
                        <p class="text-center text-sm mb-4">Selecciona una opción para escanear</p>
                    </div>
                </div>

                <!-- Controles -->
                <div class="p-4 flex flex-col gap-3">
                    <button v-if="!isCameraRunning" @click="startCamera"
                        class="w-full bg-[#10A697] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#0e9083] transition-colors flex items-center justify-center gap-2">
                        <i class="fa-solid fa-video"></i> Usar cámara
                    </button>

                    <button v-else @click="stopCamera"
                        class="w-full bg-red-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                        <i class="fa-solid fa-stop"></i> Detener cámara
                    </button>

                    <div class="relative">
                        <input type="file" id="qr-input-file" accept="image/*" @change="handleFileUpload"
                            class="hidden" />
                        <label for="qr-input-file"
                            class="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 cursor-pointer border border-gray-300">
                            <i class="fa-solid fa-image"></i> Subir imagen QR
                        </label>
                    </div>
                </div>
            </div>

            <!-- Resultado del escaneo -->
            <div v-else class="w-full max-w-md bg-white rounded-xl shadow-lg p-6 text-center">
                <div v-if="loading" class="py-8">
                    <i class="fa-solid fa-spinner fa-spin text-4xl text-[#10A697] mb-4"></i>
                    <p class="text-gray-600">Procesando cita...</p>
                </div>

                <div v-else-if="success" class="py-4">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fa-solid fa-check text-3xl text-green-600"></i>
                    </div>
                    <h2 class="text-xl font-bold text-green-700 mb-2">Asistencia confirmada!</h2>
                    <p class="text-gray-600 mb-6">{{ message }}</p>

                    <button @click="resetScanner"
                        class="w-full bg-[#10A697] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#0e9083] transition-colors">
                        Escanear otro paciente
                    </button>
                </div>

                <div v-else class="py-4">
                    <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fa-solid fa-xmark text-3xl text-red-600"></i>
                    </div>
                    <h2 class="text-xl font-bold text-red-700 mb-2">Error</h2>
                    <p class="text-gray-600 mb-6">{{ message }}</p>

                    <button @click="resetScanner"
                        class="w-full bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors">
                        Intentar nuevamente
                    </button>
                </div>
            </div>
        </div>
    </LayoutComponent>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import LayoutComponent from '../components/LayoutComponent.vue'
import { registrarAsistenciaQrApi } from '../api/citas'
import tadaSound from '../assets/audio/ta-da.mp3'

const scanResult = ref(null)
const loading = ref(false)
const success = ref(false)
const message = ref('')
const isCameraRunning = ref(false)
let html5QrCode = null

const onScanSuccess = async (decodedText, decodedResult) => {
    if (scanResult.value) return

    // Detener cámara si está corriendo
    if (isCameraRunning.value) {
        await stopCamera()
    }

    scanResult.value = decodedText
    loading.value = true

    try {
        //console.log('QR Detectado:', decodedText)
        const response = await registrarAsistenciaQrApi(decodedText)

        success.value = true
        message.value = response.message || 'La asistencia ha sido marcada exitosamente.'

        // Reproducir sonido de éxito
        const audio = new Audio(tadaSound)
        audio.play().catch(e => console.error("Error al reproducir sonido:", e))

    } catch (error) {
        console.error('Error al procesar QR:', error)
        success.value = false
        message.value = error.detail || 'No se pudo procesar el código QR. Intente nuevamente.'
    } finally {
        loading.value = false
    }
}

const startCamera = async () => {
    if (!html5QrCode) return

    try {
        const config = { fps: 10, qrbox: { width: 250, height: 250 } }
        // Preferir cámara trasera
        await html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess)
        isCameraRunning.value = true
    } catch (err) {
        console.error("Error starting camera", err)
        alert("No se pudo acceder a la cámara. Por favor verifica los permisos.")
    }
}

const stopCamera = async () => {
    if (html5QrCode && isCameraRunning.value) {
        try {
            await html5QrCode.stop()
            isCameraRunning.value = false
        } catch (err) {
            console.error("Failed to stop camera", err)
        }
    }
}

const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!html5QrCode) return

    try {
        const decodedText = await html5QrCode.scanFile(file, true)
        onScanSuccess(decodedText, null)
    } catch (err) {
        console.error("Error scanning file", err)
        alert("No se pudo leer el código QR de la imagen. Asegúrate de que la imagen sea clara y el código QR esté visible.")
        // Limpiar el input para permitir subir la misma imagen de nuevo si se desea
        event.target.value = ''
    }
}

const resetScanner = () => {
    scanResult.value = null
    loading.value = false
    success.value = false
    message.value = ''
    // No reiniciamos la cámara automáticamente para dar control al usuario
}

onMounted(() => {
    // Inicializar instancia
    html5QrCode = new Html5Qrcode("reader")
})

onBeforeUnmount(async () => {
    if (html5QrCode) {
        if (isCameraRunning.value) {
            try {
                await html5QrCode.stop()
            } catch (e) {
                console.error(e)
            }
        }
        html5QrCode.clear()
    }
})
</script>

<style>
#reader video {
    object-fit: cover;
    border-radius: 0.75rem;
}
</style>
