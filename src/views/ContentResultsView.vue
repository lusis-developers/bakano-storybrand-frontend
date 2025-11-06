<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useContentStore } from '@/stores/content.store'
import { useToast } from '@/composables/useToast'
import type { IContent, ISoundbite, ITagline } from '@/types/content.types'

// Componentes
import StatusBanner from '@/components/content/StatusBanner.vue'
import GenerateSection from '@/components/content/GenerateSection.vue'
import ProgressIndicator from '@/components/content/ProgressIndicator.vue'
import SoundbitesSection from '@/components/content/SoundbitesSection.vue'
import TaglinesSection from '@/components/content/TaglinesSection.vue'
import ScriptsHero from '@/components/content/ScriptsHero.vue'
import GenerationProgress from '@/components/shared/GenerationProgress.vue'

// Composables
const router = useRouter()
const route = useRoute()
const contentStore = useContentStore()
const { triggerToast } = useToast()

// Estado local
const isLoading = ref(true)
const contentId = ref(route.params.contentId as string)
const isRegenerating = ref(false)
const isGenerating = ref(false)

// Computed
const currentContent = computed(() => contentStore.currentContent)
const hasSoundbites = computed(() => currentContent.value?.soundbites && currentContent.value.soundbites.length > 0)
const hasTaglines = computed(() => currentContent.value?.taglines && currentContent.value.taglines.length > 0)
const isContentComplete = computed(() => hasSoundbites.value && hasTaglines.value)
const hasQuestionsCompleted = computed(() => {
  const content = currentContent.value
  if (!content?.questions) return false

  const questions = content.questions
  return questions.companyName &&
    questions.productsServices &&
    questions.targetAudience &&
    questions.mainProblem &&
    questions.solution &&
    questions.uniqueCharacteristics &&
    questions.authority &&
    questions.steps
})
const shouldShowGenerateButton = computed(() => {
  return hasQuestionsCompleted.value && !isContentComplete.value
})

// Cargar contenido al montar
onMounted(async () => {
  try {
    isLoading.value = true

    // Si no tenemos el contenido actual, intentar cargarlo
    if (!currentContent.value || currentContent.value._id !== contentId.value) {
      const existingContent = contentStore.contentProjects.find(p => p._id === contentId.value)
      if (existingContent) {
        contentStore.setCurrentContent(existingContent)
      } else {
        triggerToast('Contenido no encontrado', 'error')
        router.push('/dashboard')
        return
      }
    }

  } catch (error: any) {
    console.error('Error al cargar contenido:', error)
    triggerToast('Error al cargar el contenido', 'error')
    router.push('/dashboard')
  } finally {
    isLoading.value = false
  }
})

/**
 * Generar soundbites y taglines por primera vez
 */
const generateContent = async () => {
  try {
    isGenerating.value = true
    triggerToast('Generando soundbites y taglines con IA...', 'info')

    await contentStore.generateSoundbitesAndTaglines(contentId.value, false)

    triggerToast('¡Soundbites y taglines generados exitosamente!', 'success')
  } catch (error: any) {
    console.error('Error al generar soundbites y taglines:', error)
    triggerToast('Error al generar soundbites y taglines', 'error')
  } finally {
    isGenerating.value = false
  }
}

/**
 * Regenerar soundbites y taglines
 */
const regenerateContent = async () => {
  try {
    isRegenerating.value = true

    await contentStore.generateSoundbitesAndTaglines(contentId.value, true)

    triggerToast('Soundbites y taglines regenerados exitosamente', 'success')
  } catch (error: any) {
    console.error('Error al regenerar soundbites y taglines:', error)
    triggerToast('Error al regenerar soundbites y taglines', 'error')
  } finally {
    isRegenerating.value = false
  }
}

/**
 * Navegar al wizard para editar preguntas
 */
const editQuestions = () => {
  if (currentContent.value?._id) {
    // Usar el contentId para navegar al wizard en modo edición
    router.push({ path: '/content/wizard', query: { contentId: currentContent.value._id } })
  }
}

/**
 * Copiar texto al portapapeles
 */
const copyToClipboard = async (text: string) => {
  try {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(text)
      triggerToast('Copiado al portapapeles', 'success')
    } else {
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      triggerToast('Copiado al portapapeles', 'success')
    }
  } catch (error) {
    console.error('Error al copiar:', error)
    triggerToast('Error al copiar al portapapeles', 'error')
  }
}

/**
 * Volver al dashboard
 */
const goToDashboard = () => {
  router.push('/dashboard')
}

/**
 * Navegar a la vista de scripts
 */
const goToScripts = () => {
  if (currentContent.value?._id) {
    router.push(`/content/scripts/${currentContent.value._id}`)
  }
}

/**
 * Scroll suave hacia la sección de scripts
 */
