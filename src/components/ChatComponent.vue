<template>
  <div class="chat-container">
    <vue-advanced-chat :current-user-id="currentUserId" :rooms="JSON.stringify(chatRooms)"
      :messages="JSON.stringify(formattedMessages)" :room-actions="JSON.stringify(roomActions)"
      :messages-loaded="messagesLoaded" @send-message="handleSendMessage" />
  </div>
</template>

<script setup>
import { register } from 'vue-advanced-chat'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useChatStore } from '../stores/chat.js'
import { useAuthStore } from '../stores/authStore'

register()

// --- 1. Inicializar Stores ---
const chatStore = useChatStore()
const authStore = useAuthStore()

// --- 2. Estado del componente ---

// ID del usuario actual -> viene del login de FastAPI
const currentUserId = computed(() => authStore.user?.id || 'id_desconocido')

// Como dijiste que es Paciente <-> Médico, podemos definir una sala estática.
// En un futuro, esto podría venir de una API.
const chatRooms = ref([
  {
    roomId: 'chat_principal_medico', // Un ID de sala único
    roomName: 'Chat Cita Salud', // El nombre que verá el usuario
    users: [
      // { _id: 'ID_PACIENTE', username: 'Paciente...' },
      // { _id: 'ID_MEDICO', username: 'Dr. ...' }
    ]
  }
])

// Acciones de sala (puedes mantener las que tenías)
const roomActions = ref([
  { name: 'deleteRoom', title: 'Eliminar chat' }
])

// Indica a la librería si los mensajes iniciales se han cargado
const messagesLoaded = computed(() => chatStore.messages.length > 0)

// --- 3. Mapeo de Mensajes (La parte más importante) ---

// `vue-advanced-chat` espera un formato, y tu Mongo tiene otro.
// Esta propiedad computada hace la "traducción".
const formattedMessages = computed(() => {
  return chatStore.messages.map(mongoMsg => {
    return {
      _id: mongoMsg._id,
      content: mongoMsg.text,            // Mapeo: text -> content
      senderId: mongoMsg.user_id,        // Mapeo: user_id -> senderId
      timestamp: mongoMsg.timestamp,
      username: mongoMsg.rol === 'paciente' ? 'Paciente' : 'Personal Médico', // Asignamos username según el rol

      // La librería usa esto para mostrar el tick de "enviado"
      saved: true,
      distributed: true,
    }
  })
})

// --- 4. Métodos (Acciones) ---

/**
 * Se dispara cuando el usuario presiona "enviar" en la UI.
 */
const handleSendMessage = (event) => {
  // event contiene { content, roomId, ... }
  
  // 💡 AÑADE ESTA VALIDACIÓN
  const text = event.content.trim();
  if (!text) {
    // Si el mensaje está vacío o solo tiene espacios, no hagas nada.
    return; 
  }

  // Llamamos a nuestra acción de Pinia solo si hay texto
  chatStore.sendMessage(text);
}
// --- 5. Ciclo de Vida ---

onMounted(() => {
  // Conectar al WebSocket cuando el componente se monta
  chatStore.connect()

  // (Opcional) Si necesitas cargar el historial al inicio:
  // await chatStore.fetchMessageHistory();
})

onUnmounted(() => {
  // Desconectar al salir de la vista para limpiar
  
  // 🛑 ¡COMENTA ESTA LÍNEA MIENTRAS DESARROLLAS!
  // chatStore.disconnect()
  
  // El HMR de Vite está causando que esto se llame
  // constantemente, creando un bucle de desconexión.
  // En producción (npm run build), sí funcionará bien.
})

</script>


<style>
.chat-container {
  width: 100%;
  height: 100vh;
  background-color: #f4f6f8;
  display: flex;
  flex-direction: column;
}

.user-selector {
  padding: 10px;
  background: #209ead;
  color: white;
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
