import { computed } from 'vue'
import { useBusinessStore } from '@/stores/business.store'
import type {
  IBusiness,
  ICreateBusinessRequest,
  IUpdateBusinessRequest
} from '@/types/business.types'

/**
 * Composable para manejar la lógica de negocios
 * Proporciona una interfaz reactiva y fácil de usar para interactuar con el store de business
 */
export function useBusiness() {
  const businessStore = useBusinessStore()

  // Estado reactivo del store
  const businesses = computed(() => businessStore.businesses)
  const currentBusiness = computed(() => businessStore.currentBusiness)
  const loading = computed(() => businessStore.loading)
  const errors = computed(() => businessStore.errors)
  const isLoading = computed(() => businessStore.isLoading)
  const hasErrors = computed(() => businessStore.hasErrors)

  // Getters computados
  const activeBusinesses = computed(() => businessStore.activeBusinesses)
  const inactiveBusinesses = computed(() => businessStore.inactiveBusinesses)
  const businessCount = computed(() => businessStore.businessCount)
  const activeBusinessCount = computed(() => businessStore.activeBusinessCount)
  const hasBusinesses = computed(() => businessStore.hasBusinesses)

  // Funciones del store
  const fetchBusinesses = async (): Promise<void> => {
    await businessStore.fetchBusinesses()
  }

  const fetchBusinessById = async (businessId: string): Promise<IBusiness | null> => {
    return await businessStore.fetchBusinessById(businessId)
  }

  const fetchBusinessByContentId = async (contentId: string): Promise<IBusiness | null> => {
    return await businessStore.fetchBusinessByContentId(contentId)
  }

  const createBusiness = async (businessData: ICreateBusinessRequest): Promise<IBusiness | null> => {
    return await businessStore.createBusiness(businessData)
  }

  const updateBusiness = async (
    businessId: string,
    updateData: IUpdateBusinessRequest
  ): Promise<IBusiness | null> => {
    return await businessStore.updateBusiness(businessId, updateData)
  }

  const deleteBusiness = async (businessId: string): Promise<boolean> => {
    return await businessStore.deleteBusiness(businessId)
  }

  const toggleBusinessStatus = async (businessId: string, isActive: boolean): Promise<boolean> => {
    return await businessStore.toggleBusinessStatus(businessId, isActive)
  }

  const canCreateBusiness = async (): Promise<boolean> => {
    return await businessStore.canCreateBusiness()
  }

  const setCurrentBusiness = (business: IBusiness | null): void => {
    businessStore.setCurrentBusiness(business)
  }

  const resetState = (): void => {
    businessStore.resetState()
  }

  const searchBusinessesByName = (searchTerm: string): IBusiness[] => {
    return businessStore.searchBusinessesByName(searchTerm)
  }

  const clearErrors = (): void => {
    businessStore.clearErrors()
  }

  const clearError = (errorType: 'fetch' | 'create' | 'update' | 'delete'): void => {
    businessStore.clearError(errorType)
  }

  // Funciones de utilidad adicionales
  const getBusinessById = (businessId: string): IBusiness | undefined => {
    return businesses.value.find(business => business.id === businessId)
  }

  const isBusinessActive = (businessId: string): boolean => {
    const business = getBusinessById(businessId)
    return business?.isActive ?? false
  }

  const getBusinessesByIndustry = (industry: string): IBusiness[] => {
    return businesses.value.filter(business => 
      business.industry?.toLowerCase() === industry.toLowerCase()
    )
  }

  const getBusinessesByOwner = (ownerId: string): IBusiness[] => {
    return businesses.value.filter(business => business.owner === ownerId)
  }

  // Función para validar datos de negocio antes de crear/actualizar
  const validateBusinessData = (data: ICreateBusinessRequest | IUpdateBusinessRequest): string[] => {
    const errors: string[] = []

    // Validar nombre (requerido para crear)
    if ('name' in data && data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        errors.push('El nombre del negocio es requerido')
      } else if (data.name.trim().length < 2) {
        errors.push('El nombre del negocio debe tener al menos 2 caracteres')
      } else if (data.name.trim().length > 100) {
        errors.push('El nombre del negocio no puede exceder 100 caracteres')
      }
    }

    // Validar email si se proporciona
    if (data.email && data.email.trim().length > 0) {
      const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
      if (!emailRegex.test(data.email)) {
        errors.push('Por favor proporciona un email válido')
      }
    }

    // Validar website si se proporciona
    if (data.website && data.website.trim().length > 0) {
      const websiteRegex = /^https?:\/\/.+/
      if (!websiteRegex.test(data.website)) {
        errors.push('Por favor proporciona una URL válida (debe comenzar con http:// o https://)')
      }
    }

    // Validar teléfono si se proporciona
    if (data.phone && data.phone.trim().length > 0) {
      const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,15}$/
      if (!phoneRegex.test(data.phone.replace(/\s/g, ''))) {
        errors.push('Por favor proporciona un número de teléfono válido')
      }
    }

    return errors
  }

  // Función helper para crear un negocio con validación
  const createBusinessWithValidation = async (
    businessData: ICreateBusinessRequest
  ): Promise<{ success: boolean; business?: IBusiness; errors?: string[] }> => {
    const validationErrors = validateBusinessData(businessData)
    
    if (validationErrors.length > 0) {
      return {
        success: false,
        errors: validationErrors
      }
    }

    const business = await createBusiness(businessData)
    
    return {
      success: business !== null,
      business: business || undefined,
      errors: business ? undefined : [errors.value.create || 'Error desconocido']
    }
  }

  // Función helper para actualizar un negocio con validación
  const updateBusinessWithValidation = async (
    businessId: string,
    updateData: IUpdateBusinessRequest
  ): Promise<{ success: boolean; business?: IBusiness; errors?: string[] }> => {
    const validationErrors = validateBusinessData(updateData)
    
    if (validationErrors.length > 0) {
      return {
        success: false,
        errors: validationErrors
      }
    }

    const business = await updateBusiness(businessId, updateData)
    
    return {
      success: business !== null,
      business: business || undefined,
      errors: business ? undefined : [errors.value.update || 'Error desconocido']
    }
  }

  return {
    // Estado
    businesses,
    currentBusiness,
    loading,
    errors,
    isLoading,
    hasErrors,
    
    // Getters
    activeBusinesses,
    inactiveBusinesses,
    businessCount,
    activeBusinessCount,
    hasBusinesses,
    
    // Acciones principales
    fetchBusinesses,
    fetchBusinessById,
    fetchBusinessByContentId,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    toggleBusinessStatus,
    setCurrentBusiness,
    resetState,
    searchBusinessesByName,
    clearErrors,
    clearError,
    canCreateBusiness,
    
    // Utilidades
    getBusinessById,
    isBusinessActive,
    getBusinessesByIndustry,
    getBusinessesByOwner,
    validateBusinessData,
    
    // Funciones con validación
    createBusinessWithValidation,
    updateBusinessWithValidation
  }
}