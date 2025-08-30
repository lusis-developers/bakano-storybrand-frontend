<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useContentStore } from '@/stores/content.store'
import { useToast } from '@/composables/useToast'
import type { IContent, ISoundbite, ITagline } from '@/types/content.types'

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

// Cargar soundbites y taglines al montar
onMounted(async () => {
  try {
    isLoading.value = true

    // Si no tenemos los soundbites y taglines actuales, intentar cargarlos
    if (!currentContent.value || currentContent.value._id !== contentId.value) {
      // Aquí necesitaríamos una función para cargar soundbites y taglines por ID
      // Por ahora, verificamos si está en la lista de proyectos
      const existingContent = contentStore.contentProjects.find(p => p._id === contentId.value)
      if (existingContent) {
        contentStore.setCurrentContent(existingContent)
      } else {
        triggerToast('Soundbites y taglines no encontrados', 'error')
        router.push('/dashboard')
        return
      }
    }

  } catch (error: any) {
    console.error('Error al cargar soundbites y taglines:', error)
    triggerToast('Error al cargar los soundbites y taglines', 'error')
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
    triggerToast('Regenerando soundbites y taglines...', 'info')

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
  if (currentContent.value?.business) {
    router.push(`/content/wizard/${currentContent.value.business}`)
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
  const scriptsSection = document.querySelector('.scripts-hero-section')
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
        <div class="status-banner" :class="{
          'complete': isContentComplete,
          'incomplete': !isContentComplete && !shouldShowGenerateButton,
          'ready-to-generate': shouldShowGenerateButton
        }">
          <div class="status-icon">
            <i v-if="isContentComplete" class="fas fa-check-circle"></i>
            <i v-else-if="shouldShowGenerateButton" class="fas fa-rocket"></i>
            <i v-else class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="status-text">
            <h3>
              {{ isContentComplete ? 'Soundbites y Taglines Completos' :
                shouldShowGenerateButton ? '¡Listo para Generar!' :
                  'Soundbites y Taglines Incompletos' }}
            </h3>
            <p>
              {{ isContentComplete ? 'Tus soundbites y taglines están listos para usar' :
                shouldShowGenerateButton ? 'Tus preguntas están completas. ¡Genera tus soundbites y taglines StoryBrand ahora!' :
                  'Faltan soundbites y taglines por generar' }}
            </p>
          </div>
        </div>

        <!-- Generate Content Section (when ready) -->
        <div v-if="shouldShowGenerateButton" class="generate-section">
          <div class="generate-card">
            <div class="generate-header">
              <h2><i class="fas fa-bullseye"></i> Generar Soundbites y Taglines StoryBrand</h2>
              <p>Basado en las respuestas de tu negocio, nuestra IA creará:</p>
            </div>
            
            <div class="generate-features">
              <div class="feature-item">
                <span class="feature-icon"><i class="fas fa-comments"></i></span>
                <span class="feature-text">Soundbites únicos para tu marca</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon"><i class="fas fa-tags"></i></span>
                <span class="feature-text">Taglines memorables y efectivos</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon"><i class="fas fa-bolt"></i></span>
                <span class="feature-text">Soundbites y taglines optimizados para conversión</span>
              </div>
            </div>
            
            <button 
              @click="generateContent" 
              :disabled="isGenerating"
              class="btn btn-generate"
            >
              <span v-if="isGenerating">
                <i class="fas fa-spinner fa-spin"></i>
                Generando soundbites y taglines...
              </span>
              <span v-else>
                <i class="fas fa-magic"></i>
                Generar Soundbites y Taglines Ahora
              </span>
            </button>
          </div>
        </div>

        <!-- Progress Indicator -->
        <div v-if="isContentComplete" class="progress-indicator">
          <div class="progress-step completed">
            <div class="step-circle">
              <i class="fas fa-check"></i>
            </div>
            <div class="step-label">
              <h4>Soundbites y Taglines Generados</h4>
              <p>Soundbites y taglines listos</p>
            </div>
          </div>
          
          <div class="progress-connector"></div>
          
          <div class="progress-step current" @click="scrollToScripts" style="cursor: pointer;">
            <div class="step-circle">
              <i class="fas fa-file-alt"></i>
            </div>
            <div class="step-label">
              <h4>Crear Scripts</h4>
              <p>Siguiente paso recomendado</p>
            </div>
          </div>
          
          <div class="progress-connector disabled"></div>
          
          <div class="progress-step disabled">
            <div class="step-circle">
              <i class="fas fa-rocket"></i>
            </div>
            <div class="step-label">
              <h4>Lanzar Campañas</h4>
              <p>Usar scripts en marketing</p>
            </div>
          </div>
        </div>

        <!-- Action Buttons (when content exists) -->
        <div v-if="isContentComplete" class="action-buttons">
          <button 
            @click="regenerateContent" 
            :disabled="isRegenerating"
            class="btn btn-outline"
          >
            <span v-if="isRegenerating">Regenerando...</span>
            <span v-else><i class="fas fa-sync-alt"></i> Regenerar Soundbites y taglines</span>
          </button>
          
          <button @click="editQuestions" class="btn btn-outline">
            <i class="fas fa-edit"></i> Editar Preguntas
          </button>
        </div>

        <!-- Soundbites Section -->
        <section class="content-section">
          <div class="section-header">
            <h2><i class="fas fa-bullseye"></i> Soundbites</h2>
            <p>Frases clave que capturan la esencia de tu marca</p>
          </div>
          
          <div v-if="hasSoundbites" class="soundbites-grid">
            <div 
              v-for="(soundbite, index) in currentContent.soundbites" 
              :key="index"
              class="soundbite-card"
              :class="`category-${soundbite.category}`"
            >
              <div class="soundbite-category">{{ soundbite.category }}</div>
              <div class="soundbite-text">{{ soundbite.text }}</div>
              <div class="soundbite-actions">
                <button class="copy-btn" @click="copyToClipboard(soundbite.text)">
                  <i class="fas fa-copy"></i> Copiar
                </button>
              </div>
            </div>
          </div>
          
          <div v-else class="empty-content">
            <p>No hay soundbites generados aún</p>
          </div>
        </section>

        <!-- Taglines Section -->
        <section class="content-section">
          <div class="section-header">
            <h2><i class="fas fa-tags"></i> Taglines</h2>
            <p>Eslóganes memorables para tu marca</p>
          </div>
          
          <div v-if="hasTaglines" class="taglines-grid">
            <div 
              v-for="(tagline, index) in currentContent.taglines" 
              :key="index"
              class="tagline-card"
              :class="`style-${tagline.style}`"
            >
              <div class="tagline-style">{{ tagline.style }}</div>
              <div class="tagline-text">{{ tagline.text }}</div>
              <div class="tagline-actions">
                <button class="copy-btn" @click="copyToClipboard(tagline.text)">
                  <i class="fas fa-copy"></i> Copiar
                </button>
              </div>
            </div>
          </div>
          
          <div v-else class="empty-content">
            <p>No hay taglines generados aún</p>
          </div>
        </section>

        <!-- Scripts CTA Hero Section -->
        <section class="scripts-hero-section">
          <div class="scripts-hero-content">
            <div class="hero-badge">
              <i class="fas fa-magic"></i>
              <span>Siguiente Paso Recomendado</span>
            </div>
            
            <h2 class="hero-title">
              <i class="fas fa-file-alt"></i>
              ¡Convierte tus soundbites y taglines en Scripts poderosos!
            </h2>
            
            <p class="hero-description">
              Ahora que tienes tus <strong>soundbites</strong> y <strong>taglines</strong> listos, 
              es momento de crear scripts profesionales para tus campañas de marketing.
            </p>
            
            <div class="scripts-benefits">
              <div class="benefit-item">
                <div class="benefit-icon">
                  <i class="fas fa-bullhorn"></i>
                </div>
                <div class="benefit-text">
                  <h4>Scripts para Anuncios</h4>
                  <p>Facebook, Instagram, Google Ads</p>
                </div>
              </div>
              
              <div class="benefit-item">
                <div class="benefit-icon">
                  <i class="fas fa-video"></i>
                </div>
                <div class="benefit-text">
                  <h4>Soundbites y Taglines para Redes</h4>
                  <p>Posts, stories, videos promocionales</p>
                </div>
              </div>
              
              <div class="benefit-item">
                <div class="benefit-icon">
                  <i class="fas fa-envelope"></i>
                </div>
                <div class="benefit-text">
                  <h4>Email Marketing</h4>
                  <p>Secuencias de venta y nurturing</p>
                </div>
              </div>
            </div>
            
            <div class="hero-actions">
              <button @click="goToScripts" class="btn btn-scripts-primary">
                <i class="fas fa-rocket"></i>
                Crear Scripts Ahora
              </button>
              
              <div class="hero-note">
                <i class="fas fa-info-circle"></i>
                <span>Usa tus soundbites y taglines para generar scripts únicos</span>
              </div>
            </div>
          </div>
          
          <div class="scripts-preview">
            <div class="preview-card">
              <div class="preview-header">
                <i class="fas fa-file-alt"></i>
                <span>Vista previa del script</span>
              </div>
              <div class="preview-content">
                <p>"{{ currentContent?.soundbites?.[0]?.text || 'Tu soundbite principal' }}"</p>
                <p class="preview-cta">{{ currentContent?.taglines?.[0]?.text || 'Tu tagline memorable' }}</p>
              </div>
            </div>
          </div>
        </section>
        
        <!-- Additional Steps -->
        <section class="additional-steps">
          <h3><i class="fas fa-plus-circle"></i> Más opciones disponibles</h3>
          <div class="steps-grid">
            <div class="step-card secondary">
              <div class="step-icon"><i class="fas fa-chart-bar"></i></div>
              <h4>Analizar Rendimiento</h4>
              <p>Revisa qué soundbites y taglines funcionan mejor</p>
              <button class="btn btn-outline" disabled>
                Próximamente
              </button>
            </div>
            
            <div class="step-card secondary">
              <div class="step-icon"><i class="fas fa-palette"></i></div>
              <h4>Crear Variaciones</h4>
              <p>Genera versiones para distintas plataformas</p>
              <button class="btn btn-outline" disabled>
                Próximamente
              </button>
            </div>
          </div>
        </section>
      </div>

      <!-- Error State -->
      <div v-else class="error-state">
        <div class="error-icon"><i class="fas fa-times-circle"></i></div>
        <h3>Soundbites y taglines no encontrados</h3>
        <p>No se pudieron cargar los soundbites y taglines solicitados</p>
        <button @click="goToDashboard" class="btn btn-primary">
          Volver al Dashboard
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.results-container {
  min-height: 100vh;
  background: $BAKANO-LIGHT;
  padding: 2rem 0;

  @media (max-width: 768px) {
    padding: 1rem 0;
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;

  @media (max-width: 768px) {
    padding: 0 0.75rem;
  }
}

// Header
.results-header {
  margin-bottom: 2rem;

  .back-btn {
    background: none;
    border: none;
    color: #667eea;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 1rem;
    transition: color 0.2s ease;

    &:hover {
      color: #5a67d8;
    }
  }

  .results-title {
    h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.5rem;

      @media (max-width: 768px) {
        font-size: 1.5rem;
      }
    }

    p {
      color: #64748b;
      font-size: 1.125rem;

      @media (max-width: 768px) {
        font-size: 1rem;
      }
    }
  }
}

// Loading State
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;

  p {
    margin-top: 1rem;
    color: #64748b;
    font-size: 1.125rem;
  }
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

// Status Banner
.status-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;

  &.complete {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
  }

  &.incomplete {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white;
  }

  .status-icon {
    font-size: 2rem;
  }

  .status-text {
    h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    p {
      opacity: 0.9;
      margin: 0;
    }
  }
}

// Progress Indicator
.progress-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
  }
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;

  @media (max-width: 768px) {
    flex-direction: row;
    text-align: left;
    width: 100%;
  }

  &.completed {
    .step-circle {
      background: #10b981;
      color: white;
      border-color: #10b981;
    }

    .step-label h4 {
      color: #10b981;
    }
  }

  &.current {
    .step-circle {
      background: #667eea;
      color: white;
      border-color: #667eea;
      animation: pulse 2s infinite;
    }

    .step-label h4 {
      color: #667eea;
      font-weight: 700;
    }
  }

  &.disabled {
    opacity: 0.5;

    .step-circle {
      background: #f1f5f9;
      color: #94a3b8;
      border-color: #e2e8f0;
    }

    .step-label h4 {
      color: #94a3b8;
    }

    .step-label p {
      color: #cbd5e1;
    }
  }
}

