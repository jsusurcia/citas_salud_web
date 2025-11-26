<template>
    <div class="location-message-wrapper overflow-hidden border border-gray-200 rounded-lg bg-white shadow-sm relative">

        <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-gray-100 z-10 h-40">
            <span class="text-xs text-gray-500 animate-pulse">Cargando mapa...</span>
        </div>

        <div ref="mapElement" class="w-full h-40 bg-gray-200"></div>

        <div class="p-2 bg-white">
            <div class="flex justify-between items-center mb-2">
                <span class="text-xs font-bold text-gray-700">Ubicación del paciente</span>
                <span class="text-[10px] text-gray-400">Lat: {{ latitude.toFixed(4) }}...</span>
            </div>

            <button @click="openNavigation"
                class="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-3 rounded transition-colors">
                <HugeiconsIcon :icon="Route03Icon" :size="24" color="#ffffff" :stroke-width="1.5" />
                Cómo llegar
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { HugeiconsIcon } from '@hugeicons/vue';
import {
    Route03Icon
} from '@hugeicons/core-free-icons'


const props = defineProps({
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
});

const mapElement = ref(null);
const loading = ref(true);
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
let timeoutId = null;

/**
 * Abre Google Maps en modo "Direcciones"
 * API=1: Versión de la URL
 * origin: No lo ponemos para que use "Mi Ubicación" (GPS del celular) por defecto.
 * destination: Las coordenadas del paciente.
 * travelmode: driving (auto), walking (caminando), etc.
 */
const openNavigation = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${props.latitude},${props.longitude}&travelmode=driving`;
    window.open(url, '_blank');
};

// --- Lógica de Mapa (Igual que tenías, solo un poco más limpia) ---

const loadGoogleMapsScript = () => {
    return new Promise((resolve, reject) => {
        if (window.google && window.google.maps) {
            resolve();
            return;
        }
        // Evitar inyectar el script múltiples veces si ya existe en el DOM
        if (document.querySelector('#google-maps-script')) {
            // Si ya se está cargando, esperamos un poco (simple polling)
            const check = setInterval(() => {
                if (window.google && window.google.maps) {
                    clearInterval(check);
                    resolve();
                }
            }, 100);
            return;
        }

        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

const initMap = () => {
    if (!mapElement.value) return;

    const position = { lat: props.latitude, lng: props.longitude };

    try {
        // Renderizamos el mapa
        const map = new window.google.maps.Map(mapElement.value, {
            zoom: 15,
            center: position,
            disableDefaultUI: true,
            clickableIcons: false
        });

        new window.google.maps.Marker({
            position: position,
            map: map,
        });

        loading.value = false;
    } catch (error) {
        console.error("Error initializing map:", error);
    }
};

onMounted(async () => {
    try {
        await loadGoogleMapsScript();
        // Usamos un pequeño timeout para asegurar que el contenedor tenga dimensiones
        timeoutId = setTimeout(() => {
            // Verificamos si el componente sigue montado (mapElement no es null)
            if (mapElement.value) {
                initMap();
            }
        }, 100);
    } catch (e) {
        console.error("Error cargando mapas", e);
        loading.value = false;
    }
});

onUnmounted(() => {
    if (timeoutId) {
        clearTimeout(timeoutId);
    }
});
</script>

<style scoped>
.location-message-wrapper {
    width: 260px;
    /* Ancho fijo para que no se deforme en el chat */
    max-width: 100%;
}
</style>