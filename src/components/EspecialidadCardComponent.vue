<script setup>
// Importar componentes
import { computed } from 'vue';
import ButtonComponent from './ButtonComponent.vue';
import SpanComponent from './SpanComponent.vue';

// Props
const props = defineProps({
    title: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    durationMinutes: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        default: 0
    },
    isEnabled: {
        type: Boolean,
        default: true
    }
});

// Component Events
const emit = defineEmits(['edit', 'disable', 'enable', 'delete']);

// Propiedades Computadas
const spanVariant = computed(() => {
    return props.isEnabled ? 'primary' : 'secondary';
});
const spanLabel = computed(() => {
    return props.isEnabled ? 'Habilitado' : 'Deshabilitado';
});
const formattedPrice = computed(() => {
    return Number.isFinite(props.price) ? props.price.toFixed(2) : Number(props.price || 0).toFixed(2);
});
</script>

<template>
    <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
        <div class="p-4 pt-16 bg-gray-100 border-b border-gray-200 flex justify-between items-end">
            <h5 class="text-xl font-semibold text-gray-900">{{ title }}</h5>
            <SpanComponent :variant="spanVariant" :label="spanLabel" />
        </div>
        <div class="p-4 flex flex-col justify-between flex-grow">
            <p class="text-gray-600 text-sm mb-4">{{ description }}</p>
            <div class="text-sm text-gray-500 space-y-1 mb-4">
                <p><span class="font-semibold text-gray-700">Duración:</span> {{ durationMinutes }} min</p>
                <p><span class="font-semibold text-gray-700">Precio:</span> S/ {{ formattedPrice }}</p>
            </div>
            <div class="flex flex-wrap gap-2 justify-end mt-auto">
                <ButtonComponent type="button" variant="edit" size="medium" icon="fa-regular fa-pen-to-square" label="Editar"
                @click="emit('edit')" />
                <ButtonComponent v-if="isEnabled" type="button" variant="danger" size="medium" icon="fa-solid fa-trash" label="Eliminar"
                @click="emit('delete')" />
                <ButtonComponent v-if="isEnabled" type="button" variant="disable" size="medium" icon="fa-solid fa-ban" label="Deshabilitar" 
                @click="emit('disable')" />
                <ButtonComponent v-else type="button" variant="enable" size="medium" icon="fa-solid fa-check" label="Habilitar" 
                @click="emit('enable')" />
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>