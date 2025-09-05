<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBusinessStore } from '@/stores/business.store'
import { useContentStore } from '@/stores/content.store'
import { useToast } from '@/composables/useToast'
import { useWizard } from '@/composables/useWizard'
import WizardHeader from '@/components/content/WizardHeader.vue'
import WizardProgress from '@/components/content/WizardProgress.vue'
import WizardStepContent from '@/components/content/WizardStepContent.vue'
import WizardResults from '@/components/content/WizardResults.vue'
import type { IBusiness } from '@/types/business.types'

// Composables
const route = useRoute()
const router = useRouter()
const businessStore = useBusinessStore()
const contentStore = useContentStore()
const { triggerToast } = useToast()

// Usar el composable del wizard
const {
  // Estado
  currentStep,
  businessId,
  questions,
  prefilledFields,
  isSubmitting,
  generatedContent,
  wizardSteps,

  // Computed
  currentStepData,
  progressPercentage,
  canProceed,
  isFirstStep,
  isLastStep,

  // Métodos
  nextStep,
  prevStep,
  goToStep,
  submitWizard,
  getButtonText,
  prefillBusinessData,
  prefillContentData
} = useWizard()

// Estado local
const isGenerating = ref(false)
const error = ref<string | null>(null)

// Función para manejar la navegación de regreso
function handleBackToDashboard() {
  router.push('/')
}

// Función para ir a los resultados completos
function handleGoToResults() {
  if (businessId.value) {
    router.push(`/content/results/${businessId.value}`)
  }
}

// Función para regenerar contenido
function handleRegenerate() {
  submitWizard()
}

// Función para manejar el envío del wizard
function handleSubmitWizard() {
  isGenerating.value = true
  error.value = null

  submitWizard()
    .then(() => {
      triggerToast('¡Contenido generado exitosamente!', 'success')
    })
    .catch((err) => {
      error.value = err.message || 'Error al generar contenido'
      triggerToast('Error al generar contenido', 'error')
    })
    .finally(() => {
      isGenerating.value = false
    })
}

// Función para cargar contenido existente para edición
async function loadContentData() {
  const contentId = route.query.contentId as string
  
  if (!contentId) return false

  try {
    console.log('🔍 Buscando contenido para editar:', contentId)
    
    // Cargar proyectos de contenido si no están en el store
    if (!contentStore.hasContentProjects) {
      await contentStore.fetchUserContentProjects()
    }

    // Buscar el contenido por ID
    const existingContent = contentStore.contentProjects.find(p => p._id === contentId)
    
    if (existingContent) {
      console.log('✅ Contenido encontrado para edición:', existingContent)
      
      // Prellenar datos del contenido
      prefillContentData(existingContent)
      
      triggerToast(
        'Datos del proyecto cargados para edición',
        'success'
      )
      
      return true
    } else {
      console.warn('⚠️ Contenido no encontrado:', contentId)
      triggerToast('Proyecto no encontrado', 'error')
      router.push('/dashboard')
      return false
    }
  } catch (err) {
    console.error('Error loading content data:', err)
    triggerToast('Error al cargar el proyecto', 'error')
    return false
  }
}

// Función para cargar y prellenar datos del negocio
async function loadBusinessData() {
  if (!businessId.value) return

  try {
    // Cargar negocios si no están en el store
    if (!businessStore.hasBusinesses) {
      await businessStore.fetchBusinesses()
    }

    // Buscar el negocio por ID
    let business: IBusiness | undefined = businessStore.businesses.find(
      (b: IBusiness) => b.id === businessId.value || b._id === businessId.value
    )

    // Si no se encuentra por ID pero hay negocios disponibles, usar el primero
    if (!business && businessStore.hasBusinesses) {
      business = businessStore.businesses[0]
    }

    if (business) {
      // Prellenar datos del negocio
      const prefilledCount = prefillBusinessData(business)

      if (prefilledCount > 0) {
        triggerToast(
          `Se han prellenado ${prefilledCount} campos con información de tu negocio`,
          'success'
        )
      }
    }
  } catch (err) {
    console.error('Error loading business data:', err)
  }
}

// Preparar resultados para el componente WizardResults
const wizardResults = computed(() => {
  if (!generatedContent.value) return null

  return {
    soundbites: generatedContent.value.soundbites?.map((s: any) => s.text || s.content) || [],
    taglines: generatedContent.value.taglines?.map((t: any) => t.text || t.content) || [],
    scripts: []
  }
})

// Inicialización
onMounted(async () => {
  // Primero intentar cargar contenido existente para edición
  const contentLoaded = await loadContentData()
  
  // Si no hay contenido para editar, cargar datos del negocio
  if (!contentLoaded) {
    await loadBusinessData()
  }
})
</script>

<template>
  <div class="content-wizard-view">
    <!-- Header del Wizard -->
    <WizardHeader 
      title="Asistente de Contenido StoryBrand"
      @back-to-dashboard="handleBackToDashboard"
    />
    
    <!-- Progreso del Wizard -->
    <WizardProgress 
      :current-step="currentStep"
      :progress-percentage="progressPercentage"
      :wizard-steps="wizardSteps"
      @go-to-step="goToStep"
    />
    
    <!-- Contenido del Paso Actual -->
    <WizardStepContent 
      v-if="currentStep <= wizardSteps.length"
      :current-step-data="currentStepData"
      :questions="questions"
      :prefilled-fields="prefilledFields"
      :is-first-step="isFirstStep"
      :is-last-step="isLastStep"
      :can-proceed="canProceed"
      :is-submitting="isSubmitting || isGenerating"
      :get-button-text="getButtonText"
      @update:questions="(newQuestions) => questions = newQuestions"
      @prev-step="prevStep"
      @next-step="nextStep"
      @submit-wizard="handleSubmitWizard"
    />
    
    <!-- Resultados del Wizard -->
    <WizardResults 
      v-else
      :results="wizardResults"
      :is-generating="isGenerating"
      :error="error"
      @regenerate="handleRegenerate"
      @go-to-results="handleGoToResults"
    />
  </div>
</template>

<style lang="scss" scoped>
.content-wizard-view {
  min-height: 100vh;
  background: linear-gradient(135deg, $BAKANO-LIGHT 0%, lighten($BAKANO-LIGHT, 3%) 100%);
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }

  // Contenedor principal con máximo ancho
  max-width: 1200px;
  margin: 0 auto;

  // Espaciado entre componentes
  >*+* {
    margin-top: 2rem;

    @media (max-width: 768px) {
      margin-top: 1.5rem;
    }
  }
}
</style>