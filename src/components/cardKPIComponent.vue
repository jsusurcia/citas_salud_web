<script setup>
defineProps({
    value: {
        type: Number,
        required: true
    },
    label: {
        type: String,
        required: true
    }
})
</script>

<template>
    <div class="p-6 bg-white border border-gray-200 rounded-lg">
        <h5 class="mb-2 text-2xl font-bold">{{ value }}</h5>
        <p class="font-normal text-gray-500">{{ label }}</p>
    </div>
</template>

<style scoped>
</style>