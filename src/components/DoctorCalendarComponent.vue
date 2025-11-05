<template>
    <div class="calendario-container">
        <vue-cal
            :time-from="7 * 60"
            :time-to="22 * 60"
            :time-step="30" 
            active-view="week"
            :disable-views="['years', 'month']"
            :events="eventosDelCalendario" 
            :editable-events="{ title: false, drag: true, resize: true, create: true, delete: true }"
            @event-create="crearBloqueDisponibilidad" 
            @event-drag-stop="actualizarBloqueDisponibilidad"
            @event-resize-stop="actualizarBloqueDisponibilidad"
            :on-event-click="manejarClickEnEvento"
            style="height: 600px;"
            :locale="'es'" >
        </vue-cal>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { VueCal } from 'vue-cal';
import 'vue-cal/style';
// Asumiendo que tienes tu API de disponibilidad aquí
// import { createDisponibilidadApi, updateDisponibilidadApi, deleteDisponibilidadApi } from '../api/disponibilidad'; 

// --- DEFINICIÓN DE PROPS ---
const props = defineProps({
    // Recibimos las citas desde la vista padre
    citas: {
        type: Array,
        default: () => []
    }
});

// --- EMITS ---
const emit = defineEmits(['refresh']); // Para pedirle al padre que recargue

// --- ESTADO INTERNO ---
// Array para almacenar los bloques de DISPONIBILIDAD del doctor
const eventosDisponibilidad = ref([
    {
        start: '2025-10-15 10:00',
        end: '2025-10-15 12:00',
        title: 'Disponible',
        class: 'bloque-disponible',
        type: 'disponibilidad' // Identificador
    }
]);

// --- PROPIEDAD COMPUTADA ---
// Fusiona las citas (props) con la disponibilidad (estado interno)
const eventosDelCalendario = computed(() => {
    // 1. Mapea las citas (vienen del prop)
    const eventosCitas = props.citas.map(cita => ({
        _id: cita.id, // ID original
        start: formatSplitDate(cita.fecha_hora),
        end: formatSplitDate(cita.fecha_hora, 60), // Asumimos 1 hora de cita
        title: getNombrePaciente(cita) || 'Cita Programada',
        class: `cita-${cita.estado?.toLowerCase() || 'confirmada'}`,
        type: 'cita', // Identificador
        data: cita, // Guardamos la data original
        
        // Hacemos que las citas NO sean editables por el médico
        draggable: false,
        resizable: false,
        deletable: false,
    }));

    // 2. Mapea la disponibilidad (estado interno)
    const eventosDisponibles = eventosDisponibilidad.value.map(evento => ({
        ...evento,
        deletable: true, // Aseguramos que la disponibilidad se pueda borrar
        draggable: true,
        resizable: true
    }));

    // 3. Devuelve ambos arrays combinados
    return [...eventosDisponibles, ...eventosCitas];
});

// --- MÉTODOS ---

// Se llama cuando el doctor CREA un nuevo bloque verde
const crearBloqueDisponibilidad = async (event, deleteEventFunction) => {
    const nuevoBloque = {
        start: formatDate(event.start),
        end: formatDate(event.end),
        title: 'Disponible',
        class: 'bloque-disponible',
        type: 'disponibilidad'
    };

    console.log('Guardando en BD (Disponibilidad):', nuevoBloque);
    
    // try {
    //   await createDisponibilidadApi(nuevoBloque);
    //   eventosDisponibilidad.value.push(nuevoBloque);
    // } catch (error) {
    //   console.error("Error al crear disponibilidad", error);
    // }
    
    eventosDisponibilidad.value.push(nuevoBloque); // Temporal
    
    return event;
};

// Se llama cuando el doctor MUEVE o CAMBIA TAMAÑO de un bloque verde
const actualizarBloqueDisponibilidad = async (event) => {
    console.log("Actualizando bloque:", event);
    // Aquí iría la lógica para llamar a updateDisponibilidadApi(event.id, { ... })
};

// Se llama al hacer CLIC en un evento
const manejarClickEnEvento = (event, e) => {
    e.stopPropagation(); // Evita que se cree un nuevo evento
    
    if (event.type === 'cita') {
        console.log("Clic en Cita:", event.data);
        // Aquí podrías emitir un evento para abrir un modal con detalles
        // emit('ver-detalles-cita', event.data);
    } 
    
    if (event.type === 'disponibilidad') {
        console.log("Clic en Disponibilidad:", event);
        // Lógica para editar disponibilidad si es necesario
    }
};


// --- Funciones de Utilidad ---

// Formatea un objeto Date a 'YYYY-MM-DD HH:mm'
const formatDate = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// Formatea un string 'YYYY-MM-DDTHH:mm:ss' a 'YYYY-MM-DD HH:mm'
// y opcionalmente añade minutos
const formatSplitDate = (dateString, addMinutes = 0) => {
    try {
        const fecha = new Date(dateString);
        fecha.setMinutes(fecha.getMinutes() + addMinutes);
        return formatDate(fecha);
    } catch (e) {
        return dateString;
    }
}

const getNombrePaciente = (cita) => {
    if (!cita.paciente) return null;
    const paciente = cita.paciente;
    const nombres = paciente.nombres || paciente.nombre || '';
    const apellidoPaterno = paciente.apellido_paterno || paciente.apellidoPaterno || '';
    return `${nombres} ${apellidoPaterno}`.trim();
}

</script>

<style>
/* Estilo para los bloques de DISPONIBILIDAD */
.vuecal__event.bloque-disponible {
    background-color: rgba(25, 135, 84, 0.8); /* Verde */
    border: 1px solid rgb(21, 115, 71);
    color: #fff;
}

/* Estilos para las CITAS (nuevos) */
.vuecal__event.cita-confirmada {
    background-color: rgba(13, 110, 253, 0.9); /* Azul */
    border: 1px solid rgb(10, 88, 202);
    color: #fff;
}

.vuecal__event.cita-atendida {
    background-color: rgba(108, 117, 125, 0.9); /* Plomo */
    border: 1px solid rgb(84, 92, 98);
    color: #fff;
}

.vuecal__event.cita-en_viaje {
    background-color: rgba(25, 135, 84, 0.9); /* Verde (igual que disponible) */
    border: 1px solid rgb(21, 115, 71);
    color: #fff;
}


/* ... (tus otros estilos de vue-cal) ... */
.vuecal {
    --vuecal-primary-color: #4785a1;
}
.vuecal__arrow,
.vuecal__title-bar {
  color: white;
}
.vuecal__arrow:hover {
  color: #c93533;
}
.vuecal__header .vuecal__title-bar {
  border-bottom: none;
}
.vuecal__weekdays {
  background-color: #4785a1;
  color: #fff;
}
</style>
