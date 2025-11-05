<template>
  <div class="chat-container">
    <vue-advanced-chat
      :current-user-id="currentUserId"
      :rooms="JSON.stringify(computedRooms)"
      :rooms-loaded="chatStore.chatList.length > 0"
      :messages="JSON.stringify(computedMessages)"
      :messages-loaded="messagesLoaded"
      @fetch-messages="handleRoomChange"
      @send-message="handleSendMessage($event.detail[0])"
    />
  </div>
</template>

<script setup>
import { register } from 'vue-advanced-chat'
register()

import { computed, onMounted, onUnmounted } from 'vue';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';

// --- 1. Inicializar Stores ---
const chatStore = useChatStore();
const authStore = useAuthStore();

// --- 2. Conexión de Props (Store -> Librería) ---

// :current-user-id
// La librería REQUIERE un string. Tu 'user.id' es un NÚMERO.
const currentUserId = computed(() => {
  return authStore.user?.id.toString() || 'id_desconocido';
});

// :rooms
// TRADUCE el 'chatList' de nuestro store al formato 'rooms' de la librería
const computedRooms = computed(() => {
  return chatStore.chatList.map(chat => {
    // Busca al otro participante (asumiendo 1 a 1)
    const partner = chat.participants.find(p => p.user_id !== currentUserId.value);
    
    // Idealmente, FastAPI debería devolver el nombre del 'partner'.
    // Por ahora, solo mostramos su ID o "Chat Grupal".
    const partnerName = partner ? `Chat con ${partner.user_id}` : 'Chat Grupal';
    
    return {
      roomId: chat.chat_id,
      roomName: partnerName,
      users: chat.participants.map(p => ({
        _id: p.user_id.toString(),
        username: p.user_id.toString() === currentUserId.value 
          ? authStore.user.nombre // Tu nombre
          : `Usuario ${p.user_id}` // El nombre del otro
      }))
    };
  });
});

// :messages
// TRADUCE los mensajes del store al formato de la librería
const computedMessages = computed(() => {
  // Usa el getter que ya creamos en el store
  return chatStore.activeChatMessages.map(msg => {
    // Estandariza el lío de 'id' vs '_id' y 'sender_id' vs 'user_id'
    const sender = (msg.sender_id || msg.user_id || 'desconocido').toString();

    return {
      _id: msg.id || msg._id,
      content: msg.text,
      senderId: sender,
      timestamp: new Date(msg.timestamp).toLocaleString('es-PE'),
      username: sender === currentUserId.value ? 'Tú' : `Usuario ${sender}`,
      saved: true,
      distributed: true,
      seen: true,
    };
  });
});

// :messages-loaded
// Indica a la librería si el historial de la sala activa ya se cargó
const messagesLoaded = computed(() => {
  return chatStore.messagesByChat[chatStore.activeChatId] != null;
});

// --- 3. Conexión de Eventos (Librería -> Store) ---

/**
 * Se dispara cuando el usuario HACE CLIC en una sala de la lista.
 * Le dice a nuestro store que cargue el historial de esa sala.
 * (Reemplaza a 'fetchMessages' de la plantilla)
 */
const handleRoomChange = (event) => {
  // Validación de seguridad (la que hicimos antes)
  if (!event.detail || !event.detail.room || !event.detail.room.roomId) {
    console.warn('handleRoomChange llamado sin sala, ignorando.');
    return;
  }

  const newRoomId = event.detail.room.roomId;
  
  // Busca el objeto 'chat' completo en nuestra lista
  const chat = chatStore.chatList.find(c => c.chat_id === newRoomId);
  
  if (chat) {
    // ¡Llama a la acción de Pinia!
    chatStore.selectChat(chat);
  }
};

/**
 * Se dispara cuando el usuario ENVÍA un mensaje.
 * Le dice a nuestro store que envíe el mensaje por WebSocket.
 * (Reemplaza a 'sendMessage' de la plantilla)
 */
const handleSendMessage = (message) => {
  // 'message' ES el objeto { content: '...', senderId: '...' }
  const text = message.content.trim(); 
  if (!text) {
    return;
  }
  chatStore.sendMessage(text);
};

// --- 4. Ciclo de Vida ---

onMounted(async () => {
  // 1. Conecta el WebSocket
  chatStore.connect();
  
  // 2. Carga la "bandeja de entrada" Y ESPERA a que termine
  await chatStore.fetchChatList();

  // 3. ¡NUEVA LÓGICA!
  // Si la lista de chats no está vacía,
  // selecciona el primer chat automáticamente.
  if (chatStore.chatList.length > 0) {
    console.log("Carga inicial: Seleccionando el primer chat.");
    await chatStore.selectChat(chatStore.chatList[0]);
  }
});

onUnmounted(() => {
  // 3. Desconecta al salir
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
