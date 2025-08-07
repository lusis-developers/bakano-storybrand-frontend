import { useContentStore } from '@/stores/content.store'
import type {
  IContent,
  ICreateContentRequest,
  IUpdateQuestionsRequest,
  IGenerateScriptRequest,
  IBusinessQuestions
} from '@/types/content.types'

/**
 * Composable para manejo de contenido
 * Proporciona una interfaz reactiva y funciones de utilidad para operaciones de contenido
 */
export const useContent = () => {
  const contentStore = useContentStore()

  // Estado reactivo del store
  const {
    contentProjects,
    currentContent,
    isLoading,
    isGeneratingContent,
    isGeneratingScript,
    error,
    pagination
  } = contentStore

  // Getters computados del store
  const {
    hasContentProjects,
    hasCurrentContent,
    isContentLoading,
    isContentGenerating,
    isScriptGenerating,
    contentError,
    currentContentId,
    currentContentStatus,
    hasSoundbites,
    hasTaglines,
    hasScripts,
    isQuestionsComplete
  } = contentStore

  // Acciones del store
  const {
    createContentProject,
    fetchContentByBusiness,
    fetchUserContentProjects,
    updateQuestions,
    generateSoundbitesAndTaglines,
    generateScript,
    deleteContentProject,
    clearState,
    clearError,
    setCurrentContent
  } = contentStore

  // Funciones de utilidad adicionales
  
  /**
   * Crear proyecto de contenido con manejo de errores
   */
  const createProject = async (
    businessId: string,
    questions: IBusinessQuestions,
    tone: string = 'professional',
    aiProvider: 'openai' | 'gemini' = 'gemini'
  ): Promise<IContent | null> => {
    try {
      const data: ICreateContentRequest = {
        questions,
        tone,
        aiProvider
      }
      return await createContentProject(businessId, data)
    } catch (error) {
      console.error('Error creating content project:', error)
      return null
    }
  }

  /**
   * Obtener o crear proyecto de contenido para un negocio
   */
  const getOrCreateContentProject = async (
    businessId: string,
    defaultQuestions?: Partial<IBusinessQuestions>
  ): Promise<IContent | null> => {
    try {
      // Intentar obtener proyecto existente
      const existingContent = await fetchContentByBusiness(businessId)
      if (existingContent) {
        return existingContent
      }

      // Si no existe y se proporcionan preguntas por defecto, crear uno nuevo
      if (defaultQuestions) {
        const questions: IBusinessQuestions = {
          companyName: defaultQuestions.companyName || '',
          productsServices: defaultQuestions.productsServices || '',
          targetAudience: defaultQuestions.targetAudience || '',
          mainProblem: defaultQuestions.mainProblem || '',
          solution: defaultQuestions.solution || '',
          uniqueCharacteristics: defaultQuestions.uniqueCharacteristics || '',
          authority: defaultQuestions.authority || '',
          steps: defaultQuestions.steps || ''
        }
        return await createProject(businessId, questions)
      }

      return null
    } catch (error) {
      console.error('Error getting or creating content project:', error)
      return null
    }
  }

  /**
   * Actualizar una pregunta específica
   */
  const updateSingleQuestion = async (
    contentId: string,
    field: keyof IBusinessQuestions,
    value: string
  ): Promise<IContent | null> => {
    try {
      const questions = { [field]: value }
      return await updateQuestions(contentId, questions)
    } catch (error) {
      console.error(`Error updating question ${field}:`, error)
      return null
    }
  }

  /**
   * Generar contenido (soundbites y taglines) con validación
   */
  const generateContent = async (
    contentId: string,
    regenerate: boolean = false
  ) => {
    try {
      if (!isQuestionsComplete && !regenerate) {
        throw new Error('Por favor completa todas las preguntas antes de generar contenido')
      }
      
      return await generateSoundbitesAndTaglines(contentId, regenerate)
    } catch (error) {
      console.error('Error generating content:', error)
      throw error
    }
  }

  /**
   * Generar script con validación
   */
  const createScript = async (
    contentId: string,
    scriptType: 'content' | 'ad',
    platform?: 'youtube' | 'social' | 'email' | 'website',
    selectedSoundbite?: string,
    selectedTagline?: string
  ) => {
    try {
      if (!hasSoundbites || !hasTaglines) {
        throw new Error('Por favor genera soundbites y taglines antes de crear scripts')
      }

      const scriptData: IGenerateScriptRequest = {
        scriptType,
        platform,
        selectedSoundbite,
        selectedTagline
      }

      return await generateScript(contentId, scriptData)
    } catch (error) {
      console.error('Error creating script:', error)
      throw error
    }
  }

  /**
   * Verificar si el contenido está listo para generar scripts
   */
  const canGenerateScripts = (): boolean => {
    return hasSoundbites && hasTaglines
  }

  /**
   * Obtener progreso del proyecto de contenido
   */
  const getContentProgress = (): {
    percentage: number
    currentStep: string
    nextStep: string | null
  } => {
    if (!currentContent) {
      return {
        percentage: 0,
        currentStep: 'No hay proyecto activo',
        nextStep: 'Crear proyecto de contenido'
      }
    }

    const status = currentContent.status
    
    switch (status) {
      case 'draft':
        return {
          percentage: 25,
          currentStep: 'Completar preguntas de negocio',
          nextStep: 'Generar soundbites y taglines'
        }
      case 'questions_completed':
        return {
          percentage: 50,
          currentStep: 'Preguntas completadas',
          nextStep: 'Generar soundbites y taglines'
        }
      case 'content_generated':
        return {
          percentage: 75,
          currentStep: 'Contenido generado',
          nextStep: 'Generar scripts'
        }
      case 'completed':
        return {
          percentage: 100,
          currentStep: 'Proyecto completado',
          nextStep: null
        }
      default:
        return {
          percentage: 0,
          currentStep: 'Estado desconocido',
          nextStep: null
        }
    }
  }

  /**
   * Limpiar errores y resetear estado
   */
  const resetContentState = (): void => {
    clearError()
    clearState()
  }

  return {
    // Estado
    contentProjects,
    currentContent,
    isLoading,
    isGeneratingContent,
    isGeneratingScript,
    error,
    pagination,
    
    // Getters
    hasContentProjects,
    hasCurrentContent,
    isContentLoading,
    isContentGenerating,
    isScriptGenerating,
    contentError,
    currentContentId,
    currentContentStatus,
    hasSoundbites,
    hasTaglines,
    hasScripts,
    isQuestionsComplete,
    
    // Acciones básicas
    createContentProject,
    fetchContentByBusiness,
    fetchUserContentProjects,
    updateQuestions,
    generateSoundbitesAndTaglines,
    generateScript,
    deleteContentProject,
    clearState,
    clearError,
    setCurrentContent,
    
    // Funciones de utilidad
    createProject,
    getOrCreateContentProject,
    updateSingleQuestion,
    generateContent,
    createScript,
    canGenerateScripts,
    getContentProgress,
    resetContentState
  }
}

export default useContent