import type {
  CreateOnboardingRequest,
  UpdateOnboardingRequest,
  CompleteStepRequest,
  OnboardingResponse,
  OnboardingListResponse,
  CompleteStepResponse,
  OnboardingStep,
  IUserProfile,
  IBusinessContext,
  IOnboardingPreferences,
} from '../types/onboarding.types'
import httpBase from './httpBase'
import type { AxiosResponse } from 'axios'

/**
 * Servicio para manejar todas las operaciones relacionadas con el onboarding
 * Implementa el patrón Repository para abstraer las llamadas HTTP
 * Refactorizado para trabajar con la API basada en userId del backend
 */
class OnboardingService extends httpBase {
  private readonly onboardingEndpoint = 'onboarding'

  /**
   * Inicializar el proceso de onboarding para el usuario autenticado
   * @returns Promise con la respuesta del onboarding inicializado
   */
  async initializeOnboarding(): Promise<OnboardingResponse> {
    try {
      const response: AxiosResponse<OnboardingResponse> = await this.post(
        `${this.onboardingEndpoint}/initialize`,
        {},
      )
      return response.data
    } catch (error) {
      console.error('Error initializing onboarding:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Crear un nuevo proceso de onboarding
   * @param data - Datos para crear el onboarding (sin businessId)
   * @returns Promise con la respuesta del onboarding creado
   */
  async createOnboarding(data: {
    userProfile: IUserProfile
    businessContext: IBusinessContext
    preferences?: Partial<IOnboardingPreferences>
  }): Promise<OnboardingResponse> {
    try {
      // Debug: verificar token antes de hacer la petición
      const token = localStorage.getItem('access_token')
      console.log('🔍 ONBOARDING DEBUG - Token from localStorage:', token)
      console.log('🔍 ONBOARDING DEBUG - Token length:', token?.length)
      console.log('🔍 ONBOARDING DEBUG - Token starts with Bearer:', token?.startsWith('Bearer'))
      
      const response: AxiosResponse<OnboardingResponse> = await this.post(
        this.onboardingEndpoint,
        data,
      )
      return response.data
    } catch (error) {
      console.error('❌ Error creating onboarding:', error)
      console.error('❌ Error details:', JSON.stringify(error, null, 2))
      throw this.handleError(error)
    }
  }

  /**
   * Obtener información del onboarding del usuario autenticado
   * @returns Promise con los datos del onboarding
   */
  async getOnboarding(): Promise<OnboardingResponse> {
    try {
      const response: AxiosResponse<OnboardingResponse> = await this.get(
        this.onboardingEndpoint,
      )
      return response.data
    } catch (error) {
      console.error('Error fetching onboarding:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Actualizar información del onboarding del usuario autenticado
   * @param data - Datos a actualizar
   * @returns Promise con la respuesta actualizada
   */
  async updateOnboarding(
    onboardingId: string,
    data: UpdateOnboardingRequest,
  ): Promise<OnboardingResponse> {
    try {
      const response: AxiosResponse<OnboardingResponse> = await this.put(
        `${this.onboardingEndpoint}/${onboardingId}`,
        data,
      )
      return response.data
    } catch (error) {
      console.error('Error updating onboarding:', error)
      throw this.handleError(error)
    }
  }

  // Método removido: getUserOnboardings ya que el backend maneja un onboarding por usuario

  /**
   * Marcar un paso del onboarding como completado
   * @param data - Datos del paso a completar
   * @returns Promise con la respuesta de completación
   */
  async completeStep(data: CompleteStepRequest): Promise<CompleteStepResponse> {
    try {
      const response: AxiosResponse<CompleteStepResponse> = await this.post(
        `${this.onboardingEndpoint}/complete-step`,
        data,
      )
      return response.data
    } catch (error) {
      console.error('Error completing onboarding step:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Eliminar un onboarding (reiniciar proceso) del usuario autenticado
   * @returns Promise con confirmación de eliminación
   */
  async deleteOnboarding(): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await this.delete(
        this.onboardingEndpoint,
      )
      return response.data
    } catch (error) {
      console.error('Error deleting onboarding:', error)
      throw this.handleError(error)
    }
  }



  /**
   * Verificar si un onboarding existe para el usuario autenticado
   * @returns Promise con boolean indicando si existe
   */
  async checkOnboardingExists(): Promise<boolean> {
    try {
      await this.getOnboarding()
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
   * @returns Promise con el siguiente paso o null si está completo
   */
  async getNextStep(): Promise<OnboardingStep | null> {
    try {
      const response = await this.getOnboarding()
      return response.nextStep as OnboardingStep | null
    } catch (error) {
      console.error('Error getting next step:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Verificar si el onboarding está completo
   * @returns Promise con boolean indicando si está completo
   */
  async isOnboardingComplete(): Promise<boolean> {
    try {
      const response = await this.getOnboarding()
      return response.isComplete ?? false
    } catch (error) {
      console.error('Error checking completion status:', error)
      return false
    }
  }

  /**
   * Obtener el porcentaje de completación
   * @returns Promise con el porcentaje de completación
   */
  async getCompletionPercentage(): Promise<number> {
    try {
      const response = await this.getOnboarding()
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
  private validateOnboardingData(data: {
    userProfile: IUserProfile
    businessContext: IBusinessContext
    preferences?: Partial<IOnboardingPreferences>
  }): boolean {
    // Validaciones básicas
    if (!data.userProfile || !data.businessContext) {
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
  async createOnboardingWithValidation(data: {
    userProfile: IUserProfile
    businessContext: IBusinessContext
    preferences?: Partial<IOnboardingPreferences>
  }): Promise<OnboardingResponse> {
    if (!this.validateOnboardingData(data)) {
      throw new Error('Datos de onboarding inválidos')
    }
    return this.createOnboarding(data)
  }
}

// Exportar instancia singleton del servicio
export const onboardingService = new OnboardingService()
