// /stores/horarioStore.js
import { defineStore } from "pinia"

import {
  getDisponibilidadApi,
  createDisponibilidadApi,
  deleteDisponibilidadApi,
  updateDisponibilidadApi
} from "../api/horarios"

export const useHorarioStore = defineStore("horario", {
  // 2. Define el ESTADO
  state: () => ({
    horarios: [], // Aquí vivirá la lista de horarios
    isLoading: false,
    error: null,
  }),

  // 3. Define las ACCIONES (aquí va la lógica)
  actions: {
    /**
     * Busca los horarios del médico (usando el token)
     * y los guarda en el estado.
     */
    async fetchHorarios() {
      this.isLoading = true
      this.error = null
      try {
        // La acción llama a la API
        const data = await getDisponibilidadApi()
        this.horarios = data
      } catch (err) {
        this.error = err.detail || "Error al cargar los horarios"
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Llama a la API para crear un nuevo horario.
     * Si tiene éxito, lo añade a la lista local.
     */
    async addHorario(horarioData) {
      this.isLoading = true
      this.error = null
      try {
        // 'horarioData' NO debe incluir 'id_personal_especialidad'
        const nuevoHorario = await createDisponibilidadApi(horarioData)
        // Añade el nuevo horario al estado local
        //this.horarios.push(nuevoHorario) 
        this.horarios.push(...nuevoHorario)
      } catch (err) {
        this.error = err.detail || "Error al crear el horario"
        throw err // Lanza el error para que el formulario lo sepa
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Llama a la API para eliminar (desactivar) un horario.
     * Si tiene éxito, lo quita de la lista local.
     */
    async removeHorario(horarioId, confirmarEliminacion = false) {
      this.isLoading = true
      this.error = null
      try {
        await deleteDisponibilidadApi(horarioId, confirmarEliminacion)
        // Filtra el horario eliminado del estado local
        this.horarios = this.horarios.filter(h => h.id_horario !== horarioId)
      } catch (err) {
        this.error = err.detail || "Error al eliminar el horario"
        throw err
      } finally {
        this.isLoading = false
      }
    },

    // Acción para actualizar
    async updateHorario(horarioId, horarioData) {
      this.isLoading = true
      this.error = null
      try {
        // --- PASO 1: SER NO-OPTIMISTA ---
        // Llamamos a la API *primero*, antes de tocar el estado.
        // 'horarioData' es el payload completo que armamos en la vista.
        const horarioActualizado = await updateDisponibilidadApi(horarioId, horarioData)

        // --- PASO 2: MUTAR, NO REEMPLAZAR ---
        // Buscamos el objeto original en nuestro estado.
        const index = this.horarios.findIndex(h => h.id_horario === horarioId)

        if (index !== -1) {
          // ¡ESTA ES LA MAGIA!
          // No hacemos: this.horarios[index] = horarioActualizado (¡MAL!)

          // Hacemos: Mutamos el objeto existente con los datos del objeto actualizado.
          // Object.assign(target, source)
          Object.assign(this.horarios[index], horarioActualizado);
        }

      } catch (err) {
        this.error = err.detail || "Error al actualizar el horario"
        // Si falla, forzamos una recarga para no tener datos corruptos
        this.fetchHorarios();
        throw err
      } finally {
        this.isLoading = false
      }
    }
  }
})