.step-circle {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  border: 3px solid #e2e8f0;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    width: 3rem;
    height: 3rem;
    font-size: 1rem;
    margin-bottom: 0;
    margin-right: 1rem;
    flex-shrink: 0;
  }
}

.step-label {
  h4 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
    color: #64748b;
    transition: all 0.3s ease;
  }

  p {
    font-size: 0.875rem;
    color: #94a3b8;
    margin: 0;
  }
}

.progress-connector {
  width: 4rem;
  height: 2px;
  background: #10b981;
  margin: 0 1rem;

  @media (max-width: 768px) {
    width: 2px;
    height: 2rem;
    margin: 0;
    position: absolute;
    left: 1.5rem;
    top: 4rem;
  }

  &.disabled {
    background: #e2e8f0;
  }
}

@keyframes pulse {

  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4);
  }

  50% {
    box-shadow: 0 0 0 10px rgba(102, 126, 234, 0);
  }
}

// Action Buttons
.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 480px) {
    flex-direction: column;
  }
}

// Content Sections
.content-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid #e2e8f0;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }

  .section-header {
    margin-bottom: 1.5rem;

    h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.5rem;

      @media (max-width: 768px) {
        font-size: 1.25rem;
      }
    }

    p {
      color: #64748b;
      margin: 0;
    }
  }
}

