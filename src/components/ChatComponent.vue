<template>
  <div
    class="flex flex-col md:flex-row h-[calc(100dvh-100px)] md:h-[85vh] bg-white md:border md:rounded-2xl overflow-hidden md:shadow-2xl font-sans">

    <div class="flex-col bg-white border-r border-gray-100 w-full md:w-96 flex-shrink-0 transition-all duration-300"
      :class="chatStore.activeChatId ? 'hidden md:flex' : 'flex h-full'">

      <div class="p-5 border-b border-gray-100 bg-white flex justify-between items-center sticky top-0 z-10">
        <h2 class="font-bold text-2xl text-gray-800 tracking-tight">Mensajes</h2>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <div v-for="chat in formattedChats" :key="chat.id" @click="selectChat(chat)"
          class="p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-all duration-200 flex items-center gap-4 group"
          :class="{ 'bg-yellow-50/60 border-l-4 border-l-yellow-500': chatStore.activeChatId === chat.id }">
          <div class="relative">
            <div
              class="w-14 h-14 rounded-full bg-gradient-to-br from-green-100 to-yellow-200 flex-shrink-0 flex items-center justify-center text-green-700 font-bold text-xl shadow-sm group-hover:scale-105 transition-transform">
              {{ chat.name.charAt(0).toUpperCase() }}
            </div>

          </div>

          <div class="overflow-hidden flex-1">
            <div class="flex justify-between items-baseline">
              <p class="font-bold text-gray-900 truncate text-base">{{ chat.name }}</p>
            </div>
            <p class="text-sm text-gray-500 truncate mt-0.5 group-hover:text-green-600 transition-colors">Pulsa para ver
              la conversación</p>
          </div>
        </div>

        <div v-if="formattedChats.length === 0" class="p-10 text-center text-gray-400 flex flex-col items-center">
          <p>No tienes conversaciones activas.</p>
        </div>
      </div>
    </div>

    <div class="flex-col bg-slate-50 w-full h-full relative"
      :class="chatStore.activeChatId ? 'flex' : 'hidden md:flex'">

      <div v-if="activeChatName"
        class="px-4 py-3 md:px-6 md:py-4 bg-white border-b border-gray-100 shadow-sm flex items-center gap-3 z-20 sticky top-0 flex-none">

        <button @click.stop="closeChat"
          class="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors active:bg-gray-200 z-50 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
            class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>

        <div
          class="w-10 h-10 rounded-full bg-gradient-to-br from-green-200 to-yellow-200 flex items-center justify-center text-gray-700 font-bold shadow-sm flex-shrink-0">
          {{ activeChatName.charAt(0) }}
        </div>

        <div class="min-w-0">
          <h3 class="font-bold text-gray-800 text-lg leading-tight truncate">{{ activeChatName }}</h3>
        </div>
      </div>

      <div
        class="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      </div>

      <div ref="messagesContainer"
        class="flex-1 flex flex-col overflow-y-auto p-4 md:p-6 space-y-4 z-10 custom-scrollbar scroll-smooth">

        <div v-if="!chatStore.activeChatId"
          class="h-full hidden md:flex flex-col items-center justify-center text-gray-400 select-none">
          <p class="text-lg font-medium text-gray-500">Selecciona un chat para comenzar</p>
        </div>

        <div v-for="(msg, index) in formattedMessages" :key="msg.id" class="flex flex-col max-w-[85%] md:max-w-[65%]"
          :class="msg.isMe ? 'self-end items-end' : 'self-start items-start'">

          <div class="px-4 py-2 shadow-sm text-[15px] relative transition-all hover:shadow-md" :class="[
            msg.isMe ? 'bg-green-600 text-white rounded-2xl rounded-tr-sm' : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm border border-gray-100',
            msg.type === 'custom' ? 'p-1 bg-transparent shadow-none border-none' : ''
          ]">

            <div v-if="msg.type === 'custom'">
              <CustomLocationMessage :latitude="msg.payload.latitude" :longitude="msg.payload.longitude" />
            </div>

            <div v-else>
              <p class="whitespace-pre-wrap break-words leading-relaxed">{{ msg.text }}</p>
            </div>

            <div class="text-[10px] text-right mt-1.5 leading-none font-medium flex items-center justify-end gap-1"
              :class="msg.isMe ? 'text-green-100' : 'text-gray-400'">
              {{ msg.sentTime }}
              <span v-if="msg.isMe" class="text-white/90">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
                  <path fill-rule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clip-rule="evenodd" />
                </svg>
              </span>
            </div>

          </div>
        </div>
      </div>

      <div v-if="chatStore.activeChatId"
        class="p-3 md:p-4 bg-white border-t border-gray-100 flex items-center gap-3 z-20 flex-none">
        <form @submit.prevent="sendMessage" class="flex-1 flex gap-2 md:gap-3 items-center">
          <input v-model="newMessage" type="text" placeholder="Escribe un mensaje..."
            class="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-3 md:px-6 md:py-3.5 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-gray-700 placeholder-gray-400 text-sm md:text-base" />
          <button type="submit" :disabled="!newMessage.trim()"
            class="bg-green-600 text-white p-3 md:p-3.5 rounded-full hover:bg-green-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 ml-0.5">
              <path
                d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </form>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import CustomLocationMessage from '../components/chat/CustomLocationMessage.vue';

