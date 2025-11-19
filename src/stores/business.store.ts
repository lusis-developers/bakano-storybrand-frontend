import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import businessService from '@/services/business.service'
import type {
  IBusiness,
  ICreateBusinessRequest,
  IUpdateBusinessRequest,
  IBusinessLoadingState,
  IBusinessErrorState,
  ITeamMember,
  TeamRole,
  TeamAuditResponse,
  IPendingInvitation,
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
  const pendingInvitations = ref<IPendingInvitation[]>([])

  const activeBusinesses = computed(() => businesses.value.filter((business) => business.isActive))

  const inactiveBusinesses = computed(() =>
    businesses.value.filter((business) => !business.isActive),
  )

  const businessCount = computed(() => businesses.value.length)
  const pendingInvitationsCount = computed(() => pendingInvitations.value.length)

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

  // Función para obtener un negocio por ID de contenido
  const fetchBusinessByContentId = async (contentId: string): Promise<IBusiness | null> => {
    loading.value.fetching = true
    errors.value.fetch = null

    try {
      const response = await businessService.getBusinessByContentId(contentId)
      if (response.business) {
        currentBusiness.value = response.business

        // Actualizar en la lista si ya existe
         const index = businesses.value.findIndex((b) => b.id === response.business._id)
         if (index !== -1) {
           businesses.value[index] = response.business
         }

        return response.business
      } else {
        throw new Error(response.message || 'Error al obtener el negocio')
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Error desconocido al obtener el negocio por content ID'
      errors.value.fetch = errorMessage
      console.error('Error fetching business by content ID:', error)
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

  // Asegura que exista un negocio seleccionado; si no hay, usa el primero disponible
  const ensureCurrentBusiness = async (): Promise<IBusiness | null> => {
    if (currentBusiness.value) return currentBusiness.value

    // Si no hay negocios cargados, intentar obtenerlos
    if (businesses.value.length === 0) {
      await fetchBusinesses()
    }

    const first = businesses.value[0]
    if (first) {
      currentBusiness.value = first
      return first
    }
    return null
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
    pendingInvitations.value = []
  }

  // Función para buscar negocios por nombre
  const searchBusinessesByName = (searchTerm: string): IBusiness[] => {
    if (!searchTerm.trim()) return businesses.value

    const term = searchTerm.toLowerCase().trim()
    return businesses.value.filter((business) => business.name.toLowerCase().includes(term))
  }

  const inviteTeamMember = async (
    businessId: string,
    email: string,
    role: TeamRole = 'collaborator',
  ): Promise<IBusiness | null> => {
    loading.value.creating = true
    errors.value.create = null

    try {
      const response = await businessService.inviteTeamMember(businessId, { email, role })
      if (response.data) {
        const updated = response.data
        const index = businesses.value.findIndex((b) => b.id === businessId)
        if (index !== -1) {
          businesses.value[index] = updated
        }
        if (currentBusiness.value?.id === businessId) {
          currentBusiness.value = updated
        }
        return updated
      }
      throw new Error(response.message || 'Error al invitar miembro del equipo')
    } catch (error: any) {
      const errorMessage = error?.message || 'Error desconocido al invitar miembro del equipo'
      errors.value.create = errorMessage
      console.error('Error inviting team member:', error)
      return null
    } finally {
      loading.value.creating = false
    }
  }

  const acceptTeamInvite = async (businessId: string): Promise<IBusiness | null> => {
    loading.value.updating = true
    errors.value.update = null

    try {
      const response = await businessService.acceptTeamInvite(businessId)
      if (response.data) {
        const updated = response.data
        const index = businesses.value.findIndex((b) => b.id === businessId)
        if (index !== -1) {
          businesses.value[index] = updated
        }
        if (currentBusiness.value?.id === businessId) {
          currentBusiness.value = updated
        }
        return updated
      }
      throw new Error(response.message || 'Error al aceptar invitación')
    } catch (error: any) {
      const errorMessage = error?.message || 'Error desconocido al aceptar invitación'
      errors.value.update = errorMessage
      console.error('Error accepting team invite:', error)
      return null
    } finally {
      loading.value.updating = false
    }
  }

  const fetchPendingInvitations = async (): Promise<IPendingInvitation[]> => {
    loading.value.fetching = true
    errors.value.fetch = null
    try {
      const res = await businessService.listPendingInvitationsForUser()
      pendingInvitations.value = res.data?.invitations || []
      return pendingInvitations.value
    } catch (error: any) {
      const message = error?.message || 'Error al cargar invitaciones pendientes'
      errors.value.fetch = message
      return []
    } finally {
      loading.value.fetching = false
    }
  }

  const fetchTeamMembers = async (businessId: string): Promise<ITeamMember[]> => {
    try {
      const response = await businessService.listTeamMembers(businessId)
      return response.data || []
    } catch (error: any) {
      console.error('Error listing team members:', error)
      return []
    }
  }

  const updateTeamMemberRole = async (
    businessId: string,
    userId: string,
    role: TeamRole,
  ): Promise<IBusiness | null> => {
    loading.value.updating = true
    errors.value.update = null

    try {
      const response = await businessService.updateTeamMemberRole(businessId, userId, role)
      if (response.data) {
        const updated = response.data
        const index = businesses.value.findIndex((b) => b.id === businessId)
        if (index !== -1) {
          businesses.value[index] = updated
        }
        if (currentBusiness.value?.id === businessId) {
          currentBusiness.value = updated
        }
        return updated
      }
      throw new Error(response.message || 'Error al actualizar rol del miembro')
    } catch (error: any) {
      const errorMessage = error?.message || 'Error desconocido al actualizar rol del miembro'
      errors.value.update = errorMessage
      console.error('Error updating team member role:', error)
      return null
    } finally {
      loading.value.updating = false
    }
  }

  const revokeTeamMember = async (
    businessId: string,
    userId: string,
  ): Promise<IBusiness | null> => {
    loading.value.deleting = true
    errors.value.delete = null

    try {
      const response = await businessService.revokeTeamMember(businessId, userId)
      if (response.data) {
        const updated = response.data
        const index = businesses.value.findIndex((b) => b.id === businessId)
        if (index !== -1) {
          businesses.value[index] = updated
        }
        if (currentBusiness.value?.id === businessId) {
          currentBusiness.value = updated
        }
        return updated
      }
      throw new Error(response.message || 'Error al revocar miembro')
    } catch (error: any) {
      const errorMessage = error?.message || 'Error desconocido al revocar miembro'
      errors.value.delete = errorMessage
      console.error('Error revoking team member:', error)
      return null
    } finally {
      loading.value.deleting = false
    }
  }

  const fetchTeamAudit = async (
    businessId: string,
    page = 1,
    limit = 10,
  ): Promise<TeamAuditResponse['data'] | null> => {
    try {
      const response = await businessService.listTeamAudit(businessId, page, limit)
      return response.data
    } catch (error: any) {
      console.error('Error listing team audit:', error)
      return null
    }
  }

  const canCreateBusiness = async (): Promise<boolean> => {
    try {
      const response = await businessService.canCreateBusiness()
      const flag = (response.allowed ?? response.canCreate) ?? false
      return !!flag
    } catch (error: any) {
      console.error('Error checking can create business:', error)
      return false
    }
  }

  return {
    // Estado
    businesses,
    currentBusiness,
    loading,
    errors,
    pendingInvitations,

    // Getters
    activeBusinesses,
    inactiveBusinesses,
    businessCount,
    pendingInvitationsCount,
    activeBusinessCount,
    hasBusinesses,
    isLoading,
    hasErrors,

    // Acciones
    fetchBusinesses,
    fetchBusinessById,
    fetchBusinessByContentId,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    toggleBusinessStatus,
    inviteTeamMember,
    acceptTeamInvite,
    fetchPendingInvitations,
    fetchTeamMembers,
    updateTeamMemberRole,
    revokeTeamMember,
    fetchTeamAudit,
    canCreateBusiness,
    setCurrentBusiness,
    ensureCurrentBusiness,
    resetState,
    searchBusinessesByName,
    clearErrors,
    clearError,
  }
})
