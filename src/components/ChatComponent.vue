<template>
  <div class="chat-container">
    <vue-advanced-chat
      :current-user-id="currentUserId"
      :rooms="JSON.stringify(computedRooms)"
      :messages="JSON.stringify(computedMessages)"
      :messages-loaded="messagesLoaded"
      @send-message="handleSendMessage"
      @fetch-messages="handleRoomChange"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';

import { register } from 'vue-advanced-chat'
register()

// --- 1. Inicializar Stores ---
const chatStore = useChatStore()
const authStore = useAuthStore()

// --- 2. Estado del componente ---
// ID del usuario actual.
// ¡CAMBIO CLAVE!: La librería requiere un STRING. Tu ID de usuario es un NÚMERO.
const currentUserId = computed(() => {
  return authStore.user?.id.toString() || 'id_desconocido';
});

// INDICA SI SE CARGÓ UN CHAT
// Le dice a la librería que el historial de un chat ya se cargó.
const messagesLoaded = computed(() => {
  // Es 'true' si el array de mensajes para el chat activo YA existe en el store
  return chatStore.messagesByChat[chatStore.activeChatId] != null;
});

// --- 3. Mapeo de "Store" a "Librería" (Las partes más importantes) ---

/**
 * TRADUCTOR 1: Convierte la 'chatList' del Store al formato 'rooms' de la librería.
 */
const computedRooms = computed(() => {
  return chatStore.chatList.map(chat => {
    // Busca al otro participante (asumiendo 1 a 1)
    const partnerId = chat.participants.find(id => id !== currentUserId.value);
    
    // Idealmente, FastAPI debería devolver el nombre del 'partnerId'.
    // Por ahora, solo mostramos su ID o "Chat Grupal".
    const partnerName = partnerId ? `Chat con ${partnerId}` : 'Chat Grupal';
    
    return {
      roomId: chat.chat_id,
      roomName: partnerName,
      // La librería necesita este array para saber quién está en la sala
      users: chat.participants.map(id => ({
        _id: id.toString(),
        username: id.toString() === currentUserId.value 
          ? authStore.user.nombre // ¡Tu nombre!
          : `Usuario ${id}`     // El nombre del otro
      }))
    };
  });
});

/**
 * TRADUCTOR 2: Convierte los 'activeChatMessages' del Store al formato 'messages' de la librería.
 */
const computedMessages = computed(() => {
  // Usamos el getter que ya creamos en el store
  return chatStore.activeChatMessages.map(msg => {
    
    // --- 🚨 ¡POSIBLE BUG EN TU CÓDIGO! ---
    // Tu FastAPI (historial) envía 'sender_id' y 'id'.
    // Tu Go (tiempo real) envía 'user_id' y '_id'.
    // Este map maneja AMBOS casos para que no se rompa.
    const sender = (msg.user_id || msg.sender_id || 'desconocido').toString();

    return {
      _id: msg.id || msg._id,      // Maneja ambos
      content: msg.text,
      senderId: sender,            // Maneja ambos
      timestamp: new Date(msg.timestamp).toLocaleString('es-PE'), // Formatea la fecha
      
      // Lógica para el nombre de usuario (puedes mejorarla)
      username: sender === currentUserId.value ? 'Tú' : `Usuario ${sender}`,
      
      // Ticks de "enviado" y "visto"
      saved: true,
      distributed: true,
      seen: true,
    };
  });
});

// --- 4. Métodos (Acciones) ---

/**
 * Se dispara cuando la librería cambia de sala.
 * Es el "PEGAMENTO" que sincroniza la librería con nuestro store.
 */
const handleRoomChange = (event) => {
  //event.detail.room.roomId
  if (!event.detail || !event.detail.room || !event.detail.room.roomId) {
    console.warn('handleRoomChange fue llamado sin una sala válida, ignorando.');
    return; // <-- Sal de la función
  }
  
  const newRoomId = event.detail.room.roomId;
  
  // Busca el objeto 'chat' completo en nuestro store
  const chat = chatStore.chatList.find(c => c.chat_id === newRoomId);
  
  if (chat) {
    // Llama a nuestra acción de Pinia para cargar el historial
    // y marcar este chat como activo.
    chatStore.selectChat(chat);
  }
};

/**
 * Se dispara cuando el usuario presiona "enviar" en la UI.
 */
const handleSendMessage = (event) => {
  // event.content (el texto)
  // event.roomId (ya no lo necesitamos, el store sabe cuál está activo)
  
  const text = event.content.trim();
  if (!text) {
    return;
  }

  // ¡Simple! Solo llamamos a la acción del store.
  // El store ya sabe el 'activeChatId' y los 'recipientIds'
  // gracias a que 'handleRoomChange' llamó a 'selectChat'.
  chatStore.sendMessage(text);
};

// --- 5. Ciclo de Vida (Gestión de la Conexión) ---

onMounted(() => {
  // 1. Conecta el WebSocket
  chatStore.connect();
  
  // 2. Carga la "bandeja de entrada" (lista de salas) desde FastAPI
  chatStore.fetchChatList();
});

onUnmounted(() => {
  // Desconecta al salir.
  // Tu comentario sobre HMR (Hot Module Replacement) es 100% correcto.
  // En desarrollo, esto es molesto, pero en producción es necesario.
  chatStore.disconnect();
});

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
