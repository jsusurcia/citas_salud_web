<script setup>
import { onMounted } from "vue";
import { initFlowbite } from "flowbite";
import { RouterView } from 'vue-router';

// Llama a initFlowbite() cuando el componente principal de la aplicación se monta
onMounted(() => {
  initFlowbite();
});
</script>

<template>
  <RouterView />
</template>

<style scoped>
</style>
