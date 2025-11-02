<script setup>
import { computed } from 'vue';

// Props
const props = defineProps({
    variant: {
        type: String,
        default: 'primary',
        validator: (value) => ['primary', 'secondary', 'danger', 'info'].includes(value)
    },
    label: {
        type: String,
        default: ''
    }
});

// Propiedades Computadas
const labelClass = computed(() => {
    const baseClass = 'text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap';

    const variantClass = {
        primary: 'bg-green-100 text-green-800',
        secondary: 'bg-red-100 text-red-800',
        danger: 'bg-yellow-100 text-yellow-800',
        info: 'bg-indigo-100 text-indigo-800'
    };

    return `${baseClass} ${variantClass[props.variant]}`;
});
</script>

<template>
    <span :class="labelClass">{{ label }}</span>
</template>

<style scoped>
</style>