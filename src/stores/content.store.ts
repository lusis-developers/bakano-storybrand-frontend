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
  IScriptFilters,
  IScriptsResponse,
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
  const isLoadingScripts = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })
  const scriptFilters = ref<IScriptFilters>({})
  const filteredScripts = ref<IScript[]>([])
  const scriptsTotal = ref(0)

  // Getters computados
  const hasContentProjects = computed(() => contentProjects.value.length > 0)
  const hasCurrentContent = computed(() => currentContent.value !== null)
  const isContentLoading = computed(() => isLoading.value)
  const isContentGenerating = computed(() => isGeneratingContent.value)
  const isScriptGenerating = computed(() => isGeneratingScript.value)
  const isScriptsLoading = computed(() => isLoadingScripts.value)
  const contentError = computed(() => error.value)
  const currentContentId = computed(() => currentContent.value?._id || null)
  const currentContentStatus = computed(() => currentContent.value?.status || 'draft')
  const hasSoundbites = computed(() => (currentContent.value?.soundbites?.length || 0) > 0)
  const hasTaglines = computed(() => (currentContent.value?.taglines?.length || 0) > 0)
  const hasScripts = computed(() => (currentContent.value?.scripts?.length || 0) > 0)
  const hasFilteredScripts = computed(() => filteredScripts.value.length > 0)
  const hasActiveFilters = computed(() => {
    const filters = scriptFilters.value
    return !!(filters.type || filters.platform || filters.completed !== undefined || filters.startDate || filters.endDate)
  })
  const activeFiltersCount = computed(() => {
    const filters = scriptFilters.value
    let count = 0
    if (filters.type) count++
    if (filters.platform) count++
    if (filters.completed !== undefined) count++
    if (filters.startDate) count++
    if (filters.endDate) count++
    return count
  })
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

      console.log('🔄 Store: Llamando a ContentService.createContentProject con:', { businessId, data })
      
      const response = await ContentService.createContentProject(businessId, data)
      
      console.log('📦 Store: Respuesta completa del servicio:', response)
      console.log('📦 Store: Contenido en respuesta:', response.content)

      if (response && response.content && response.content._id) {
        currentContent.value = response.content
        // Agregar a la lista si no existe
        const existingIndex = contentProjects.value.findIndex(
          (project) => project._id === response.content._id,
        )
        if (existingIndex === -1) {
          contentProjects.value.unshift(response.content)
        }
        console.log('✅ Store: Proyecto creado exitosamente:', response.content)
        return response.content
      }

      console.log('❌ Store: Respuesta inválida o sin contenido:', response)
      return null
    } catch (err: any) {
      console.error('❌ Store: Error en createContentProject:', err)
      error.value = err.message || err.response?.data?.message || 'Error al crear proyecto de contenido'
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

        // Refrescar scripts filtrados si hay filtros activos
        if (hasActiveFilters.value) {
          await fetchScripts(contentId, scriptFilters.value)
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
   * Obtener scripts con filtros aplicados
   */
  const fetchScripts = async (
    contentId: string,
    filters?: IScriptFilters,
  ): Promise<IScript[]> => {
    try {
      isLoadingScripts.value = true
      error.value = null

      const response = await ContentService.getScripts(contentId, filters)

      if (response.scripts) {
        filteredScripts.value = response.scripts
        scriptsTotal.value = response.total || response.scripts.length
        
        // Actualizar filtros actuales
        if (filters) {
          scriptFilters.value = { ...filters }
        }

        return response.scripts
      }

      return []
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al obtener scripts'
      throw err
    } finally {
      isLoadingScripts.value = false
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
   * Aplicar filtros a scripts
   */
  const applyScriptFilters = async (
    contentId: string,
    filters: IScriptFilters,
  ): Promise<IScript[]> => {
    return await fetchScripts(contentId, filters)
  }

  /**
   * Limpiar filtros de scripts
   */
  const clearScriptFilters = async (contentId: string): Promise<IScript[]> => {
    scriptFilters.value = {}
    return await fetchScripts(contentId)
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
    isLoadingScripts.value = false
    filteredScripts.value.splice(0)
    scriptFilters.value = {}
    scriptsTotal.value = 0
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
    isLoadingScripts,
    error,
    pagination,
    scriptFilters,
    filteredScripts,
    scriptsTotal,

    // Getters
    hasContentProjects,
    hasCurrentContent,
    isContentLoading,
    isContentGenerating,
    isScriptGenerating,
    isScriptsLoading,
    contentError,
    currentContentId,
    currentContentStatus,
    hasSoundbites,
    hasTaglines,
    hasScripts,
    hasFilteredScripts,
    hasActiveFilters,
    activeFiltersCount,
    isQuestionsComplete,

    // Acciones
    createContentProject,
    fetchContentByBusiness,
    fetchUserContentProjects,
    updateQuestions,
    generateSoundbitesAndTaglines,
    generateScript,
    fetchScripts,
    applyScriptFilters,
    clearScriptFilters,
    deleteContentProject,
    clearState,
    clearError,
    setCurrentContent,
  }
})

export default useContentStore
