<script setup>
// Si usas FontAwesome con npm, descomenta estas líneas:
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faClock } from '@fortawesome/free-regular-svg-icons'
library.add(faClock)
</script>

<template>
  <div class="bg-gray-50 text-gray-700 font-sans">
    <div class="mx-auto px-4 py-4 max-w-lg flex justify-center flex-col min-h-screen">
      <!-- Logo -->
      <div class="flex justify-center mb-4">
        <img 
          src="/img/citas_salud_logo.png" 
          alt="citas_salud_logo" 
          class="w-64 h-64 object-contain"
        >
      </div>

      <!-- Texto principal -->
      <div class="text-center mb-6">
        <h1 class="text-xl font-bold text-gray-800 mb-2">
          Evaluación en proceso...
        </h1>
        <p class="text-sm leading-relaxed">
          Estamos revisando su solicitud para garantizar la seguridad y cumplir con nuestras normativas.
          Le notificaremos tan pronto como su cuenta esté activada.
          <br>
          <span class="font-medium">¡Gracias por su paciencia!</span>
        </p>
      </div>

      <!-- Ícono en movimiento -->
      <div class="loading mb-6 flex justify-center">
        <svg width="64px" height="48px">
          <polyline 
            points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24" 
            id="back"
          />
          <polyline 
            points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24" 
            id="front"
          />
        </svg>
      </div>

      <!-- Tiempo de espera -->
      <div class="bg-white rounded-lg shadow-md p-4 text-center">
        <font-awesome-icon :icon="['far', 'clock']" class="text-lg mb-1" />
        
        <p class="text-sm text-gray-500 mb-1">
          Tiempo de espera estimado
        </p>
        <span class="text-2xl font-bold text-[#10A697]">
          24 - 48 horas
        </span>
      </div>

      <!-- Footer -->
      <div class="mt-8 text-center text-xs text-gray-400">
        CitaSalud • Salud estable como un roble imparable
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animación del loader */
.loading svg polyline {
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.loading svg polyline#back {
  fill: none;
  stroke: #0A6B61;
}

.loading svg polyline#front {
  fill: none;
  stroke: #5CCFC0;
  stroke-dasharray: 48, 144;
  stroke-dashoffset: 192;
  animation: dash_682 1.4s linear infinite;
}

@keyframes dash_682 {
  72.5% {
    opacity: 0;
  }

  to {
    stroke-dashoffset: 0;
  }
}
</style>