// Soundbites
.soundbites-grid {
  display: grid;
  gap: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

.soundbite-card {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: #667eea;
    transform: translateY(-2px);
  }

  &.category-primary {
    border-left: 4px solid #667eea;
  }

  &.category-secondary {
    border-left: 4px solid #10b981;
  }

  &.category-supporting {
    border-left: 4px solid #f59e0b;
  }

  .soundbite-category {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    color: #64748b;
    margin-bottom: 0.5rem;
  }

  .soundbite-text {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;
    line-height: 1.5;
    margin-bottom: 1rem;
  }

  .soundbite-actions {
    display: flex;
    justify-content: flex-end;
  }
}

// Taglines
.taglines-grid {
  display: grid;
  gap: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

.tagline-card {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  text-align: center;

  &:hover {
    border-color: #667eea;
    transform: translateY(-2px);
  }

  &.style-catchy {
    border-left: 4px solid #ec4899;
  }

  &.style-professional {
    border-left: 4px solid #3b82f6;
  }

  &.style-emotional {
    border-left: 4px solid #ef4444;
  }

  .tagline-style {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    color: #64748b;
    margin-bottom: 0.5rem;
  }

  .tagline-text {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 1rem;
  }

  .tagline-actions {
    display: flex;
    justify-content: center;
  }
}

// Copy Button
.copy-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #5a67d8;
    transform: translateY(-1px);
  }
}

