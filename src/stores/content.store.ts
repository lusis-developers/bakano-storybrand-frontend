import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ContentService } from '@/services/content.service'
import type {
  IContent,
  ICreateContentRequest,
  IUpdateQuestionsRequest,
  IGenerateSoundbitesTaglinesRequest,
  IGenerateScriptRequest,
  IBusinessQuestions,
  ISoundbite,
  ITagline,
  IScript,
} from '@/types/content.types'

/**
 * Store para manejo de contenido - Gestiona proyectos de contenido, generación de soundbites, taglines y scripts
 */
export const useContentStore = defineStore('content', () => {
  // Estado reactivo
  const contentProjects = ref<IContent[]>([])
  const currentContent = ref<IContent | null>(null)
  const isLoading = ref(false)
  const isGeneratingContent = ref(false)
  const isGeneratingScript = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })

  // Getters computados
  const hasContentProjects = computed(() => contentProjects.value.length > 0)
  const hasCurrentContent = computed(() => currentContent.value !== null)
  const isContentLoading = computed(() => isLoading.value)
  const isContentGenerating = computed(() => isGeneratingContent.value)
  const isScriptGenerating = computed(() => isGeneratingScript.value)
  const contentError = computed(() => error.value)
  const currentContentId = computed(() => currentContent.value?._id || null)
  const currentContentStatus = computed(() => currentContent.value?.status || 'draft')
  const hasSoundbites = computed(() => (currentContent.value?.soundbites?.length || 0) > 0)
  const hasTaglines = computed(() => (currentContent.value?.taglines?.length || 0) > 0)
  const hasScripts = computed(() => (currentContent.value?.scripts?.length || 0) > 0)
  const isQuestionsComplete = computed(() => {
    if (!currentContent.value?.questions) return false
    const q = currentContent.value.questions
    return !!(
      q.companyName &&
      q.productsServices &&
      q.targetAudience &&
      q.mainProblem &&
      q.solution &&
      q.uniqueCharacteristics &&
      q.authority &&
      q.steps
    )
  })

  // Acciones
  /**
   * Crear nuevo proyecto de contenido
   */
  const createContentProject = async (
    businessId: string,
    data: ICreateContentRequest,
  ): Promise<IContent | null> => {
    try {
      isLoading.value = true
      error.value = null

      const response = await ContentService.createContentProject(businessId, data)

      if (response.content) {
        currentContent.value = response.content
        // Agregar a la lista si no existe
        const existingIndex = contentProjects.value.findIndex(
          (project) => project._id === response.content._id,
        )
        if (existingIndex === -1) {
          contentProjects.value.unshift(response.content)
        }
        return response.content
      }

      return null
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al crear proyecto de contenido'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Obtener proyecto de contenido por ID de negocio
   */
  const fetchContentByBusiness = async (businessId: string): Promise<IContent | null> => {
    try {
      isLoading.value = true
      error.value = null

      const response = await ContentService.getContentByBusiness(businessId)

      if (response.content) {
        currentContent.value = response.content
        return response.content
      }

      return null
    } catch (err: any) {
      if (err.response?.status === 404) {
        currentContent.value = null
        return null
      }
      error.value = err.response?.data?.message || 'Error al obtener proyecto de contenido'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Obtener todos los proyectos de contenido del usuario
   */
  const fetchUserContentProjects = async (
    page: number = 1,
    limit: number = 10,
    status?: string,
  ): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      const response = await ContentService.getUserContentProjects(page, limit, status)

      if (page === 1) {
        contentProjects.value.splice(0, contentProjects.value.length, ...response.contentProjects)
      } else {
        contentProjects.value.push(...response.contentProjects)
      }

      pagination.value = response.pagination
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al obtener proyectos de contenido'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Actualizar preguntas de negocio
   */
  const updateQuestions = async (
    contentId: string,
    questions: Partial<IBusinessQuestions>,
  ): Promise<IContent | null> => {
    try {
      isLoading.value = true
      error.value = null

      const response = await ContentService.updateQuestions(contentId, { questions })

      if (response.content) {
        currentContent.value = response.content

        // Actualizar en la lista
        const index = contentProjects.value.findIndex((project) => project._id === contentId)
        if (index !== -1) {
          contentProjects.value.splice(index, 1, response.content)
        }

        return response.content
      }

      return null
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al actualizar preguntas'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Generar soundbites y taglines
   */
  const generateSoundbitesAndTaglines = async (
    contentId: string,
    regenerate: boolean = false,
  ): Promise<{ soundbites: ISoundbite[]; taglines: ITagline[] } | null> => {
    try {
      isGeneratingContent.value = true
      error.value = null

      const response = await ContentService.generateSoundbitesAndTaglines(contentId, { regenerate })

      if (currentContent.value && currentContent.value._id === contentId) {
        currentContent.value.soundbites = response.soundbites
        currentContent.value.taglines = response.taglines

        // Actualizar en la lista
        const index = contentProjects.value.findIndex((project) => project._id === contentId)
        if (index !== -1) {
          contentProjects.value[index].soundbites = response.soundbites
          contentProjects.value[index].taglines = response.taglines
        }
      }

      return {
        soundbites: response.soundbites,
        taglines: response.taglines,
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al generar contenido'
      throw err
    } finally {
      isGeneratingContent.value = false
    }
  }

  /**
   * Generar script
   */
  const generateScript = async (
    contentId: string,
    scriptData: IGenerateScriptRequest,
  ): Promise<IScript | null> => {
    try {
      isGeneratingScript.value = true
      error.value = null

      const response = await ContentService.generateScript(contentId, scriptData)

      if (response.script && currentContent.value && currentContent.value._id === contentId) {
        currentContent.value.scripts.push(response.script)

        // Actualizar en la lista
        const index = contentProjects.value.findIndex((project) => project._id === contentId)
        if (index !== -1) {
          contentProjects.value[index].scripts.push(response.script)
        }

        return response.script
      }

      return null
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al generar script'
      throw err
    } finally {
      isGeneratingScript.value = false
    }
  }

  /**
   * Eliminar proyecto de contenido
   */
  const deleteContentProject = async (contentId: string): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      await ContentService.deleteContentProject(contentId)

      // Remover de la lista
      const index = contentProjects.value.findIndex((project) => project._id === contentId)
      if (index !== -1) {
        contentProjects.value.splice(index, 1)
      }

      // Limpiar contenido actual si es el que se eliminó
      if (currentContent.value?._id === contentId) {
        currentContent.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al eliminar proyecto de contenido'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Limpiar estado
   */
  const clearState = (): void => {
    contentProjects.value.splice(0)
    currentContent.value = null
    error.value = null
    isLoading.value = false
    isGeneratingContent.value = false
    isGeneratingScript.value = false
    pagination.value = {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    }
  }

  /**
   * Limpiar errores
   */
  const clearError = (): void => {
    error.value = null
  }

  /**
   * Establecer contenido actual
   */
  const setCurrentContent = (content: IContent | null): void => {
    currentContent.value = content
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

    // Acciones
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
  }
})

export default useContentStore
