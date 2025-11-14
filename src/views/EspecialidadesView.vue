<script setup>
import { ref, onMounted, computed } from 'vue'
import LayoutComponent from '../components/LayoutComponent.vue'
import ModalForm from '../components/ModalForm.vue'
import ConfirmModalComponent from '../components/ConfirmModalComponent.vue'
import ButtonComponent from '../components/ButtonComponent.vue'
import EspecialidadCardComponent from '../components/EspecialidadCardComponent.vue'
import { getEspecialidadesApi, createEspecialidadApi, updateEspecialidadApi, updateEstadoEspecialidadApi, deleteEspecialidadApi } from '../api/especialidades'
import LoaderComponent from '../components/LoaderComponent.vue'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()

const activeModal = ref(null)
const selectedEspecialidad = ref(null)
const form = ref({
  nombre: '',
  descripcion: '',
  duracionMinutos: 20,
  precio: 0
})
const especialidades = ref([])
const loading = ref(false)
const errorMessage = ref('')
const creating = ref(false)

// Verificar si el usuario es admin
const isAdmin = computed(() => {
  return authStore.user?.rol === 'admin'
})

// Cargar especialidades del backend
const loadEspecialidades = async () => {
  loading.value = true
  errorMessage.value = ''
  
  try {
    console.log('🔄 Cargando especialidades...')
    const data = await getEspecialidadesApi()
    
    // Mapear los datos del backend al formato esperado por el componente
    // IMPORTANTE: Mapeamos explícitamente el estado para mostrar tanto true como false
    especialidades.value = data.map(esp => ({
      id: esp.id_especialidad || esp.id,
      nombre: esp.nombre,
      descripcion: esp.descripcion || '',
      duracionMinutos: Number(esp.duracion_minutos ?? esp.duracionMinutos ?? 0),
      precio: Number(esp.precio ?? 0),
      habilitada: esp.estado === true // Mapeo explícito: true si estado es true, false si es false o null/undefined
    }))
    
    console.log('✅ Especialidades cargadas:', especialidades.value.length)
  } catch (error) {
    console.error('❌ Error al cargar especialidades:', error)
    
    // Mostrar mensaje de error
    if (error.detail) {
      errorMessage.value = error.detail
    } else if (error.message) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Error al cargar las especialidades'
    }
  } finally {
    loading.value = false
  }
}

// Cargar especialidades cuando el componente se monta
onMounted(() => {
  loadEspecialidades()
})

// Abrir modal de agregar
const closeModal = () => {
  activeModal.value = null
  selectedEspecialidad.value = null // Limpiamos la selección al cerrar
  // No limpiamos errorMessage aquí para que se vea si hay un error al crear
};

const openAddModal = () => {
  form.value = {
    nombre: '',
    descripcion: '',
    duracionMinutos: 20,
    precio: 0
  } // Reseteamos el formulario
  errorMessage.value = '' // Limpiar errores previos
  activeModal.value = 'add'
};

// Crear especialidad
const handleCreate = async () => {
  if (!form.value.nombre.trim()) {
    errorMessage.value = 'El nombre es requerido'
    return
  }

  const duracion = Number(form.value.duracionMinutos)
  if (!Number.isFinite(duracion) || duracion <= 0) {
    errorMessage.value = 'La duración debe ser mayor a cero minutos'
    return
  }

  const precio = Number(form.value.precio)
  if (!Number.isFinite(precio) || precio < 0) {
    errorMessage.value = 'El precio no puede ser negativo'
    return
  }
  
  // Verificar que el usuario tenga permisos de admin
  const user = authStore.user
  if (!user || user.rol !== 'admin') {
    errorMessage.value = 'Solo los administradores pueden crear especialidades'
    return
  }
  
  creating.value = true
  errorMessage.value = ''
  
  try {
    console.log('➕ Creando especialidad...', form.value)
    console.log('👤 Usuario actual:', user)
    
    // Preparar los datos según el formato esperado por el backend
    const especialidadData = {
      nombre: form.value.nombre.trim(),
      descripcion: form.value.descripcion?.trim() || '',
      duracion_minutos: Math.round(duracion),
      precio: Number(precio.toFixed(2))
    }
    
    // Llamar a la API del backend
    const nuevaEspecialidad = await createEspecialidadApi(especialidadData)
    
    console.log('✅ Especialidad creada:', nuevaEspecialidad)
    
    // Mapear la respuesta del backend al formato esperado
    const especialidadMapeada = {
      id: nuevaEspecialidad.id_especialidad || nuevaEspecialidad.id,
      nombre: nuevaEspecialidad.nombre,
      descripcion: nuevaEspecialidad.descripcion || '',
      duracionMinutos: Number(nuevaEspecialidad.duracion_minutos ?? nuevaEspecialidad.duracionMinutos ?? 0),
      precio: Number(nuevaEspecialidad.precio ?? 0),
      habilitada: nuevaEspecialidad.estado === true // Mapeo explícito para mostrar estado correcto
    }
    
    // Cerrar el modal
    closeModal()
    
    // Limpiar mensajes de error
    errorMessage.value = ''
    
    // Recargar todas las especialidades para asegurar consistencia con el backend
    await loadEspecialidades()
    
    console.log('✅ Especialidad creada exitosamente')
    
  } catch (error) {
    console.error('❌ Error al crear especialidad:', error)
    
    // Mostrar mensaje de error más específico
    let errorMsg = 'Error al crear la especialidad'
    
    if (error.response?.status === 403) {
      errorMsg = 'No tienes permisos para crear especialidades. Solo los administradores pueden realizar esta acción.'
    } else if (error.detail) {
      errorMsg = error.detail
    } else if (error.message) {
      errorMsg = error.message
    }
    
    errorMessage.value = errorMsg
  } finally {
    creating.value = false
  }
};

