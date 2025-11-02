<script setup>
import { computed } from 'vue';

// Props
const props = defineProps({
    type: {
        type: String,
        default: 'button'   //'button' o 'success'
    },
    variant: {
        type: String,
        default: 'primary',
        validator: (value) => ['primary', 'secondary', 'success', 'danger', 'warning', 'edit', 'disable', 'enable'].includes(value)
    },
    size: {
        type: String,
        default: 'medium',   //'small', 'medium', 'large'
        validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    icon: {
        type: String,
        default: ''
    },
    label: {
        type: String,
        default: ''
    }
});

// Component Events
const emit = defineEmits(['click']);
const handleClick = (event) => {
    emit('click', event);
};

// Propiedades Computadas
const buttonClass = computed(() => {
    const baseClass = 'font-medium rounded-lg inline-flex items-center justify-center gap-2 focus:ring-2 focus:outline-none';

    const sizeClass = {
        small: 'text-xs px-3 py-2',
        medium: 'text-sm px-4 py-2',
        large: 'text-sm px-5 py-2.5'
    };

    const variantClass = {
        primary: 'text-white bg-[#10A697] hover:bg-[#0e8e85] focus:ring-[#0e8e85]',
        secondary: 'text-gray-900 bg-gray-100 hover:bg-gray-200 focus:ring-gray-100',
        success: 'text-white bg-green-600 hover:bg-green-700 focus:ring-green-600',
        danger: 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-600',
        warning: 'text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500',
        edit: 'text-gray-900 bg-gray-100 hover:bg-gray-200 focus:ring-gray-100 font-normal',
        disable: 'text-red-800 bg-red-100 hover:bg-red-200 focus:ring-red-100 font-normal',
        enable: 'text-green-800 bg-green-100 hover:bg-green-200 focus:ring-green-100 font-normal'
    };

    return `${baseClass} ${sizeClass[props.size]} ${variantClass[props.variant]}`;
})
</script>

<template>
    <button :type="type" :class="buttonClass" @click="handleClick">
        <i v-if="icon" :class="icon"></i>
        <span v-if="label">{{ label }}</span>
    </button>
</template>

<style scoped>
</style>