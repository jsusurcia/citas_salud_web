import { defineStore } from 'pinia';
import { useAuthStore } from './authStore';
import { createOrGetChat, getChatList, getChatHistory } from '../api/chats'

export const useChatStore = defineStore('chat', {
  state: () => ({
    socket: null,
    isConnected: false,

    // lista de todas las conversaciones - bandeja de entrada
    chatList: [],

    // id del chat que el usuario está viendo ahora mismo
    activeChatId: null,

    // para saber a quién reenviar mensajes
    activeChatParticipants: [],

    // objeto para almacenar mensajes por chat
    messagesByChat: {},


    // tiempo de reconexión
    reconnectTimer: null,
  }),

  getters: {
    // para obtener mensajes del chat activo
    activeChatMessages: (state) => {
      if (!state.activeChatId || !state.messagesByChat[state.activeChatId]) {
        return [];
      }
      return state.messagesByChat[state.activeChatId];
    },
    // para saber el id del usuario actual (opcional)
    currentUserId: () => {
      const authStore = useAuthStore();
      // de aquí en el local storage veo si es que está así xd
      return authStore.user?.id;
    }
  },

  actions: {
    /**
     * Inicia la conexión WebSocket.
     */
    connect() {
      const authStore = useAuthStore();
      const token = authStore.token;

      if (!token) {
        console.error('Chat: No se encontró token JWT.');
        return;
      }

      // Limpiar cualquier timer de reconexión pendiente
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      // Evitar conexiones duplicadas
      if (this.socket && this.socket.readyState < 2) {
        console.warn('Chat: Conexión ya existente.');
        return;
      }

      const wsURL = `ws://localhost:8083/ws?token=${token}`;
      console.log('Chat: Conectando a', wsURL);
      this.socket = new WebSocket(wsURL);

      this.setupSocketListeners();
    },

    /**
     * Configura los listeners del socket.
     */
    setupSocketListeners() {
      if (!this.socket) return;

      this.socket.onopen = () => {
        console.log('Chat: Conexión WebSocket establecida.');
        this.isConnected = true;
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Chat: Mensaje recibido:', message);

          const chatId = message.chat_id;

          // si es la primera vez que recibimos mensajes de este chat, se crea el array de mensajes para él
          if (!this.messagesByChat[chatId]) {
            this.messagesByChat[chatId] = [];
          }

          this.messagesByChat[chatId].push(message);

        } catch (error) {
          console.error('Chat: Error al parsear mensaje JSON:', error, event.data);
        }
      };

      this.socket.onclose = (event) => {
        console.warn('Chat: Conexión WebSocket cerrada.', event.reason);
        this.isConnected = false;
        this.socket = null;

        if (event.code !== 1000 && !this.reconnectTimer) {
          console.log('Chat: Intentando reconectar en 5 segundos...');
          this.reconnectTimer = setTimeout(() => {
            this.connect();
          }, 5000);
        }
      };

      this.socket.onerror = (error) => {
        console.error('Chat: Error de WebSocket:', error);
      };
    },

    /**
     * carga la bandeja de entrada
     * solo se llama 1 vez, cuando el usuario entra a la vista de los chats
     */
    async fetchChatList() {
      try {
        const chats = await getChatList();
        this.chatList = chats;
      } catch (error) {
        console.error("Error al cargar la lista de chats:", error);
      }
    },

    /**
     * se llama al hacer clic en un chat de la lista
     */
    async selectChat(chat) {
      try {
        if (!chat || !chat.chat_id) {
          console.error("Intento de seleccionar un chat inválido", chat);
          return;
        }

        const chatId = chat.chat_id;

        // 1. Establece el chat como activo
        this.activeChatId = chatId;
        this.activeChatParticipants = chat.participants;

        // 2. Carga el historial si no lo tenemos
        if (!this.messagesByChat[chatId]) {
          const history = await getChatHistory(chatId);
          // 'history' es un array, lo asignamos directamente
          this.messagesByChat[chatId] = history;
        }
      } catch (error) {
        console.error("Error al seleccionar el chat:", error);
      }
    },

    /**
     * se usa para iniciar un chat con un nuevo usuario
     * (Ej: desde un botón "Chatear" en un perfil de médico).
     */
    async openChatWithUser(recipientId) {
      try {
        // 1. Llama a FastAPI para obtener/crear el chat
        const chatData = await createOrGetChat(recipientId);

        // 2. Llama a nuestra otra acción para seleccionarlo
        // 'chatData' tiene el formato { chat_id, participants, ... }
        await this.selectChat(chatData);

        // (Opcional) Refrescar la lista de chats si este es nuevo
        const chatExists = this.chatList.some(c => c.chat_id === chatData.chat_id);
        if (!chatExists) {
        this.chatList.unshift(chatData); // Añade al inicio
        }

      } catch (error) {
        console.error("Error al obtener/crear el chat:", error);
      }
    },

    /**
     * Envía un mensaje al backend de Go.
     */
    sendMessage(messageText) {
      const authStore = useAuthStore();
      const currentUserId = authStore.user?.id; // O como obtengas el ID

      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        console.error('Chat: Socket no conectado.');
        return;
      }

      if (!this.activeChatId || !currentUserId) {
        console.error('Chat: No hay chat activo o ID de usuario.');
        return;
      }

      // Lógica para obtener los destinatarios
      const recipientIds = this.activeChatParticipants.filter(
        id => id !== currentUserId
      );

      if (recipientIds.length === 0) {
        console.warn("Chat: Intentando enviar mensaje a un chat sin otros participantes.");
        // (podría dejar esto si es un chat con uno mismo, como para notas, maybe luego)
      }

      const payload = {
        text: messageText,
        chat_id: this.activeChatId,
        recipient_ids: recipientIds
      };

      console.log("Chat: Enviando mensaje:", payload);
      this.socket.send(JSON.stringify(payload));
    },

    /**
     * Desconecta manualmente y limpia timers.
     */
    disconnect() {
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      if (this.socket) {
        this.socket.close(1000, 'Cierre manual de sesión');
      }
      this.socket = null;
      this.isConnected = false;
      this.messagesByChat = {};
      this.activeChatId = null;
    }
  }
});