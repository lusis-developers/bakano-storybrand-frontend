import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import ContentService from '../services/content.service'
import type {
  IScript,
  IScriptFilters,
  IScriptStats,
  IGenerateScriptRequest,
  IToggleScriptCompletionRequest
} from '../types/content.types'

/**
 * Store para el manejo de scripts
 * Complementa el store de contenido con funcionalidades específicas para scripts
 */
export const useScriptsStore = defineStore('scripts', () => {
  // Estado reactivo
  const scripts = ref<IScript[]>([])
  const currentContentId = ref<string | null>(null)
  const isLoading = ref(false)
  const isGenerating = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<IScriptFilters>({})
  const total = ref(0)

  // Getters computados
  const scriptStats = computed((): IScriptStats => {
    const totalScripts = scripts.value.length
    const completedScripts = scripts.value.filter(s => s.completed).length
    const pendingScripts = totalScripts - completedScripts

    const byType = {
      content: scripts.value.filter(s => s.type === 'content').length,
      ad: scripts.value.filter(s => s.type === 'ad').length
    }

    const byPlatform = {
      youtube: scripts.value.filter(s => s.platform === 'youtube').length,
      instagram: scripts.value.filter(s => s.platform === 'instagram').length,
      tiktok: scripts.value.filter(s => s.platform === 'tiktok').length,
      social: scripts.value.filter(s => s.platform === 'social').length,
      email: scripts.value.filter(s => s.platform === 'email').length,
      website: scripts.value.filter(s => s.platform === 'website').length
    }

    return {
      total: totalScripts,
      completed: completedScripts,
      pending: pendingScripts,
      byType,
      byPlatform
    }
  })

  const hasScripts = computed(() => scripts.value.length > 0)
  const hasCompletedScripts = computed(() => scripts.value.some(s => s.completed))
  const hasPendingScripts = computed(() => scripts.value.some(s => !s.completed))

  // Filtros computados
  const filteredScripts = computed(() => {
    let filtered = [...scripts.value]

    if (filters.value.type) {
      filtered = filtered.filter(s => s.type === filters.value.type)
    }

    if (filters.value.platform) {
      filtered = filtered.filter(s => s.platform === filters.value.platform)
    }

    if (filters.value.completed !== undefined) {
      filtered = filtered.filter(s => s.completed === filters.value.completed)
    }

    if (filters.value.startDate) {
      const startDate = new Date(filters.value.startDate)
      filtered = filtered.filter(s => new Date(s.generatedAt) >= startDate)
    }

    if (filters.value.endDate) {
      const endDate = new Date(filters.value.endDate)
      endDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter(s => new Date(s.generatedAt) <= endDate)
    }

    // Ordenar por fecha de generación (más recientes primero)
    return filtered.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
  })

  // Acciones
  const setContentId = (contentId: string) => {
    currentContentId.value = contentId
  }

  const setFilters = (newFilters: IScriptFilters) => {
    filters.value = { ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {}
  }

  const loadScripts = async (contentId: string, scriptFilters?: IScriptFilters) => {
    if (!contentId) return

    isLoading.value = true
    error.value = null

    try {
      setContentId(contentId)
      if (scriptFilters) {
        setFilters(scriptFilters)
      }

      const response = await ContentService.getScripts(contentId, scriptFilters)
      scripts.value = response.scripts
      total.value = response.total
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar scripts'
      console.error('Error loading scripts:', err)
    } finally {
      isLoading.value = false
    }
  }

  const generateScript = async (
    contentId: string,
    scriptData: IGenerateScriptRequest
  ): Promise<IScript | null> => {
    if (!contentId) return null

    isGenerating.value = true
    error.value = null

    try {
      const response = await ContentService.generateScript(contentId, scriptData)
      
      // Agregar el nuevo script al estado local
      scripts.value.unshift(response.script)
      total.value += 1

      return response.script
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al generar script'
      console.error('Error generating script:', err)
      return null
    } finally {
      isGenerating.value = false
    }
  }

  const toggleScriptCompletion = async (
    contentId: string,
    scriptIndex: number,
    completed: boolean
  ): Promise<boolean> => {
    if (!contentId || scriptIndex < 0 || scriptIndex >= scripts.value.length) {
      return false
    }

    const originalCompleted = scripts.value[scriptIndex].completed
    
    // Actualización optimista
    scripts.value[scriptIndex].completed = completed

    try {
      await ContentService.toggleScriptCompletion(
        contentId,
        scriptIndex,
        { completed }
      )
      return true
    } catch (err: any) {
      // Revertir cambio en caso de error
      scripts.value[scriptIndex].completed = originalCompleted
      error.value = err.response?.data?.message || 'Error al actualizar estado del script'
      console.error('Error toggling script completion:', err)
      return false
    }
  }

  const deleteScript = async (
    contentId: string,
    scriptIndex: number
  ): Promise<boolean> => {
    if (!contentId || scriptIndex < 0 || scriptIndex >= scripts.value.length) {
      return false
    }

    const scriptToDelete = scripts.value[scriptIndex]

    try {
      await ContentService.deleteScript(contentId, scriptIndex)
      
      // Remover del estado local
      scripts.value.splice(scriptIndex, 1)
      total.value -= 1

      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al eliminar script'
      console.error('Error deleting script:', err)
      return false
    }
  }

  const clearScripts = () => {
    scripts.value = []
    total.value = 0
    currentContentId.value = null
    error.value = null
  }

  const clearError = () => {
    error.value = null
  }

  // Funciones de utilidad
  const getScriptByIndex = (index: number): IScript | null => {
    return scripts.value[index] || null
  }

  const getScriptsByType = (type: 'content' | 'ad'): IScript[] => {
    return scripts.value.filter(s => s.type === type)
  }

  const getScriptsByPlatform = (platform: string): IScript[] => {
    return scripts.value.filter(s => s.platform === platform)
  }

  const getCompletedScripts = (): IScript[] => {
    return scripts.value.filter(s => s.completed)
  }

  const getPendingScripts = (): IScript[] => {
    return scripts.value.filter(s => !s.completed)
  }

  return {
    // Estado
    scripts,
    currentContentId,
    isLoading,
    isGenerating,
    error,
    filters,
    total,

    // Getters
    scriptStats,
    hasScripts,
    hasCompletedScripts,
    hasPendingScripts,
    filteredScripts,

    // Acciones
    setContentId,
    setFilters,
    clearFilters,
    loadScripts,
    generateScript,
    toggleScriptCompletion,
    deleteScript,
    clearScripts,
    clearError,

    // Utilidades
    getScriptByIndex,
    getScriptsByType,
    getScriptsByPlatform,
    getCompletedScripts,
    getPendingScripts
  }
})

export default useScriptsStore