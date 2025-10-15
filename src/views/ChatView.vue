<template>
    <LayoutComponent>
        <!-- Título y descripción -->
        <h1 class="mb-4 text-2xl font-bold text-gray-700">AURA</h1>
        <div class="mb-4">
            <ChatComponent/>
        </div>
    </LayoutComponent>
</template>

<script setup>
import ChatComponent from '../components/ChatComponent.vue';
import LayoutComponent from '../components/LayoutComponent.vue';
</script>