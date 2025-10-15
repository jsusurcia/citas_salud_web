<template>
    <div class="calendario-container">
        <vue-cal :time-from="8 * 60" :time-to="19 * 60" :time-step="30" active-view="week"
            :disable-views="['years', 'month']" :events="eventosDisponibilidad"
            :editable-events="{ title: false, drag: true, resize: true, create: true, delete: true }"
            @event-create="crearBloqueDisponibilidad" style="height: 600px;">
        </vue-cal>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { VueCal } from 'vue-cal'
import 'vue-cal/style'

// Array para almacenar los bloques de disponibilidad del doctor
const eventosDisponibilidad = ref([
    // Ejemplo de un bloque ya guardado en la base de datos
    {
        start: '2025-10-15 10:00',
        end: '2025-10-15 12:00',
        title: 'Disponible',
        class: 'bloque-disponible' // Clase CSS para el estilo
    }
]);

// Función que se llama cuando el doctor crea un nuevo bloque
const crearBloqueDisponibilidad = async (event, deleteEventFunction) => {
    // 1. Crea un nuevo objeto de evento
    const nuevoBloque = {
        start: formatDate(event.start), // Formatea la fecha a 'YYYY-MM-DD HH:mm'
        end: formatDate(event.end),
        title: 'Disponible',
        class: 'bloque-disponible'
    };

    // 2. Aquí llamarías a tu API (con Axios, Fetch, etc.) para guardar
    //    este nuevo bloque en tu base de datos.
    //
    //    Ej: const response = await api.post('/disponibilidad', nuevoBloque);

    console.log('Guardando en BD:', nuevoBloque);

    // 3. Añade el bloque al calendario para que se vea inmediatamente
    eventosDisponibilidad.value.push(nuevoBloque);

    return event;
};

// Función de utilidad para formatear la fecha
const formatDate = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
};
</script>

<style>
/* Estilo para los bloques de disponibilidad */
.vuecal__event.bloque-disponible {
    background-color: rgba(25, 135, 84, 0.8);
    /* Verde semi-transparente */
    border: 1px solid rgb(21, 115, 71);
    color: #fff;
}
</style>