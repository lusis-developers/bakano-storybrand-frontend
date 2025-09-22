<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useScripts } from '../composables/useScripts'
import { useContent } from '../composables/useContent'
import { useBusiness } from '../composables/useBusiness'
import { useToast } from '../composables/useToast'
import GenerationProgress from '../components/shared/GenerationProgress.vue'

// Importar componentes refactorizados
import {
  ScriptsHeader,
  ScriptsStats,
  ScriptsList,
  GenerateScriptModal,
  ScriptViewModal
} from './ScriptsView/components'

import type {
  IScript,
  IScriptFilters,
  IGenerateScriptRequest
} from '../types/content.types'

// Composables
const route = useRoute()
const router = useRouter()
const {
  scripts,
  filteredScripts,
  isLoading,
  isGenerating,
  error,
  scriptStats,
  hasScripts,
  loadScripts,
  generateScript,
  toggleScriptCompletion,
  deleteScript,
  setFilters,
  clearFilters,
  clearError
} = useScripts()

const { currentContent, fetchContentByBusiness, setCurrentContent } = useContent()
const { fetchBusinessByContentId } = useBusiness()
const { triggerToast } = useToast()

// Estado local
const contentId = ref<string>('')
const showGenerateModal = ref(false)
const selectedScript = ref<any>(null)
const showScriptModal = ref(false)
const isInitializing = ref(true)

// Computadas
const pageTitle = computed(() => {
  if (currentContent.value && currentContent.value.questions) {
    return `Scripts - ${currentContent.value.questions.companyName}`
  }
  return 'Scripts'
})

const canGenerateNewScript = computed(() => {
  return currentContent.value &&
    currentContent.value.soundbites &&
    currentContent.value.soundbites.length > 0 &&
    currentContent.value.taglines &&
    currentContent.value.taglines.length > 0 &&
    !isGenerating.value
})



// Transform IScript to Script interface for components
const transformedScripts = computed(() => {
  return filteredScripts.value.map((script, index) => ({
    id: index.toString(),
    title: script.title,
    content: script.content,
    type: script.type,
    platform: script.platform,
    completed: script.completed,
    duration: script.duration,
    generatedAt: script.generatedAt instanceof Date 
      ? script.generatedAt.toISOString() 
      : script.generatedAt // Ya es string desde el servidor
  }))
})

const soundbiteOptions = computed(() => {
  return currentContent.value?.soundbites?.map(sb => ({
    value: sb.text,
    label: `${sb.text} (${sb.category})`
  })) || []
})

const taglineOptions = computed(() => {
  return currentContent.value?.taglines?.map(tl => ({
    value: tl.text,
    label: `${tl.text} (${tl.style})`
  })) || []
})

// Métodos
const initializeView = async () => {
  
  try {
    isInitializing.value = true
    contentId.value = route.params.contentId as string

    if (!contentId.value) {
      console.error('No se proporcionó contentId')
      triggerToast('Error: No se encontró el ID del contenido', 'error')
      router.push('/dashboard')
      return
    }

    // Primero obtener el negocio usando el contentId
    const business = await fetchBusinessByContentId(contentId.value)
    
    if (!business) {
      console.error('No se pudo obtener el negocio asociado al contenido')
      triggerToast('Error: No se encontró el negocio asociado', 'error')
      router.push('/dashboard')
      return
    }

    // Ahora cargar el contenido usando el businessId
    await fetchContentByBusiness(business.id || business._id)

    if (!currentContent.value) {
      console.error('No se pudo cargar el contenido')
      triggerToast('Error: No se pudo cargar el contenido', 'error')
      router.push('/dashboard')
      return
    }

    // Cargar scripts
    await loadScripts(contentId.value)
    
  } catch (error) {
    console.error('Error inicializando vista:', error)
    triggerToast('Error al cargar los datos', 'error')
  } finally {
    isInitializing.value = false
  }
}

// Handlers para eventos de componentes
const handleGoBack = () => {
  router.push('/dashboard')
}

