<template>
  <div class="calendario-container">
    <vue-cal
      :time-from="7 * 60"
      :time-to="22 * 60"
      :time-step="30"
      :snap-to-time="30"
      active-view="week"
      :disable-views="['years', 'month']"
      :editable-events="{ title: false, drag: true, resize: true, create: true }"
      style="height: 600px"
      locale="es"
      :events="eventosDelCalendario"
      @event-create="crearHorario"
      @event-drag-create="crearHorario"
      @event-resize="actualizarHorario"
      @event-drop="actualizarHorario"
      @event-click="confirmarEliminacion"
    />
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue'
import { VueCal } from 'vue-cal'
import 'vue-cal/style';

// --- 1. Definir Props y Emits ---
const props = defineProps({
  horarios: { type: Array, default: () => [] }
})
const emits = defineEmits(['crear-horario', 'actualizar-horario', 'eliminar-horario'])

// --- 2. Computed: Mapear Horarios a Eventos de Vue-Cal ---
const eventosDelCalendario = computed(() => {
  console.log(`%c--- (ECO) COMPUTED: Recalculando eventos. Total: ${props.horarios.length} ---`, 'color: #28a745');
  return props.horarios.map(horario => ({
    id: horario.id_horario, 
    start: `${horario.fecha} ${horario.hora_inicio.substring(0, 5)}`,
    end: `${horario.fecha} ${horario.hora_fin.substring(0, 5)}`,
    title: horario.en_centro_medico ? 'En Posta' : 'Visita',
    class: horario.en_centro_medico ? 'bloque-disponible' : 'bloque-visita'
  }))
})

// --- 3. Funciones de Utilidad (SIMPLIFICADAS) ---
// Estas funciones ahora SÓLO aceptan objetos Date.
const getFecha = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getHora = (date) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const ajustarFecha = (fecha, intervalo = 30) => {
  const ms = new Date(fecha).getTime();
  const msIntervalo = intervalo * 60 * 1000;
  const msAjustado = Math.round(ms / msIntervalo) * msIntervalo;
  return new Date(msAjustado);
}

// --- 4. Handlers de Eventos de Vue-Cal ---

const emitirCreacion = (fecha, hora_inicio, hora_fin) => {
  const nuevoHorarioData = {
    fecha: fecha,
    hora_inicio: hora_inicio,
    hora_fin: hora_fin,
    en_centro_medico: true, // Por defecto
    nombre_centro_medico: "Posta Principal", 
    direccion_centro_medico: "Plaza de Armas s/n" 
  }
  
  console.log('%c--- 5. Emitiendo @crear-horario hacia la Vista ---', 'color: #ffc107', nuevoHorarioData);
  emits('crear-horario', nuevoHorarioData)
}

/**
 * ¡AQUÍ ESTÁ EL DEBUG!
 * Esta función única ahora maneja CLIC y DRAG.
 */
