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

// Cargar contenido al montar
onMounted(async () => {
  try {
    isLoading.value = true
    
    // Si no tenemos el contenido actual, intentar cargarlo
    if (!currentContent.value || currentContent.value._id !== contentId.value) {
      // Aquí necesitaríamos una función para cargar contenido por ID
      // Por ahora, verificamos si está en la lista de proyectos
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
 * Generar contenido por primera vez
 */
const generateContent = async () => {
  try {
    isGenerating.value = true
    triggerToast('Generando contenido con IA...', 'info')
    
    await contentStore.generateSoundbitesAndTaglines(contentId.value, false)
    
    triggerToast('¡Contenido generado exitosamente!', 'success')
  } catch (error: any) {
    console.error('Error al generar contenido:', error)
    triggerToast('Error al generar contenido', 'error')
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
    triggerToast('Regenerando contenido...', 'info')
    
    await contentStore.generateSoundbitesAndTaglines(contentId.value, true)
    
    triggerToast('Contenido regenerado exitosamente', 'success')
  } catch (error: any) {
    console.error('Error al regenerar contenido:', error)
    triggerToast('Error al regenerar contenido', 'error')
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
          <h1>Contenido Generado</h1>
          <p v-if="currentContent">Para: {{ currentContent.questions?.companyName || 'Tu empresa' }}</p>
        </div>
      </header>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Cargando contenido...</p>
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
            {{ isContentComplete ? '✅' : shouldShowGenerateButton ? '🚀' : '⚠️' }}
          </div>
          <div class="status-text">
            <h3>
              {{ isContentComplete ? 'Contenido Completo' : 
                 shouldShowGenerateButton ? '¡Listo para Generar!' : 
                 'Contenido Incompleto' }}
            </h3>
            <p>
              {{ isContentComplete ? 'Tu contenido está listo para usar' : 
                 shouldShowGenerateButton ? 'Tus preguntas están completas. ¡Genera tu contenido StoryBrand ahora!' : 
                 'Faltan elementos por generar' }}
            </p>
          </div>
        </div>

        <!-- Generate Content Section (when ready) -->
        <div v-if="shouldShowGenerateButton" class="generate-section">
          <div class="generate-card">
            <div class="generate-header">
              <h2>🎯 Generar Contenido StoryBrand</h2>
              <p>Basado en las respuestas de tu negocio, nuestra IA creará:</p>
            </div>
            
            <div class="generate-features">
              <div class="feature-item">
                <span class="feature-icon">💬</span>
                <span class="feature-text">Soundbites únicos para tu marca</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🏷️</span>
                <span class="feature-text">Taglines memorables y efectivos</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">⚡</span>
                <span class="feature-text">Contenido optimizado para conversión</span>
              </div>
            </div>
            
            <button 
              @click="generateContent" 
              :disabled="isGenerating"
              class="btn btn-generate"
            >
              <span v-if="isGenerating">
                <i class="fas fa-spinner fa-spin"></i>
                Generando contenido...
              </span>
              <span v-else>
                <i class="fas fa-magic"></i>
                Generar Contenido Ahora
              </span>
            </button>
          </div>
        </div>

        <!-- Action Buttons (when content exists) -->
        <div v-if="isContentComplete" class="action-buttons">
          <button 
            @click="regenerateContent" 
            :disabled="isRegenerating"
            class="btn btn-primary"
          >
            <span v-if="isRegenerating">Regenerando...</span>
            <span v-else>🔄 Regenerar Contenido</span>
          </button>
          
          <button @click="editQuestions" class="btn btn-outline">
            ✏️ Editar Preguntas
          </button>
        </div>

        <!-- Soundbites Section -->
        <section class="content-section">
          <div class="section-header">
            <h2>🎯 Soundbites</h2>
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
                  📋 Copiar
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
            <h2>🏷️ Taglines</h2>
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
                  📋 Copiar
                </button>
              </div>
            </div>
          </div>
          
          <div v-else class="empty-content">
            <p>No hay taglines generados aún</p>
          </div>
        </section>

        <!-- Next Steps -->
        <section class="next-steps">
          <h2>🚀 Próximos Pasos</h2>
          <div class="steps-grid">
            <div class="step-card">
              <div class="step-icon">📝</div>
              <h3>Generar Scripts</h3>
              <p>Crea scripts para contenido y anuncios usando tus soundbites y taglines</p>
              <button class="btn btn-outline" disabled>
                Próximamente
              </button>
            </div>
            
            <div class="step-card">
              <div class="step-icon">📊</div>
              <h3>Analizar Rendimiento</h3>
              <p>Revisa qué contenido funciona mejor con tu audiencia</p>
              <button class="btn btn-outline" disabled>
                Próximamente
              </button>
            </div>
            
            <div class="step-card">
              <div class="step-icon">🎨</div>
              <h3>Crear Variaciones</h3>
              <p>Genera diferentes versiones para distintas plataformas</p>
              <button class="btn btn-outline" disabled>
                Próximamente
              </button>
            </div>
          </div>
        </section>
      </div>

      <!-- Error State -->
      <div v-else class="error-state">
        <div class="error-icon">❌</div>
        <h3>Contenido no encontrado</h3>
        <p>No se pudo cargar el contenido solicitado</p>
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

// Action Buttons
.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;

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

// Next Steps
.next-steps {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid #e2e8f0;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 1.5rem;
    text-align: center;

    @media (max-width: 768px) {
      font-size: 1.25rem;
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

  .step-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  h3 {
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
</style>