const handleOpenGenerateModal = () => {
  if (!canGenerateNewScript.value) {
    triggerToast('No se puede generar un script en este momento', 'error')
    return
  }
  showGenerateModal.value = true
}

const handleCloseGenerateModal = () => {
  showGenerateModal.value = false
}

const handleGenerateScript = async (scriptData: any) => {
  try {
    // Transform NewScript to IGenerateScriptRequest
    const generateRequest: IGenerateScriptRequest = {
      scriptType: scriptData.scriptType as 'content' | 'ad',
      platform: scriptData.platform || undefined,
      selectedSoundbite: scriptData.selectedSoundbite || undefined,
      selectedTagline: scriptData.selectedTagline || undefined,
      customText: scriptData.customText || undefined
    }
    await generateScript(contentId.value, generateRequest)
    showGenerateModal.value = false
    triggerToast('Script generado exitosamente', 'success')
  } catch (error) {
    console.error('Error generando script:', error)
    triggerToast('Error al generar el script', 'error')
  }
}

const handleToggleComplete = async (script: any, index: number) => {
  try {
    await toggleScriptCompletion(contentId.value, index, !script.completed)
    triggerToast('Estado del script actualizado', 'success')
  } catch (error) {
    console.error('Error actualizando script:', error)
    triggerToast('Error al actualizar el script', 'error')
  }
}

const handleViewScript = (script: any) => {
  // Transform back to IScript for the modal and add id property
  const iScript = filteredScripts.value[parseInt(script.id)]
  const scriptWithId = {
    ...iScript,
    id: script.id
  }
  selectedScript.value = scriptWithId as any
  showScriptModal.value = true
}

const handleCopyScript = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content)
    triggerToast('Contenido copiado al portapapeles', 'success')
  } catch (error) {
    console.error('Error copiando contenido:', error)
    triggerToast('Error al copiar el contenido', 'error')
  }
}

const handleDeleteScript = async (script: any, index: number) => {
  try {
    await deleteScript(contentId.value, index)
    triggerToast('Script eliminado exitosamente', 'success')
  } catch (error) {
    console.error('Error eliminando script:', error)
    triggerToast('Error al eliminar el script', 'error')
  }
}

const handleCloseScriptModal = () => {
  showScriptModal.value = false
  selectedScript.value = null
}

// Lifecycle
onMounted(() => {
  initializeView()
})
</script>

<template>
  <div class="scripts-view">
    <div class="scripts-container">
      <!-- Header -->
      <ScriptsHeader
        :current-content="currentContent"
        :can-generate-new-script="Boolean(canGenerateNewScript)"
        @go-back="handleGoBack"
        @open-generate-modal="handleOpenGenerateModal"
      />

      <!-- Stats -->
      <ScriptsStats
        :script-stats="scriptStats"
        :has-scripts="hasScripts"
      />



      <!-- Scripts List -->
      <ScriptsList
        :scripts="transformedScripts"
        :is-loading="isLoading"
        :is-initializing="isInitializing"
        :can-generate-new-script="Boolean(canGenerateNewScript)"
        @toggle-completion="handleToggleComplete"
        @view-script="handleViewScript"
        @copy-script="handleCopyScript"
        @delete-script="handleDeleteScript"
        @generate-script="handleOpenGenerateModal"
      />
    </div>

    <!-- Generate Script Modal -->
    <GenerateScriptModal
      :show-modal="showGenerateModal"
      :is-generating="isGenerating"
      :soundbite-options="soundbiteOptions"
      :tagline-options="taglineOptions"
      @close="handleCloseGenerateModal"
      @generate="handleGenerateScript"
    />

    <!-- Script View Modal -->
    <ScriptViewModal
      :show-modal="showScriptModal"
      :script="selectedScript"
      @close="handleCloseScriptModal"
      @copy="handleCopyScript"
    />

    <!-- Generation Progress Overlay -->
    <GenerationProgress 
      :is-generating="isGenerating"
      message="Generando script personalizado para tu marca..."
    />
  </div>
</template>

<style lang="scss" scoped>
.scripts-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
}

.scripts-container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}
</style>