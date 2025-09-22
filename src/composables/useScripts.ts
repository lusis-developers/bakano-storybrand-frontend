import { computed } from 'vue'
import { useScriptsStore } from '../stores/scripts.store'
import type {
  IScript,
  IScriptFilters,
  IGenerateScriptRequest
} from '../types/content.types'

/**
 * Composable para el manejo de scripts
 * Proporciona una interfaz reactiva para interactuar con el store de scripts
 */
export const useScripts = () => {
  const scriptsStore = useScriptsStore()

  // Estado reactivo del store
  const scripts = computed(() => scriptsStore.scripts)
  const filteredScripts = computed(() => scriptsStore.filteredScripts)
  const currentContentId = computed(() => scriptsStore.currentContentId || '')
  const isLoading = computed(() => scriptsStore.isLoading)
  const isGenerating = computed(() => scriptsStore.isGenerating)
  const error = computed(() => scriptsStore.error)
  const filters = computed(() => scriptsStore.filters)
  const total = computed(() => scriptsStore.total)

  // Getters computados
  const scriptStats = computed(() => {
    const allScripts = scripts.value
    return {
      total: allScripts.length,
      completed: allScripts.filter(s => s.completed).length,
      pending: allScripts.filter(s => !s.completed).length,
      content: allScripts.filter(s => s.type === 'content').length,
      ad: allScripts.filter(s => s.type === 'ad').length,
      byType: {
        content: allScripts.filter(s => s.type === 'content').length,
        ad: allScripts.filter(s => s.type === 'ad').length
      }
    }
  })
  const hasScripts = computed(() => filteredScripts.value.length > 0)
  const hasCompletedScripts = computed(() => scripts.value.some(s => s.completed))
  const hasPendingScripts = computed(() => scripts.value.some(s => !s.completed))

  // Acciones del store
  const setContentId = (contentId: string) => {
    scriptsStore.setContentId(contentId)
  }

  const setFilters = async (newFilters: IScriptFilters) => {
    scriptsStore.setFilters(newFilters)
  }

  const clearFilters = async () => {
    scriptsStore.clearFilters()
  }

  const loadScripts = async (contentId: string, scriptFilters?: IScriptFilters) => {
    return await scriptsStore.loadScripts(contentId, scriptFilters)
  }

  const generateScript = async (
    contentId: string,
    scriptData: IGenerateScriptRequest
  ): Promise<IScript | null> => {
    return await scriptsStore.generateScript(contentId, scriptData)
  }

  const toggleScriptCompletion = async (
    contentId: string,
    scriptIndex: number,
    completed: boolean
  ): Promise<boolean> => {
    return await scriptsStore.toggleScriptCompletion(contentId, scriptIndex, completed)
  }

  const deleteScript = async (
    contentId: string,
    scriptIndex: number
  ): Promise<boolean> => {
    return await scriptsStore.deleteScript(contentId, scriptIndex)
  }

  const clearScripts = () => {
    scriptsStore.clearScripts()
  }

  const clearError = () => {
    scriptsStore.clearError()
  }

  // Funciones de utilidad
  const getScriptByIndex = (index: number): IScript | null => {
    const allScripts = scripts.value
    return allScripts[index] || null
  }

  const getScriptsByType = (type: 'content' | 'ad'): IScript[] => {
    return scripts.value.filter(script => script.type === type)
  }

  const getScriptsByPlatform = (platform: string): IScript[] => {
    return scripts.value.filter(script => script.platform === platform)
  }

  const getCompletedScripts = (): IScript[] => {
    return scripts.value.filter(script => script.completed)
  }

  const getPendingScripts = (): IScript[] => {
    return scripts.value.filter(script => !script.completed)
  }

  // Funciones de conveniencia
  const refreshScripts = async () => {
    if (currentContentId.value) {
      await loadScripts(currentContentId.value, filters.value)
    }
  }

  const applyFilters = async (newFilters: IScriptFilters) => {
    await setFilters(newFilters)
  }

  const resetAndLoad = async (contentId: string) => {
    clearScripts()
    await clearFilters()
    await loadScripts(contentId)
  }

  // Funciones de validación
  const isValidScriptIndex = (index: number): boolean => {
    return index >= 0 && index < scripts.value.length
  }

  const canGenerateScript = (contentId: string): boolean => {
    return !!contentId && !isGenerating.value
  }

  const canModifyScript = (scriptIndex: number): boolean => {
    return isValidScriptIndex(scriptIndex) && !isLoading.value
  }

  return {
    // Estado
    scripts,
    filteredScripts,
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

    // Acciones principales
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
    getPendingScripts,

    // Funciones de conveniencia
    refreshScripts,
    applyFilters,
    resetAndLoad,

    // Validaciones
    isValidScriptIndex,
    canGenerateScript,
    canModifyScript
  }
}

export default useScripts