const chatStore = useChatStore();
const authStore = useAuthStore();
const newMessage = ref('');
const messagesContainer = ref(null);

// --- LÓGICA RESPONSIVE ---
const closeChat = () => {
  // Esto debería ocultar el chat y mostrar la lista gracias a las clases CSS reactivas
  chatStore.selectChat(null);
};

// ... (EL RESTO DE TU LÓGICA DE SCRIPT SE MANTIENE IGUAL) ...
// Solo copia el bloque <script> que ya tenías, no es necesario cambiar nada importante ahí,
// pero asegúrate de tener la función closeChat.

// --- DATOS ---
const formattedChats = computed(() => {
  return chatStore.chatList.map(chat => {
    const currentUserId = authStore.currentUserIdForChat || -1;
    const partner = chat.participants.find(p => p.user_id.toString() !== currentUserId.toString());

    let partnerName = 'Chat';
    if (partner) {
      if (partner.rol === 'paciente') partnerName = chat.paciente_nombre || `Paciente ${partner.user_id}`;
      else if (partner.rol === 'personal_medico') partnerName = chat.personal_medico_nombre || `Dr. ${partner.user_id}`;
      else partnerName = `Usuario ${partner.user_id}`;
    }

    return {
      id: chat.chat_id,
      name: partnerName,
      original: chat
    };
  });
});

const activeChatName = computed(() => {
  if (!chatStore.activeChatId) return null;
  const active = formattedChats.value.find(c => c.id === chatStore.activeChatId);
  return active ? active.name : 'Chat';
});

const formattedMessages = computed(() => {
  const rawMessages = chatStore.activeChatMessages || [];
  const myId = (authStore.currentUserIdForChat || '').toString();

  return rawMessages.map(m => {
    const senderId = (m.sender_id || m.user_id).toString();
    const isMe = senderId === myId;

    let type = 'text';
    let payload = {};

    if (m.type === 'location' && m.location) {
      type = 'custom';
      payload = { latitude: m.location.latitude, longitude: m.location.longitude };
    }

    return {
      id: m.id || m._id,
      text: m.text,
      isMe,
      type,
      payload,
      sentTime: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  });
});

// --- ACCIONES ---
const selectChat = (chatWrapper) => {
  if (!chatWrapper) return;
  chatStore.selectChat(chatWrapper.original);
  setTimeout(scrollToBottom, 100);
};

const sendMessage = () => {
  if (!newMessage.value.trim()) return;
  chatStore.sendMessage(newMessage.value);
  newMessage.value = '';
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

watch(() => chatStore.activeChatMessages.length, () => {
  scrollToBottom();
});

onMounted(async () => {
  chatStore.connect();
  await chatStore.fetchChatList();
});

onUnmounted(() => {
  chatStore.disconnect();
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 20px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.2);
}
</style>