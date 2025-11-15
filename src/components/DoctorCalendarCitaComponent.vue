<template>
    <div class="calendario-container">
        <vue-cal
            :time-from="7 * 60"
            :time-to="22 * 60"
            :time-step="30" 
            active-view="week"
            :disable-views="['years', 'month']"
            :events="eventosDelCalendario" 
            :editable-events="false"  
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

// --- DEFINICIÓN DE PROPS ---
const props = defineProps({
    // Recibimos las citas desde la vista padre
    citas: {
        type: Array,
        default: () => []
    }
});

// --- PROPIEDAD COMPUTADA ---
// Fusiona las citas (props)
const eventosDelCalendario = computed(() => {
    // 1. Mapea las citas (vienen del prop)
    const eventosCitas = props.citas.map(cita => ({
        _id: cita.id_cita, // ID original
        
        // --- INICIO DE LA CORRECCIÓN ---
        // Leemos las propiedades 'fecha' y 'hora_inicio' del schema CitaConDetalles
        start: formatDateTime(cita.fecha, cita.hora_inicio),
        // Asumimos 60 min de duración. Tu API de 'Cita_Response' tiene 'duracion_minutos'.
        // Podrías añadir 'duracion_minutos' al schema CitaConDetalles en tu backend.
        end: formatDateTime(cita.fecha, cita.hora_inicio, 60), 
        
        title: getNombrePaciente(cita) || 'Cita Programada',
        class: `cita-${cita.estado_cita?.toLowerCase() || 'confirmada'}`,
        // --- FIN DE LA CORRECCIÓN ---

        type: 'cita', // Identificador
        data: cita, // Guardamos la data original
        
        // Hacemos que las citas NO sean editables
        draggable: false,
        resizable: false,
        deletable: false,
    }));

    // (Quitamos los eventos de disponibilidad, ya que este calendario es solo para citas)
    return eventosCitas;
});

// --- MÉTODOS ---

const manejarClickEnEvento = (event, e) => {
    e.stopPropagation(); 
    if (event.type === 'cita') {
        console.log("Clic en Cita:", event.data);
        // Aquí podrías emitir un evento para abrir un modal con detalles
        // emit('ver-detalles-cita', event.data);
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

// NUEVA Función de Utilidad: Combina fecha y hora
const formatDateTime = (dateStr, timeStr, addMinutes = 0) => {
    try {
        // Combina la fecha (YYYY-MM-DD) y la hora (HH:MM:SS)
        const fecha = new Date(`${dateStr}T${timeStr}`);
        fecha.setMinutes(fecha.getMinutes() + addMinutes);
        return formatDate(fecha);
    } catch (e) {
        return null; // Devuelve null si la fecha es inválida
    }
}

// MODIFICADA: Lee los nuevos campos del schema CitaConDetalles
const getNombrePaciente = (cita) => {
    return `${cita.nombre_paciente || ''} ${cita.apellido_paciente || ''}`.trim() || 'Paciente desconocido';
}

</script>

<style>
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
    background-color: rgba(25, 135, 84, 0.9); /* Verde */
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