// Abrir modal de editar
const openEditModal = (especialidad) => {
  selectedEspecialidad.value = especialidad
  form.value = {
    nombre: especialidad.nombre,
    descripcion: especialidad.descripcion,
    duracionMinutos: Number(especialidad.duracionMinutos ?? 0),
    precio: Number(especialidad.precio ?? 0)
  } // Copiamos los datos al formulario
  activeModal.value = 'edit'
};

// Guardar edición
const handleEdit = async () => {
  
  if(!selectedEspecialidad.value) return

  if(!form.value.nombre.trim()){
    errorMessage.value = 'El nombre es requerido'
    return
  }

  const duracion = Number(form.value.duracionMinutos)
  if (!Number.isFinite(duracion) || duracion <= 0) {
    errorMessage.value = 'La duración debe ser mayor a cero minutos'
    return
  }

  const precio = Number(form.value.precio)
  if (!Number.isFinite(precio) || precio < 0) {
    errorMessage.value = 'El precio no puede ser negativo'
    return
  }

  //Verificar que el usuario tenga permisos de admin
  const user = authStore.user
  if(!user || user.rol !== 'admin'){
    errorMessage.value = 'Solo los administradores pueden editar especialidades'
    return
  }

  creating.value = true
  errorMessage.value = ''

  try{
    console.log('✅ Actualizando especialidad...', { especialidadId: selectedEspecialidad.value.id, especialidadData: form.value })
    console.log('👤 Usuario actual:', user)

    //Preparar los datos según el formato esperado por el backend
    const especialidadData = {
      nombre: form.value.nombre.trim(),
      descripcion: form.value.descripcion?.trim() || '',
      duracion_minutos: Math.round(duracion),
      precio: Number(precio.toFixed(2))
    }

    //Llamar a la API del backend
    const especialidadActualizada = await updateEspecialidadApi(selectedEspecialidad.value.id, especialidadData)

    console.log('✅ Especialidad actualizada:', especialidadActualizada)

    //Mapear la respuesta del backend al formato esperado
    const especialidadMapeada = {
      id: especialidadActualizada.id_especialidad || especialidadActualizada.id,
      nombre: especialidadActualizada.nombre,
      descripcion: especialidadActualizada.descripcion || '',
      duracionMinutos: Number(especialidadActualizada.duracion_minutos ?? especialidadActualizada.duracionMinutos ?? 0),
      precio: Number(especialidadActualizada.precio ?? 0),
      habilitada: especialidadActualizada.estado === true // Mapeo explícito para mostrar estado correcto
    }

    //Cerrar el modal
    closeModal()

    //Limpiar mensajes de error
    errorMessage.value = ''

    //Recargar todas las especialidades para asegurar consistencia con el backend
    await loadEspecialidades()

    console.log('✅ Especialidad actualizada exitosamente')
  } catch (error) {
    console.error('❌ Error al actualizar especialidad:', error)
    
    //Mostrar mensaje de error más específico
    let errorMsg = 'Error al actualizar la especialidad'
    
    if (error.response?.status === 404) {
      errorMsg = 'Especialidad no encontrada'
    } else if (error.response?.status === 403) {
      errorMsg = 'No tienes permisos para actualizar especialidades. Solo los administradores pueden realizar esta acción.'
    } else if (error.detail) {
      errorMsg = error.detail
    } else if (error.message) {
      errorMsg = error.message
    }
    errorMessage.value = errorMsg
    console.error('❌ Error al actualizar especialidad:', errorMsg)
  } finally {
    creating.value = false
  }
}

