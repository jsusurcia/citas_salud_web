import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Creamos una instancia de Axios
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- 2. INTERCEPTOR DE AUTENTICACIÓN ---

// Esto es magia: antes de que CADA petición se envíe,
// interceptamos la petición y le añadimos el token JWT.
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.token;
    
    if (token) {
      // Adjuntamos el token como "Bearer Token"
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Manejo de errores en la configuración de la petición
    return Promise.reject(error);
  }
);

// --- 3. FUNCIONES DE LA API DE CHAT ---

/**
 * Llama al endpoint de FastAPI para crear o encontrar un chat 1-a-1.
 * @param {string} recipientId - El ID del usuario con el que se quiere chatear.
 */
export const createOrGetChat = async (recipientId) => {
  try {
    // Llama al endpoint POST /chats que creamos en FastAPI
    const response = await apiClient.post('/chats/', {
      recipient_id: recipientId,
    });
    // Devuelve los datos del chat: { chat_id, participants, ... }
    return response.data;
  } catch (error) {
    console.error('Error al crear o obtener el chat:', error.response?.data || error.message);
    throw error; // Lanza el error para que el store de Pinia lo atrape
  }
};

/**
 * Obtiene la lista de todos los chats de un usuario.
 */
export const getChatList = async () => {
  try {
    const response = await apiClient.get('/chats/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener la lista de chats:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Obtiene el historial de mensajes de un chat específico.
 */
export const getChatHistory = async (chatId) => {
  try {
    const response = await apiClient.get(`/chats/${chatId}/messages/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el historial del chat:', error.response?.data || error.message);
    throw error;
  }
};
