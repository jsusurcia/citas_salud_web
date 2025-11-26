<script setup>
import { onMounted, watch } from "vue";
import { initFlowbite } from "flowbite";
import { RouterView } from 'vue-router';
import { requestPermission, onMessageListener } from './services/notificationService';
import { useAuthStore } from './stores/authStore';

const authStore = useAuthStore();

const initNotifications = () => {
  if (authStore.token) {
    requestPermission();
    onMessageListener().then(payload => {
      //console.log('Mensaje recibido en primer plano: ', payload);
      // aqui el mansajito o algo p mi shuls
    });
  }
};

// Llama a initFlowbite() cuando el componente principal de la aplicación se monta
onMounted(() => {
  initFlowbite();
  initNotifications();
});

// Escuchar cambios en el token (por si el usuario hace login sin recargar)
watch(() => authStore.token, (newToken) => {
  if (newToken) {
    initNotifications();
  }
});
</script>

<template>
  <RouterView />
</template>

<style scoped></style>
