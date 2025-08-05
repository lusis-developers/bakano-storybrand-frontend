import type {
  CreateOnboardingRequest,
  UpdateOnboardingRequest,
  CompleteStepRequest,
  OnboardingResponse,
  OnboardingListResponse,
  CompleteStepResponse,
  OnboardingStep,
} from '../types/onboarding.types'
import httpBase from './httpBase'
import type { AxiosResponse } from 'axios'

/**
 * Servicio para manejar todas las operaciones relacionadas con el onboarding
 * Implementa el patrón Repository para abstraer las llamadas HTTP
 */
class OnboardingService extends httpBase {
  private readonly onboardingEndpoint = '/onboarding'

  /**
   * Crear un nuevo proceso de onboarding
   * @param data - Datos para crear el onboarding
   * @returns Promise con la respuesta del onboarding creado
   */
  async createOnboarding(data: CreateOnboardingRequest): Promise<OnboardingResponse> {
    try {
      const response: AxiosResponse<OnboardingResponse> = await this.post(
        this.onboardingEndpoint,
        data,
      )
      return response.data
    } catch (error) {
      console.error('Error creating onboarding:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Obtener información del onboarding para un negocio específico
   * @param businessId - ID del negocio
   * @returns Promise con los datos del onboarding
   */
  async getOnboarding(businessId: string): Promise<OnboardingResponse> {
    try {
      const response: AxiosResponse<OnboardingResponse> = await this.get(
        `${this.onboardingEndpoint}/${businessId}`,
      )
      return response.data
    } catch (error) {
      console.error('Error fetching onboarding:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Actualizar información del onboarding
   * @param businessId - ID del negocio
   * @param data - Datos a actualizar
   * @returns Promise con la respuesta actualizada
   */
  async updateOnboarding(
    businessId: string,
    data: UpdateOnboardingRequest,
  ): Promise<OnboardingResponse> {
    try {
      const response: AxiosResponse<OnboardingResponse> = await this.put(
        `${this.onboardingEndpoint}/${businessId}`,
        data,
      )
      return response.data
    } catch (error) {
      console.error('Error updating onboarding:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Obtener todos los onboardings del usuario autenticado
   * @returns Promise con la lista de onboardings
   */
  async getUserOnboardings(): Promise<OnboardingListResponse> {
    try {
      const response: AxiosResponse<OnboardingListResponse> = await this.get(
        `${this.onboardingEndpoint}/user/all`,
      )
      return response.data
    } catch (error) {
      console.error('Error fetching user onboardings:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Marcar un paso del onboarding como completado
   * @param businessId - ID del negocio
   * @param data - Datos del paso a completar
   * @returns Promise con la respuesta de completación
   */
  async completeStep(businessId: string, data: CompleteStepRequest): Promise<CompleteStepResponse> {
    try {
      const response: AxiosResponse<CompleteStepResponse> = await this.post(
        `${this.onboardingEndpoint}/${businessId}/complete-step`,
        data,
      )
      return response.data
    } catch (error) {
      console.error('Error completing onboarding step:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Eliminar un onboarding (reiniciar proceso)
   * @param businessId - ID del negocio
   * @returns Promise con confirmación de eliminación
   */
  async deleteOnboarding(businessId: string): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await this.delete(
        `${this.onboardingEndpoint}/${businessId}`,
      )
      return response.data
    } catch (error) {
      console.error('Error deleting onboarding:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Actualizar solo el perfil de usuario
   * @param businessId - ID del negocio
   * @param userProfile - Datos del perfil de usuario
   * @returns Promise con la respuesta actualizada
   */
  async updateUserProfile(
    businessId: string,
    userProfile: Partial<CreateOnboardingRequest['userProfile']>,
  ): Promise<OnboardingResponse> {
    return this.updateOnboarding(businessId, { userProfile })
  }

  /**
   * Actualizar solo el contexto del negocio
   * @param businessId - ID del negocio
   * @param businessContext - Datos del contexto del negocio
   * @returns Promise con la respuesta actualizada
   */
  async updateBusinessContext(
    businessId: string,
    businessContext: Partial<CreateOnboardingRequest['businessContext']>,
  ): Promise<OnboardingResponse> {
    return this.updateOnboarding(businessId, { businessContext })
  }

  /**
   * Actualizar solo las preferencias
   * @param businessId - ID del negocio
   * @param preferences - Datos de las preferencias
   * @returns Promise con la respuesta actualizada
   */
  async updatePreferences(
    businessId: string,
    preferences: Partial<CreateOnboardingRequest['preferences']>,
  ): Promise<OnboardingResponse> {
    return this.updateOnboarding(businessId, { preferences })
  }

  /**
   * Verificar si un onboarding existe para un negocio
   * @param businessId - ID del negocio
   * @returns Promise con boolean indicando si existe
   */
  async checkOnboardingExists(businessId: string): Promise<boolean> {
    try {
      await this.getOnboarding(businessId)
      return true
    } catch (error: any) {
      if (error.status === 404) {
        return false
      }
      throw error
    }
  }

  /**
   * Obtener el siguiente paso del onboarding
   * @param businessId - ID del negocio
   * @returns Promise con el siguiente paso o null si está completo
   */
  async getNextStep(businessId: string): Promise<OnboardingStep | null> {
    try {
      const response = await this.getOnboarding(businessId)
      return response.nextStep as OnboardingStep | null
    } catch (error) {
      console.error('Error getting next step:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Verificar si el onboarding está completo
   * @param businessId - ID del negocio
   * @returns Promise con boolean indicando si está completo
   */
  async isOnboardingComplete(businessId: string): Promise<boolean> {
    try {
      const response = await this.getOnboarding(businessId)
      return response.isComplete ?? false
    } catch (error) {
      console.error('Error checking completion status:', error)
      return false
    }
  }

  /**
   * Obtener el porcentaje de completación
   * @param businessId - ID del negocio
   * @returns Promise con el porcentaje de completación
   */
  async getCompletionPercentage(businessId: string): Promise<number> {
    try {
      const response = await this.getOnboarding(businessId)
      return response.onboarding.completionPercentage
    } catch (error) {
      console.error('Error getting completion percentage:', error)
      return 0
    }
  }

  /**
   * Manejar errores de las peticiones HTTP
   * @param error - Error capturado
   * @returns Error procesado
   */
  private handleError(error: any): Error {
    if (error.response) {
      // Error de respuesta del servidor
      const { status, data } = error.response
      const message = data?.message || `HTTP Error ${status}`
      const customError = new Error(message)
      ;(customError as any).status = status
      ;(customError as any).code = data?.code
      ;(customError as any).field = data?.field
      return customError
    } else if (error.request) {
      // Error de red
      return new Error('Error de conexión. Verifica tu conexión a internet.')
    } else {
      // Error de configuración
      return new Error(error.message || 'Error inesperado')
    }
  }

  /**
   * Validar datos antes de enviar al servidor
   * @param data - Datos a validar
   * @returns boolean indicando si los datos son válidos
   */
  private validateOnboardingData(data: CreateOnboardingRequest): boolean {
    // Validaciones básicas
    if (!data.businessId || !data.userProfile || !data.businessContext) {
      return false
    }

    // Validar formato de horas de trabajo
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (
      !timeRegex.test(data.userProfile.workingHours.start) ||
      !timeRegex.test(data.userProfile.workingHours.end)
    ) {
      return false
    }

    return true
  }

  /**
   * Crear onboarding con validación
   * @param data - Datos del onboarding
   * @returns Promise con la respuesta del onboarding creado
   */
  async createOnboardingWithValidation(data: CreateOnboardingRequest): Promise<OnboardingResponse> {
    if (!this.validateOnboardingData(data)) {
      throw new Error('Datos de onboarding inválidos')
    }
    return this.createOnboarding(data)
  }
}

// Exportar instancia singleton del servicio
export const onboardingService = new OnboardingService()