const scrollToScripts = () => {
  const scriptsSection = document.querySelector('#scripts-section')
  if (scriptsSection) {
    scriptsSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
}
</script>

<template>
  <div class="results-container">
    <div class="container">
      <!-- Header -->
      <header class="results-header">
        <button @click="goToDashboard" class="back-btn">
          ← Volver al Dashboard
        </button>
        
        <div class="results-title">
          <h1>Soundbites y Taglines Generados</h1>
          <p v-if="currentContent">Para: {{ currentContent.questions?.companyName || 'Tu empresa' }}</p>
        </div>
      </header>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Cargando soundbites y taglines...</p>
      </div>

      <!-- Content Results -->
      <div v-else-if="currentContent" class="results-content">
        <!-- Status Banner -->
        <StatusBanner 
          :is-content-complete="!!isContentComplete"
          :should-show-generate-button="!!shouldShowGenerateButton"
        />

        <!-- Generate Content Section -->
        <GenerateSection 
          v-if="shouldShowGenerateButton"
          :is-generating="isGenerating"
          @generate-content="generateContent"
        />

        <!-- Progress Indicator -->
        <ProgressIndicator 
          v-if="isContentComplete"
          @scroll-to-scripts="scrollToScripts"
        />

        <!-- Action Buttons -->
        <div v-if="isContentComplete" class="action-buttons">
          <button 
            @click="regenerateContent" 
            :disabled="isRegenerating"
            class="btn btn-secondary"
          >
            <span v-if="isRegenerating">
              <i class="fas fa-spinner fa-spin"></i>
              Regenerando...
            </span>
            <span v-else>
              <i class="fas fa-sync-alt"></i>
              Regenerar Soundbites y Taglines
            </span>
          </button>
          
          <button @click="editQuestions" class="btn btn-outline">
            <i class="fas fa-edit"></i>
            Editar Preguntas
          </button>
        </div>

        <!-- Soundbites Section -->
        <SoundbitesSection 
          v-if="isContentComplete"
          :soundbites="currentContent.soundbites || []"
          :has-soundbites="!!hasSoundbites"
          @copy-to-clipboard="copyToClipboard"
        />

        <!-- Taglines Section -->
        <TaglinesSection 
          v-if="isContentComplete"
          :taglines="currentContent.taglines || []"
          :has-taglines="!!hasTaglines"
          @copy-to-clipboard="copyToClipboard"
        />

        <!-- Scripts Hero Section -->
        <ScriptsHero 
          v-if="isContentComplete"
          :content-id="contentId"
          :has-soundbites="!!hasSoundbites"
          :has-taglines="!!hasTaglines"
          @scroll-to-scripts="scrollToScripts"
          @navigate-to-scripts="goToScripts"
        />
      </div>

      <!-- Error State -->
      <div v-else class="error-state">
        <div class="error-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h2>Contenido no encontrado</h2>
        <p>No se pudo cargar el contenido solicitado.</p>
        <button @click="goToDashboard" class="btn btn-primary">
          Volver al Dashboard
        </button>
      </div>
    </div>

    <!-- Generation Progress Overlay -->
    <GenerationProgress 
      :is-generating="isRegenerating"
      message="Regenerando soundbites y taglines..."
    />
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';

.results-container {
  min-height: 100vh;
  background: linear-gradient(135deg, $BAKANO-LIGHT 0%, lighten($BAKANO-LIGHT, 5%) 100%);
  padding: 2rem 0;

  @media (max-width: 768px) {
    padding: 1rem 0;
  }
}

.container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid lighten($BAKANO-PURPLE, 40%);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

.back-btn {
  background: $white;
  border: 1px solid lighten($BAKANO-PURPLE, 40%);
  color: $BAKANO-PURPLE;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: $BAKANO-PURPLE;
    color: $white;
    border-color: $BAKANO-PURPLE;
  }

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
}

.results-title {
  text-align: center;
  flex: 1;

  @media (max-width: 768px) {
    text-align: left;
  }

  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: $BAKANO-DARK;
    margin-bottom: 0.5rem;

    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
  }

  p {
    color: lighten($BAKANO-DARK, 30%);
    font-size: 1.125rem;
    margin: 0;

    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;

  .loading-spinner {
    width: 3rem;
    height: 3rem;
    border: 3px solid lighten($BAKANO-PURPLE, 40%);
    border-top: 3px solid $BAKANO-PURPLE;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  p {
    color: lighten($BAKANO-DARK, 30%);
    font-size: 1.125rem;
    margin: 0;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.results-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  font-size: 0.875rem;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    justify-content: center;
  }
}

.btn-primary {
  background: $BAKANO-PURPLE;
  color: $white;

  &:hover:not(:disabled) {
    background: darken($BAKANO-PURPLE, 10%);
  }
}

.btn-secondary {
  background: $BAKANO-PINK;
  color: $white;

  &:hover:not(:disabled) {
    background: darken($BAKANO-PINK, 10%);
  }
}

.btn-outline {
  background: transparent;
  color: $BAKANO-PURPLE;
  border: 1px solid $BAKANO-PURPLE;

  &:hover:not(:disabled) {
    background: $BAKANO-PURPLE;
    color: $white;
  }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;

  .error-icon {
    font-size: 4rem;
    color: $alert-error;
    margin-bottom: 1rem;
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: $BAKANO-DARK;
    margin-bottom: 0.5rem;
  }

  p {
    color: lighten($BAKANO-DARK, 30%);
    font-size: 1.125rem;
    margin-bottom: 2rem;
  }
}
</style>