// Abrir modal de confirmación para cambiar estado
const openConfirmModal = (especialidad) => {
  selectedEspecialidad.value = especialidad
  // Decidimos qué modal abrir basado en el estado actual
  activeModal.value = especialidad.habilitada ? 'disableConfirm' : 'enableConfirm'
  errorMessage.value = '' // Limpiar errores previos
}

// Cambiar estado de especialidad (habilitar/deshabilitar)
const handleToggleStatus = async () => {
  if (!selectedEspecialidad.value) return
  
  // Verificar que el usuario tenga permisos de admin
  const user = authStore.user
  if (!user || user.rol !== 'admin') {
    errorMessage.value = 'Solo los administradores pueden cambiar el estado de especialidades'
    closeModal()
    return
  }
  
  creating.value = true
  errorMessage.value = ''
  
  try {
    const especialidadId = selectedEspecialidad.value.id
    const nuevoEstado = !selectedEspecialidad.value.habilitada // Invertir el estado actual
    
    console.log('🔄 Cambiando estado de especialidad...', { 
      especialidadId, 
      estadoActual: selectedEspecialidad.value.habilitada,
      nuevoEstado 
    })
    
    // Llamar a la API del backend
    // El backend espera PATCH /especialidades/{id}/estado con { estado: boolean }
    const especialidadActualizada = await updateEstadoEspecialidadApi(
      especialidadId,
      nuevoEstado
    )
    
    console.log('✅ Estado actualizado:', especialidadActualizada)
    
    // Cerrar el modal
    closeModal()
    
    // Limpiar mensajes de error
    errorMessage.value = ''
    
    // Recargar todas las especialidades para asegurar consistencia con el backend
    await loadEspecialidades()
    
    console.log('✅ Estado de especialidad cambiado exitosamente')
    
  } catch (error) {
    console.error('❌ Error al cambiar estado de especialidad:', error)
    
    // Mostrar mensaje de error más específico
    let errorMsg = 'Error al cambiar el estado de la especialidad'
    
    if (error.response?.status === 404) {
      errorMsg = 'Especialidad no encontrada'
    } else if (error.response?.status === 403) {
      errorMsg = 'No tienes permisos para cambiar el estado. Solo los administradores pueden realizar esta acción.'
    } else if (error.detail) {
      errorMsg = error.detail
    } else if (error.message) {
      errorMsg = error.message
    }
    
    errorMessage.value = errorMsg
  } finally {
    creating.value = false
  }
}

// Abrir modal de eliminar
const openDeleteModal = (especialidad) => {
  selectedEspecialidad.value = especialidad
  activeModal.value = 'deleteConfirm'
  errorMessage.value = ''
}