// Scripts Hero Section
.scripts-hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 3rem;
  margin-bottom: 2rem;
  color: white;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
    pointer-events: none;
  }
}

.scripts-hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    padding: 0.5rem 1rem;
    border-radius: 50px;
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 1.5rem;

    i {
      color: #fbbf24;
    }
  }

  .hero-title {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 1rem;
    line-height: 1.2;

    @media (max-width: 768px) {
      font-size: 2rem;
    }

    @media (max-width: 480px) {
      font-size: 1.75rem;
    }

    i {
      color: #fbbf24;
      margin-right: 0.5rem;
    }
  }

  .hero-description {
    font-size: 1.25rem;
    line-height: 1.6;
    margin-bottom: 2rem;
    opacity: 0.95;

    @media (max-width: 768px) {
      font-size: 1.125rem;
    }

    strong {
      color: #fbbf24;
      font-weight: 700;
    }
  }
}

.scripts-benefits {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2.5rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }

  .benefit-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;

    .benefit-icon {
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      width: 3rem;
      height: 3rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      i {
        font-size: 1.25rem;
        color: #fbbf24;
      }
    }

    .benefit-text {
      h4 {
        font-size: 1.125rem;
        font-weight: 700;
        margin-bottom: 0.25rem;
        color: white;
      }

      p {
        font-size: 0.875rem;
        opacity: 0.8;
        margin: 0;
      }
    }
  }
}

