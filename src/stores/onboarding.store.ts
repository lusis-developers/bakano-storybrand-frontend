import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  IOnboarding,
  CreateOnboardingRequest,
  UpdateOnboardingRequest,
  OnboardingStep,
  OnboardingLoadingState,
  OnboardingError,
  IUserProfile,
  IBusinessContext,
  IOnboardingPreferences,
} from '../types/onboarding.types'
import { onboardingService } from '../services/onboarding.service'

/**
 * Store de Pinia para manejar el estado del onboarding
 * Implementa el patrón de composición con refs reactivos
 */
export const useOnboardingStore = defineStore('onboarding', () => {
  // ===== ESTADO REACTIVO =====
  
  // Onboarding actual
  const currentOnboarding = ref<IOnboarding | null>(null)
  
  // Removido: userOnboardings ya que el backend maneja un onboarding por usuario
  
  // Estados de carga
  const loading = ref<OnboardingLoadingState>({
    creating: false,
    updating: false,
    fetching: false,
    completing: false,
    deleting: false,
  })
  
  // Errores
  const error = ref<OnboardingError | null>(null)
  
  // Paso actual del onboarding
  const currentStep = ref<OnboardingStep>('user_profile')
  
  // Datos temporales del formulario (para auto-guardado)
  const formData = ref<{
    userProfile: Partial<IUserProfile>
    businessContext: Partial<IBusinessContext>
    preferences: Partial<IOnboardingPreferences>
  }>({
    userProfile: {},
    businessContext: {},
    preferences: {},
  })
  
  // ===== GETTERS COMPUTADOS =====
  
  // Verificar si hay alguna operación en curso
  const isLoading = computed(() => {
    return Object.values(loading.value).some(state => state)
  })
  
  // Obtener el porcentaje de completación
  const completionPercentage = computed(() => {
    return currentOnboarding.value?.completionPercentage ?? 0
  })
  
  // Verificar si el onboarding está completo
  const isComplete = computed(() => {
    if (!currentOnboarding.value) return false
    return currentOnboarding.value.preferences?.onboardingCompleted ?? false
  })
  
  // Obtener el siguiente paso
  const nextStep = computed((): OnboardingStep | null => {
    if (!currentOnboarding.value) return 'user_profile'
    
    const completedSteps = currentOnboarding.value.preferences?.completedSteps || []
    const allSteps: OnboardingStep[] = ['user_profile', 'business_context', 'preferences', 'first_content']
    
    for (const step of allSteps) {
      if (!completedSteps.includes(step)) {
        return step
      }
    }
    
    return null
  })
  
  // Verificar si un paso específico está completado
  const isStepCompleted = computed(() => {
    return (step: OnboardingStep): boolean => {
      if (!currentOnboarding.value) return false
      return currentOnboarding.value.preferences?.completedSteps?.includes(step) ?? false
    }
  })
  
  // Obtener pasos completados
  const completedSteps = computed(() => {
    return currentOnboarding.value?.preferences?.completedSteps ?? []
  })
  
  // Verificar si existe un onboarding
  const hasOnboarding = computed(() => {
    return currentOnboarding.value !== null
  })
  
  // ===== ACCIONES =====
  
  /**
   * Limpiar errores
   */
  const clearError = (): void => {
    error.value = null
  }
  
  /**
   * Establecer error
   */
  const setError = (newError: OnboardingError): void => {
    error.value = newError
  }
  
  /**
   * Crear un nuevo onboarding
   */
  const createOnboarding = async (data: CreateOnboardingRequest): Promise<void> => {
    loading.value.creating = true
    clearError()
    
    try {
      const response = await onboardingService.createOnboarding(data)
      currentOnboarding.value = response.onboarding
      currentStep.value = (response.nextStep as OnboardingStep) || 'user_profile'
    } catch (err: any) {
      setError({
        message: err.message || 'Error al crear el onboarding',
        code: err.code,
        field: err.field,
      })
      throw err
    } finally {
      loading.value.creating = false
    }
  }
  
  /**
   * Inicializar onboarding para el usuario autenticado
   */
  const initializeOnboarding = async (): Promise<void> => {
    loading.value.creating = true
    clearError()
    
    try {
      const response = await onboardingService.initializeOnboarding()
      currentOnboarding.value = response.onboarding
      currentStep.value = (response.nextStep as OnboardingStep) || 'user_profile'
    } catch (err: any) {
      setError({
        message: err.message || 'Error al inicializar el onboarding',
        code: err.code,
      })
      throw err
    } finally {
      loading.value.creating = false
    }
  }

  /**
   * Obtener onboarding del usuario autenticado
   */
  const fetchOnboarding = async (): Promise<void> => {
    loading.value.fetching = true
    clearError()
    
    try {
      const response = await onboardingService.getOnboarding()
      currentOnboarding.value = response.onboarding
      currentStep.value = (response.nextStep as OnboardingStep) || 'user_profile'
    } catch (err: any) {
      if (err.status !== 404) {
        setError({
          message: err.message || 'Error al obtener el onboarding',
          code: err.code,
        })
      }
      currentOnboarding.value = null
      throw err
    } finally {
      loading.value.fetching = false
    }
  }
  
  /**
   * Actualizar onboarding del usuario autenticado
   */
  const updateOnboarding = async (
    data: UpdateOnboardingRequest
  ): Promise<void> => {
    loading.value.updating = true
    clearError()
    
    try {
      const response = await onboardingService.updateOnboarding(data)
      currentOnboarding.value = response.onboarding
      currentStep.value = (response.nextStep as OnboardingStep) || currentStep.value
    } catch (err: any) {
      setError({
        message: err.message || 'Error al actualizar el onboarding',
        code: err.code,
        field: err.field,
      })
      throw err
    } finally {
      loading.value.updating = false
    }
  }
  
  /**
   * Completar un paso específico
   */
  const completeStep = async (step: OnboardingStep): Promise<void> => {
    loading.value.completing = true
    clearError()
    
    try {
      const response = await onboardingService.completeStep({ step })
      
      // Actualizar el onboarding actual
      if (currentOnboarding.value) {
        currentOnboarding.value.completionPercentage = response.completionPercentage
        
        // Inicializar preferences si no existe
        if (!currentOnboarding.value.preferences) {
          currentOnboarding.value.preferences = {
            communicationFrequency: 'weekly',
            preferredContentTypes: [],
            aiProviderPreference: 'no_preference',
            notificationSettings: {
              email: true,
              inApp: true,
              contentGenerated: true,
              weeklyReports: true,
              systemUpdates: false,
            },
            onboardingCompleted: false,
            completedSteps: [],
          }
        }
        
        // Agregar el paso a los completados si no está ya
        const completedSteps = currentOnboarding.value.preferences.completedSteps || []
        if (!completedSteps.includes(step)) {
          completedSteps.push(step)
          currentOnboarding.value.preferences.completedSteps = completedSteps
        }
        
        // Actualizar si está completo
        if (response.isComplete) {
          currentOnboarding.value.preferences.onboardingCompleted = true
        }
      }
      
      // Actualizar el paso actual
      currentStep.value = (response.nextStep as OnboardingStep) || currentStep.value
    } catch (err: any) {
      setError({
        message: err.message || 'Error al completar el paso',
        code: err.code,
      })
      throw err
    } finally {
      loading.value.completing = false
    }
  }
  
  // Método removido: fetchUserOnboardings ya que el backend maneja un onboarding por usuario
  
  /**
   * Eliminar onboarding del usuario autenticado
   */
  const deleteOnboarding = async (): Promise<void> => {
    loading.value.deleting = true
    clearError()
    
    try {
      await onboardingService.deleteOnboarding()
      
      // Limpiar el estado local
      currentOnboarding.value = null
      currentStep.value = 'user_profile'
    } catch (err: any) {
      setError({
        message: err.message || 'Error al eliminar el onboarding',
        code: err.code,
      })
      throw err
    } finally {
      loading.value.deleting = false
    }
  }
  
  /**
   * Actualizar solo el perfil de usuario
   */
  const updateUserProfile = async (
    userProfile: Partial<IUserProfile>
  ): Promise<void> => {
    // Guardar en datos temporales
    formData.value.userProfile = { ...formData.value.userProfile, ...userProfile }
    
    return updateOnboarding({ userProfile })
  }

  /**
   * Actualizar solo el contexto del negocio
   */
  const updateBusinessContext = async (
    businessContext: Partial<IBusinessContext>
  ): Promise<void> => {
    // Guardar en datos temporales
    formData.value.businessContext = { ...formData.value.businessContext, ...businessContext }
    
    return updateOnboarding({ businessContext })
  }

  /**
   * Actualizar solo las preferencias
   */
  const updatePreferences = async (
    preferences: Partial<IOnboardingPreferences>
  ): Promise<void> => {
    // Guardar en datos temporales
    formData.value.preferences = { ...formData.value.preferences, ...preferences }
    
    return updateOnboarding({ preferences })
  }
  
  /**
   * Navegar al siguiente paso
   */
  const goToNextStep = (): void => {
    const next = nextStep.value
    if (next) {
      currentStep.value = next
    }
  }
  
  /**
   * Navegar a un paso específico
   */
  const goToStep = (step: OnboardingStep): void => {
    currentStep.value = step
  }
  
  /**
   * Verificar si se puede navegar a un paso
   */
  const canNavigateToStep = (step: OnboardingStep): boolean => {
    const stepOrder: Record<OnboardingStep, number> = {
      user_profile: 0,
      business_context: 1,
      preferences: 2,
      first_content: 3,
    }
    
    const currentStepOrder = stepOrder[currentStep.value]
    const targetStepOrder = stepOrder[step]
    
    // Permitir navegar hacia atrás o al paso actual
    if (targetStepOrder <= currentStepOrder) {
      return true
    }
    
    // Verificar si los pasos anteriores están completados
    const allSteps: OnboardingStep[] = ['user_profile', 'business_context', 'preferences', 'first_content']
    const stepsToCheck = allSteps.slice(0, targetStepOrder)
    
    return stepsToCheck.every(stepToCheck => isStepCompleted.value(stepToCheck))
  }
  
  /**
   * Reiniciar el estado del store
   */
  const resetStore = (): void => {
    currentOnboarding.value = null
    currentStep.value = 'user_profile'
    formData.value = {
      userProfile: {},
      businessContext: {},
      preferences: {},
    }
    loading.value = {
      creating: false,
      updating: false,
      fetching: false,
      completing: false,
      deleting: false,
    }
    error.value = null
  }
  
  /**
   * Verificar si existe un onboarding para el usuario autenticado
   */
  const checkOnboardingExists = async (): Promise<boolean> => {
    try {
      return await onboardingService.checkOnboardingExists()
    } catch (err) {
      return false
    }
  }
  
  // ===== RETORNO DEL STORE =====
  return {
    // Estado
    currentOnboarding,
    loading,
    error,
    currentStep,
    formData,
    
    // Getters
    isLoading,
    completionPercentage,
    isComplete,
    nextStep,
    isStepCompleted,
    completedSteps,
    hasOnboarding,
    
    // Acciones
    clearError,
    setError,
    createOnboarding,
    initializeOnboarding,
    fetchOnboarding,
    updateOnboarding,
    completeStep,
    deleteOnboarding,
    updateUserProfile,
    updateBusinessContext,
    updatePreferences,
    goToNextStep,
    goToStep,
    canNavigateToStep,
    resetStore,
    checkOnboardingExists,
  }
})