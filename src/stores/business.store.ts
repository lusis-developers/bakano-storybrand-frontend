import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import businessService from '@/services/business.service'
import type {
  IBusiness,
  ICreateBusinessRequest,
  IUpdateBusinessRequest,
  IBusinessLoadingState,
  IBusinessErrorState,
} from '@/types/business.types'

export const useBusinessStore = defineStore('business', () => {
  // Estado reactivo
  const businesses = ref<IBusiness[]>([])
  const currentBusiness = ref<IBusiness | null>(null)
  const loading = ref<IBusinessLoadingState>({
    fetching: false,
    creating: false,
    updating: false,
    deleting: false,
  })
  const errors = ref<IBusinessErrorState>({
    fetch: null,
    create: null,
    update: null,
    delete: null,
  })

  const activeBusinesses = computed(() => businesses.value.filter((business) => business.isActive))

  const inactiveBusinesses = computed(() =>
    businesses.value.filter((business) => !business.isActive),
  )

  const businessCount = computed(() => businesses.value.length)

  const activeBusinessCount = computed(() => activeBusinesses.value.length)

  const hasBusinesses = computed(() => businesses.value.length > 0)

  const isLoading = computed(() => Object.values(loading.value).some((state) => state))

  const hasErrors = computed(() => Object.values(errors.value).some((error) => error !== null))

  // Función para limpiar errores
  const clearErrors = () => {
    errors.value = {
      fetch: null,
      create: null,
      update: null,
      delete: null,
    }
  }

  // Función para limpiar un error específico
  const clearError = (errorType: keyof IBusinessErrorState) => {
    errors.value[errorType] = null
  }

  // Función para obtener todos los negocios
  const fetchBusinesses = async (): Promise<void> => {
    loading.value.fetching = true
    errors.value.fetch = null

    try {
      const response = await businessService.getBusinesses()
      if (response.success && response.data && response.data.businesses) {
        businesses.value.splice(0, businesses.value.length, ...response.data.businesses)
      } else {
        throw new Error(response.message || 'Error al obtener los negocios')
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Error desconocido al obtener los negocios'
      errors.value.fetch = errorMessage
      console.error('Error fetching businesses:', error)
    } finally {
      loading.value.fetching = false
    }
  }

  // Función para obtener un negocio por ID
  const fetchBusinessById = async (businessId: string): Promise<IBusiness | null> => {
    loading.value.fetching = true
    errors.value.fetch = null

    try {
      const response = await businessService.getBusinessById(businessId)
      if (response.success && response.data) {
        currentBusiness.value = response.data

        // Actualizar en la lista si ya existe
        const index = businesses.value.findIndex((b) => b.id === businessId)
        if (index !== -1) {
          businesses.value[index] = response.data
        }

        return response.data
      } else {
        throw new Error(response.message || 'Error al obtener el negocio')
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Error desconocido al obtener el negocio'
      errors.value.fetch = errorMessage
      console.error('Error fetching business by ID:', error)
      return null
    } finally {
      loading.value.fetching = false
    }
  }

  // Función para crear un nuevo negocio
  const createBusiness = async (
    businessData: ICreateBusinessRequest,
  ): Promise<IBusiness | null> => {
    loading.value.creating = true
    errors.value.create = null

    try {
      const response = await businessService.createBusiness(businessData)
      if (response.success && response.data) {
        // Agregar el nuevo negocio a la lista
        businesses.value.push(response.data)
        currentBusiness.value = response.data
        return response.data
      } else {
        throw new Error(response.message || 'Error al crear el negocio')
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Error desconocido al crear el negocio'
      errors.value.create = errorMessage
      console.error('Error creating business:', error)
      return null
    } finally {
      loading.value.creating = false
    }
  }

  // Función para actualizar un negocio
  const updateBusiness = async (
    businessId: string,
    updateData: IUpdateBusinessRequest,
  ): Promise<IBusiness | null> => {
    loading.value.updating = true
    errors.value.update = null

    try {
      const response = await businessService.updateBusiness(businessId, updateData)
      if (response.success && response.data) {
        // Actualizar en la lista
        const index = businesses.value.findIndex((b) => b.id === businessId)
        if (index !== -1) {
          businesses.value[index] = response.data
        }

        // Actualizar el negocio actual si es el mismo
        if (currentBusiness.value?.id === businessId) {
          currentBusiness.value = response.data
        }

        return response.data
      } else {
        throw new Error(response.message || 'Error al actualizar el negocio')
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Error desconocido al actualizar el negocio'
      errors.value.update = errorMessage
      console.error('Error updating business:', error)
      return null
    } finally {
      loading.value.updating = false
    }
  }

  // Función para eliminar un negocio
  const deleteBusiness = async (businessId: string): Promise<boolean> => {
    loading.value.deleting = true
    errors.value.delete = null

    try {
      const response = await businessService.deleteBusiness(businessId)
      if (response.success) {
        // Remover de la lista local manteniendo la reactividad
        const index = businesses.value.findIndex((b) => b.id === businessId)
        if (index !== -1) {
          businesses.value.splice(index, 1)
        }

        // Limpiar el negocio actual si es el mismo
        if (currentBusiness.value?.id === businessId) {
          currentBusiness.value = null
        }

        return true
      } else {
        throw new Error(response.message || 'Error al eliminar el negocio')
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Error desconocido al eliminar el negocio'
      errors.value.delete = errorMessage
      console.error('Error deleting business:', error)
      return false
    } finally {
      loading.value.deleting = false
    }
  }

  // Función para cambiar el estado activo/inactivo de un negocio
  const toggleBusinessStatus = async (businessId: string, isActive: boolean): Promise<boolean> => {
    loading.value.updating = true
    errors.value.update = null

    try {
      const response = await businessService.toggleBusinessStatus(businessId, isActive)
      if (response.success && response.data) {
        // Actualizar en la lista
        const index = businesses.value.findIndex((b) => b.id === businessId)
        if (index !== -1) {
          businesses.value[index] = response.data
        }

        // Actualizar el negocio actual si es el mismo
        if (currentBusiness.value?.id === businessId) {
          currentBusiness.value = response.data
        }

        return true
      } else {
        throw new Error(response.message || 'Error al cambiar el estado del negocio')
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Error desconocido al cambiar el estado del negocio'
      errors.value.update = errorMessage
      console.error('Error toggling business status:', error)
      return false
    } finally {
      loading.value.updating = false
    }
  }

  // Función para establecer el negocio actual
  const setCurrentBusiness = (business: IBusiness | null) => {
    currentBusiness.value = business
  }

  // Función para resetear el estado
  const resetState = () => {
    // Limpiar el array manteniendo la reactividad
    businesses.value.splice(0, businesses.value.length)
    currentBusiness.value = null
    loading.value = {
      fetching: false,
      creating: false,
      updating: false,
      deleting: false,
    }
    clearErrors()
  }

  // Función para buscar negocios por nombre
  const searchBusinessesByName = (searchTerm: string): IBusiness[] => {
    if (!searchTerm.trim()) return businesses.value

    const term = searchTerm.toLowerCase().trim()
    return businesses.value.filter((business) => business.name.toLowerCase().includes(term))
  }

  return {
    // Estado
    businesses,
    currentBusiness,
    loading,
    errors,

    // Getters
    activeBusinesses,
    inactiveBusinesses,
    businessCount,
    activeBusinessCount,
    hasBusinesses,
    isLoading,
    hasErrors,

    // Acciones
    fetchBusinesses,
    fetchBusinessById,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    toggleBusinessStatus,
    setCurrentBusiness,
    resetState,
    searchBusinessesByName,
    clearErrors,
    clearError,
  }
})