.hero-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;

  .btn-scripts-primary {
    background: #fbbf24;
    color: #1e293b;
    border: none;
    padding: 1rem 2rem;
    border-radius: 12px;
    font-size: 1.125rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
      background: #f59e0b;
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(251, 191, 36, 0.3);
    }

    i {
      font-size: 1rem;
    }
  }

  .hero-note {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    opacity: 0.8;

    i {
      color: #fbbf24;
    }
  }
}

.scripts-preview {
  position: absolute;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  width: 300px;

  @media (max-width: 1024px) {
    display: none;
  }

  .preview-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    padding: 1.5rem;

    .preview-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 1rem;
      opacity: 0.8;

      i {
        color: #fbbf24;
      }
    }

    .preview-content {
      p {
        font-size: 0.875rem;
        line-height: 1.5;
        margin-bottom: 0.75rem;
        opacity: 0.9;

        &.preview-cta {
          font-weight: 700;
          color: #fbbf24;
          margin-bottom: 0;
        }
      }
    }
  }
}

// Additional Steps
.additional-steps {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid #e2e8f0;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 1.5rem;
    text-align: center;

    @media (max-width: 768px) {
      font-size: 1.125rem;
    }

    i {
      color: #667eea;
      margin-right: 0.5rem;
    }
  }
}

.steps-grid {
  display: grid;
  gap: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.step-card {
  text-align: center;
  padding: 1.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #667eea;
  }

  &.secondary {
    background: #fafafa;
    border-color: #e5e7eb;

    &:hover {
      border-color: #9ca3af;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(156, 163, 175, 0.1);
    }

    .step-icon {
      color: #9ca3af;
    }

    h4 {
      color: #6b7280;
    }

    p {
      color: #9ca3af;
    }
  }

  .step-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  h3,
  h4 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }

  p {
    color: #64748b;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }
}

// Generate Content Section
.generate-section {
  margin: 2rem 0;
}

.generate-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  color: white;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }

  .generate-header {
    margin-bottom: 2rem;

    h2 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: white;

      @media (max-width: 768px) {
        font-size: 1.5rem;
      }
    }

    p {
      font-size: 1.125rem;
      opacity: 0.9;
      margin: 0;
    }
  }

  .generate-features {
    display: grid;
    gap: 1rem;
    margin-bottom: 2.5rem;

    @media (min-width: 768px) {
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
    }

    .feature-item {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      backdrop-filter: blur(10px);

      @media (max-width: 768px) {
        justify-content: flex-start;
      }

      .feature-icon {
        font-size: 1.5rem;
        flex-shrink: 0;
      }

      .feature-text {
        font-weight: 600;
        font-size: 0.95rem;
      }
    }
  }

  .btn-generate {
    background: white;
    color: #667eea;
    border: none;
    padding: 1rem 2.5rem;
    border-radius: 50px;
    font-size: 1.125rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    i {
      font-size: 1rem;
    }
  }
}

// Status Banner Updates
.status-banner {
  &.ready-to-generate {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border-color: #10b981;
    color: white;

    .status-text h3,
    .status-text p {
      color: white;
    }
  }
}

// Empty Content
.empty-content {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}

// Error State
.error-state {
  text-align: center;
  padding: 4rem 2rem;

  .error-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }

  p {
    color: #64748b;
    margin-bottom: 2rem;
  }
}

// Buttons
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    padding: 0.625rem 1.25rem;
    font-size: 0.75rem;
  }
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 1px solid #667eea;

  &:hover:not(:disabled) {
    background: #667eea;
    color: white;
  }
}

.btn-secondary {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
  }
}
</style>