const crearHorario = (event) => {
  console.log('%c--- 1. @event-create / @event-drag-create disparado ---', 'color: #007bff', event);
  
  let inicio, fin;

  // CASO A: FUE UN ARRASTRE (@event-drag-create)
  if (event.start && event.end) {
    console.log('%c--- 2. Detectado: DRAG (Formato A) ---', 'color: #17a2b8');
    inicio = new Date(event.start); 
    fin = new Date(event.end);

  // CASO B: FUE UN ARRASTRE (@event-create)
  } else if (event.event && event.event.start && event.event.end) {
    console.log('%c--- 2. Detectado: DRAG (Formato B) ---', 'color: #17a2b8');
    inicio = new Date(event.event.start);
    fin = new Date(event.event.end);

  // CASO C: FUE UN CLIC SIMPLE
  } else if (event.cursor?.date) {
    console.log('%c--- 2. Detectado: CLIC (Formato C) ---', 'color: #17a2b8');
    inicio = new Date(event.cursor.date);
    fin = new Date(inicio.getTime() + 30 * 60 * 1000); // +30min
  
  // CASO D: FALLO
  } else {
    console.error('--- ERROR: Formato de evento de creación desconocido ---', event);
    return;
  }

  // --- ¡NUEVO PASO DE AJUSTE! ---
  // Redondeamos las fechas/horas al múltiplo de 30 min más cercano
  const inicioAjustado = ajustarFecha(inicio, 30);
  const finAjustado = ajustarFecha(fin, 30);
  // --- FIN DE AJUSTE ---

  console.log('%c--- 3. Objetos Date procesados ---', 'color: #6f42c1');
  console.log('     Inicio (RAW):', inicio.toString());
  console.log('     Fin (RAW):', fin.toString());
  console.log('     Inicio (Ajustado):', inicioAjustado.toString());
  console.log('     Fin (Ajustado):', finAjustado.toString());

  // Usamos las fechas/horas ajustadas
  const fecha = getFecha(inicioAjustado);
  const hora_inicio = getHora(inicioAjustado);
  const hora_fin = getHora(finAjustado);

  console.log('%c--- 4. Datos finales a emitir ---', 'color: #fd7e14');
  console.log(`     ✅ Fecha: ${fecha}, Inicio: ${hora_inicio}, Fin: ${hora_fin}`);

  emitirCreacion(fecha, hora_inicio, hora_fin);
  return event; 
};


const actualizarHorario = (event) => {
  console.log('%c--- 1. Evento de actualización recibido ---', 'color: #007bff', event);

  // ¡CORRECCIÓN DEL BUG NaN! Leemos desde 'event.event'
  const inicio = new Date(event.event.start);
  const fin = new Date(event.event.end);
  const id = event.event.id;
  
  // --- ¡NUEVO PASO DE AJUSTE! ---
  const inicioAjustado = ajustarFecha(inicio, 30);
  const finAjustado = ajustarFecha(fin, 30);

  console.log('%c--- 2. Fechas de actualización (Ajustadas) ---', 'color: #6f42c1');
  console.log('     Inicio (Ajustado):', inicioAjustado.toString());
  console.log('     Fin (Ajustado):', finAjustado.toString());

  const cambios = {
    fecha: getFecha(inicioAjustado),
    hora_inicio: getHora(inicioAjustado),
    hora_fin: getHora(finAjustado)
  }
  
  console.log(`%c--- 3. Emitiendo @actualizar-horario (ID=${id}) ---`, 'color: #ffc107', cambios);
  emits('actualizar-horario', id, cambios)
}

const confirmarEliminacion = (event) => {
  console.log('%c--- 1. Evento de clic (eliminar) recibido ---', 'color: #dc3545', event);

  // Los datos del evento están en event.event
  const inicio = new Date(event.event.start);
  const fin = new Date(event.event.end);
  const id = event.event.id;
  
  if (confirm(`¿Estás seguro de que quieres eliminar este horario?\n\n` +
               `Día: ${getFecha(inicio)}\n` +
               `Hora: ${getHora(inicio)} - ${getHora(fin)}`)) 
  {
    console.log(`%c--- Emitiendo @eliminar-horario (ID=${id}) ---`, 'color: #ffc107');
    emits('eliminar-horario', id)
  }
}
</script>

<style>
  /* Estilo para los bloques en posta (verde) */
  .vuecal__event.bloque-disponible {
    background-color: rgba(25, 135, 84, 0.8);
    border: 1px solid rgb(21, 115, 71);
    color: #fff;
    cursor: pointer;
  }

  /* Estilo para los bloques de visita (azul) */
  .vuecal__event.bloque-visita {
    background-color: rgba(54, 110, 199, 0.8);
    border: 1px solid rgb(40, 83, 148);
    color: #fff;
    cursor: pointer;
  }

  /* Estilos generales del calendario (los tuyos) */
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