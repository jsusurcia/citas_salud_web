<template>
  <div class="chat-container">
    <!-- Selector de usuario actual -->
    <div class="user-selector">
      <label>Usuario actual:</label>
      <select v-model="currentUserId">
        <option value="1234">Alex</option>
        <option value="5678">María</option>
      </select>
    </div>

    <!-- Componente del chat -->
    <vue-advanced-chat
      :current-user-id="currentUserId"
      :rooms="JSON.stringify(rooms)"
      :messages="JSON.stringify(messages)"
      :room-actions="JSON.stringify(roomActions)"
      @send-message="handleSendMessage"
    />
  </div>
</template>

<script>
import { register } from 'vue-advanced-chat'
register()

export default {
  data() {
    return {
      // Usuario actual (puedes cambiarlo en el select)
      currentUserId: '1234',

      // Lista de salas
      rooms: [
        {
          roomId: 'room1',
          roomName: 'Gatita Mall del Sur',
          lastMessage: {
            content: 'Amia pa llantear p puede ser',
            senderId: '5678',
            username: 'María',
            timestamp: new Date().toISOString()
          },
          users: [
            { _id: '1234', username: 'Alex' },
            { _id: '5678', username: 'María' }
          ]
        }
      ],

      // Mensajes de ejemplo
      messages: [
        {
          _id: '1',
          content: 'Hola, ¿cómo estás?',
          senderId: '5678',
          username: 'María',
          timestamp: new Date().toISOString(),
          saved: true,
          distributed: true
        },
        {
          _id: '2',
          content: 'Todo bien, gracias 😄',
          senderId: '1234',
          username: 'Alex',
          timestamp: new Date().toISOString(),
          saved: true,
          distributed: true
        }
      ],

      // Acciones del menú de sala
      roomActions: [
        { name: 'inviteUser', title: 'Invitar usuario' },
        { name: 'removeUser', title: 'Eliminar usuario' },
        { name: 'deleteRoom', title: 'Eliminar sala' }
      ]
    }
  },

  methods: {
    handleSendMessage({ content, roomId }) {
      const newMessage = {
        _id: Date.now().toString(),
        content,
        senderId: this.currentUserId,
        username:
          this.currentUserId === '1234'
            ? 'Alex'
            : 'María',
        timestamp: new Date().toISOString(),
        saved: true,
        distributed: true
      }

      this.messages.push(newMessage)
    }
  }
}
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
