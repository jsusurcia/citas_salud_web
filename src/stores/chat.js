import { defineStore } from 'pinia';
import { useAuthStore } from './authStore'; 

export const useChatStore = defineStore('chat', {
  state: () => ({
    socket: null,
    isConnected: false,
    messages: [], // Almacenará los mensajes en el formato de MongoDB
    reconnectTimer: null,
  }),

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
        
        // (Opcional) Aquí podrías pedir el historial de chat si es necesario
        // this.fetchHistory(); 
      };

      this.socket.onmessage = (event) => {
        try {
          // **CAMBIO CLAVE**: Parseamos el formato de MongoDB
          const message = JSON.parse(event.data);
          
          console.log('Chat: Mensaje recibido:', message);
          
          // Agregamos el mensaje (formato Mongo) al estado
          this.messages.push(message);

        } catch (error) {
          console.error('Chat: Error al parsear mensaje JSON:', error, event.data);
        }
      };

      this.socket.onclose = (event) => {
        console.warn('Chat: Conexión WebSocket cerrada.', event.reason);
        this.isConnected = false;
        this.socket = null;

        // **NUEVO: LÓGICA DE RECONEXIÓN**
        // No reintenta si fue un cierre manual (código 1000) o si ya hay un timer
        if (event.code !== 1000 && !this.reconnectTimer) {
          console.log('Chat: Intentando reconectar en 5 segundos...');
          this.reconnectTimer = setTimeout(() => {
            this.connect(); // Llama a la acción de conexión de nuevo
          }, 5000); // 5 segundos
        }
      };

      this.socket.onerror = (error) => {
        console.error('Chat: Error de WebSocket:', error);
        // onclose se llamará automáticamente después de onerror
      };
    },

    /**
     * Envía un mensaje al backend de Go.
     */
    sendMessage(messageText) {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        console.error('Chat: No se puede enviar mensaje, socket no conectado.');
        return;
      }

      // Enviamos solo el texto. El backend de Go (con el JWT)
      // debe encargarse de añadir user_id, rol y timestamp.
      const payload = {
        text: messageText,
      };

      this.socket.send(JSON.stringify(payload));
    },

    /**
     * Desconecta manualmente y limpia timers.
     */
    disconnect() {
      // Limpiar timer de reconexión si existe
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      if (this.socket) {
        this.socket.close(1000, 'Cierre manual de sesión'); // Código 1000
      }
      
      // Limpiamos mensajes al desconectar (opcional)
      // this.messages = [];
    }
  }
});