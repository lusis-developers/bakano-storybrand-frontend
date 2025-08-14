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
  const currentContentId = computed(() => scriptsStore.currentContentId)
  const isLoading = computed(() => scriptsStore.isLoading)
  const isGenerating = computed(() => scriptsStore.isGenerating)
  const error = computed(() => scriptsStore.error)
  const filters = computed(() => scriptsStore.filters)
  const total = computed(() => scriptsStore.total)

  // Getters computados
  const scriptStats = computed(() => scriptsStore.scriptStats)
  const hasScripts = computed(() => scriptsStore.hasScripts)
  const hasCompletedScripts = computed(() => scriptsStore.hasCompletedScripts)
  const hasPendingScripts = computed(() => scriptsStore.hasPendingScripts)

  // Acciones del store
  const setContentId = (contentId: string) => {
    scriptsStore.setContentId(contentId)
  }

  const setFilters = (newFilters: IScriptFilters) => {
    scriptsStore.setFilters(newFilters)
  }

  const clearFilters = () => {
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
    return scriptsStore.getScriptByIndex(index)
  }

  const getScriptsByType = (type: 'content' | 'ad'): IScript[] => {
    return scriptsStore.getScriptsByType(type)
  }

  const getScriptsByPlatform = (platform: string): IScript[] => {
    return scriptsStore.getScriptsByPlatform(platform)
  }

  const getCompletedScripts = (): IScript[] => {
    return scriptsStore.getCompletedScripts()
  }

  const getPendingScripts = (): IScript[] => {
    return scriptsStore.getPendingScripts()
  }

  // Funciones de conveniencia
  const refreshScripts = async () => {
    if (currentContentId.value) {
      await loadScripts(currentContentId.value, filters.value)
    }
  }

  const applyFilters = async (newFilters: IScriptFilters) => {
    setFilters(newFilters)
    if (currentContentId.value) {
      await loadScripts(currentContentId.value, newFilters)
    }
  }

  const resetAndLoad = async (contentId: string) => {
    clearScripts()
    clearFilters()
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