// Eliminar especialidad
const handleDelete = async () => {
  if (!selectedEspecialidad.value) return

  const user = authStore.user
  if (!user || user.rol !== 'admin') {
    errorMessage.value = 'Solo los administradores pueden eliminar especialidades'
    closeModal()
    return
  }

  creating.value = true
  errorMessage.value = ''

  try {
    const especialidadId = selectedEspecialidad.value.id
    console.log('🗑️ Eliminando especialidad...', { especialidadId })
    await deleteEspecialidadApi(especialidadId)

    closeModal()
    await loadEspecialidades()
    console.log('✅ Especialidad eliminada exitosamente')
  } catch (error) {
    console.error('❌ Error al eliminar especialidad:', error)

    let errorMsg = 'Error al eliminar la especialidad'

    if (error.response?.status === 404) {
      errorMsg = 'Especialidad no encontrada'
    } else if (error.response?.status === 403) {
      errorMsg = 'No tienes permisos para eliminar especialidades. Solo los administradores pueden realizar esta acción.'
    } else if (error.detail) {
      errorMsg = error.detail
    } else if (error.message) {
      errorMsg = error.message
    }

    errorMessage.value = errorMsg
    closeModal()
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <LayoutComponent>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-gray-700">Gestionar especialidades</h1>
      <ButtonComponent 
        v-if="isAdmin"
        type="button" 
        variant="primary" 
        size="large" 
        icon="fa-solid fa-plus" 
        label="Añadir especialidad"
        @click="openAddModal" />
    </div>

    <!-- Mensaje de error -->
    <div v-if="errorMessage && !activeModal" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
      {{ errorMessage }}
    </div>

    <!-- Loader -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <LoaderComponent />
    </div>

    <!-- Lista de especialidades -->
    <div v-else-if="especialidades.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <EspecialidadCardComponent 
        v-for="especialidad in especialidades" 
        :key="especialidad.id"
        :title="especialidad.nombre" 
        :description="especialidad.descripcion" 
        :duration-minutes="especialidad.duracionMinutos"
        :price="especialidad.precio"
        :is-enabled="especialidad.habilitada"
        @edit="openEditModal(especialidad)" 
        @disable="openConfirmModal(especialidad)" 
        @enable="openConfirmModal(especialidad)"
        @delete="openDeleteModal(especialidad)" 
      />
    </div>

    <!-- Mensaje cuando no hay especialidades -->
    <div v-else class="text-center py-12 text-gray-500">
      <p>No hay especialidades disponibles</p>
    </div>

    <ModalForm 
      title="Nueva especialidad" 
      :isOpen="activeModal === 'add'" 
      @close="closeModal"
      @submit="handleCreate"
      :isLoading="creating">
      <div>
        <label for="nombre" class="block mb-2 text-sm font-medium text-gray-900">Nombre</label>
        <input id="nombre" v-model="form.nombre" type="text" placeholder="Ej. Medicina general" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5" required />
      </div>
      <div>
        <label for="descripcion" class="block mb-2 text-sm font-medium text-gray-900">Descripción</label>
        <textarea id="descripcion" v-model="form.descripcion" rows="3" placeholder="Resumen de las funciones..." class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"></textarea>
      </div>
      <div>
        <label for="duracion" class="block mb-2 text-sm font-medium text-gray-900">Duración (minutos)</label>
        <input id="duracion" v-model.number="form.duracionMinutos" type="number" min="1" placeholder="Ej. 20" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5" required />
      </div>
      <div>
        <label for="precio" class="block mb-2 text-sm font-medium text-gray-900">Precio (S/)</label>
        <input id="precio" v-model.number="form.precio" type="number" min="0" step="0.1" placeholder="Ej. 0.00" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5" required />
      </div>
      <div v-if="activeModal === 'add' && errorMessage" class="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
        {{ errorMessage }}
      </div>
    </ModalForm>

    <ModalForm 
      title="Editar especialidad" 
      :isOpen="activeModal === 'edit'" 
      @close="closeModal"
      @submit="handleEdit"
      :isLoading="creating">
      <div>
        <label for="edit-nombre" class="block mb-2 text-sm font-medium text-gray-900">Nombre</label>
        <input id="edit-nombre" v-model="form.nombre" type="text" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5" required />
      </div>
      <div>
        <label for="edit-descripcion" class="block mb-2 text-sm font-medium text-gray-900">Descripción</label>
        <textarea id="edit-descripcion" v-model="form.descripcion" rows="3" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"></textarea>
      </div>
      <div>
        <label for="edit-duracion" class="block mb-2 text-sm font-medium text-gray-900">Duración (minutos)</label>
        <input id="edit-duracion" v-model.number="form.duracionMinutos" type="number" min="1" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5" required />
      </div>
      <div>
        <label for="edit-precio" class="block mb-2 text-sm font-medium text-gray-900">Precio (S/)</label>
        <input id="edit-precio" v-model.number="form.precio" type="number" min="0" step="0.1" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5" required />
      </div>
      <div v-if="activeModal === 'edit' && errorMessage" class="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
        {{ errorMessage }}
      </div>
    </ModalForm>

    <ConfirmModalComponent 
      :isOpen="activeModal === 'disableConfirm'" 
      type="danger"
      title="¿Deshabilitar esta especialidad?" 
      description="La especialidad dejará de estar disponible para asignaciones. Podrás volver a habilitarla más adelante."
      confirmLabel="Sí, deshabilitar"
      @confirm="handleToggleStatus" 
      @close="closeModal" />

    <ConfirmModalComponent 
      :isOpen="activeModal === 'enableConfirm'" 
      type="success"
      title="¿Habilitar esta especialidad?" 
      description="La especialidad volverá a estar disponible para asignaciones y uso activo en el sistema."
      confirmLabel="Sí, habilitar"
      @confirm="handleToggleStatus" 
      @close="closeModal" />

    <ConfirmModalComponent 
      :isOpen="activeModal === 'deleteConfirm'" 
      type="danger"
      title="¿Eliminar esta especialidad?" 
      description="Esta acción eliminará la especialidad de forma permanente. No podrás recuperarla luego."
      confirmLabel="Sí, eliminar"
      @confirm="handleDelete" 
      @close="closeModal" />

  </LayoutComponent>
</template>