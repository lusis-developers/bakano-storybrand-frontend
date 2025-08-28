<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useContent } from '@/composables/useContent'
import { useToast } from '@/composables/useToast'
import { useBusinessStore } from '@/stores/business.store'
import type { IBusinessQuestions } from '@/types/content.types'

// Composables
const router = useRouter()
const route = useRoute()
const { createContentProject, updateQuestions, generateContent, isLoading } = useContent()
const { triggerToast } = useToast()
const businessStore = useBusinessStore()

// Estado local
const currentStep = ref(1)
const isSubmitting = ref(false)
const businessId = ref(route.params.businessId as string)

// Formulario de preguntas
const questions = ref<IBusinessQuestions>({
  companyName: '',
  productsServices: '',
  targetAudience: '',
  mainProblem: '',
  solution: '',
  uniqueCharacteristics: '',
  authority: '',
  steps: ''
})

// Configuración de pasos del wizard
const wizardSteps = [
  {
    id: 1,
    title: 'Información Básica',
    description: 'Cuéntanos sobre tu empresa',
    fields: ['companyName', 'productsServices']
  },
  {
    id: 2,
    title: 'Audiencia Objetivo',
    description: 'Define a quién te diriges',
    fields: ['targetAudience']
  },
  {
    id: 3,
    title: 'Problema Principal',
    description: 'Identifica el problema que resuelves',
    fields: ['mainProblem']
  },
  {
    id: 4,
    title: 'Tu Solución',
    description: 'Explica cómo resuelves el problema',
    fields: ['solution']
  },
  {
    id: 5,
    title: 'Características Únicas',
    description: 'Qué te hace diferente',
    fields: ['uniqueCharacteristics']
  },
  {
    id: 6,
    title: 'Autoridad y Credibilidad',
    description: 'Por qué deberían confiar en ti',
    fields: ['authority']
  },
  {
    id: 7,
    title: 'Pasos del Proceso',
    description: 'Cómo trabajas con tus clientes',
    fields: ['steps']
  }
]

// Computed
const currentStepData = computed(() => {
  return wizardSteps.find(step => step.id === currentStep.value)
})

const isFirstStep = computed(() => currentStep.value === 1)
const isLastStep = computed(() => currentStep.value === wizardSteps.length)
const canProceed = computed(() => {
  if (!currentStepData.value) return false
  return currentStepData.value.fields.every(field => {
    const value = questions.value[field as keyof IBusinessQuestions]
    return value && value.trim().length > 0
  })
})

const progressPercentage = computed(() => {
  return (currentStep.value / wizardSteps.length) * 100
})

// Métodos
function nextStep() {
  if (canProceed.value && !isLastStep.value) {
    currentStep.value++
  }
}

function prevStep() {
  if (!isFirstStep.value) {
    currentStep.value--
  }
}

function goToStep(stepNumber: number) {
  if (stepNumber >= 1 && stepNumber <= wizardSteps.length) {
    currentStep.value = stepNumber
  }
}

// Estados para el contenido generado
const generatedContent = ref<{
  soundbites: any[]
  taglines: any[]
} | null>(null)
const isGenerating = ref(false)
const generationStep = ref('')
const showResults = ref(false)
const currentContentId = ref<string | null>(null)

async function submitWizard() {
  try {
    isSubmitting.value = true
    showResults.value = false
    generatedContent.value = null
    
    console.log('🚀 Iniciando creación de proyecto con datos:', {
      businessId: businessId.value,
      questions: questions.value
    })
    
    // Crear proyecto de contenido
    generationStep.value = 'Creando proyecto...'
    const content = await createContentProject(businessId.value, {
      questions: questions.value,
      tone: 'professional',
      aiProvider: 'gemini'
    })
    
    console.log('✅ Respuesta del createContentProject:', content)
    
    if (content && content._id) {
      currentContentId.value = content._id
      triggerToast('Proyecto creado exitosamente', 'success')
      
      // Generar automáticamente soundbites y taglines
      try {
        isGenerating.value = true
        generationStep.value = 'Generando soundbites y taglines con IA...'
        
        const result = await generateContent(content._id, false)
        
        if (result) {
          generatedContent.value = {
            soundbites: result.soundbites || [],
            taglines: result.taglines || []
          }
          showResults.value = true
          triggerToast('¡Contenido generado exitosamente!', 'success')
        }
        
      } catch (error) {
        console.error('Error al generar contenido:', error)
        triggerToast('Error al generar contenido automático', 'error')
        // Navegar a resultados aunque falle la generación
        router.push(`/content/results/${content._id}`)
      } finally {
        isGenerating.value = false
      }
    } else {
      console.error('❌ No se recibió contenido válido:', content)
      triggerToast('Error: No se pudo crear el proyecto', 'error')
    }
    
  } catch (error: any) {
    console.error('❌ Error al crear proyecto:', error)
    console.error('❌ Error details:', {
      message: error.message,
      status: error.status,
      response: error.response,
      stack: error.stack
    })
    
    // Mejorar el mensaje de error basado en el tipo de error
    let errorMessage = 'Error al crear el proyecto'
    if (error.status === 401) {
      errorMessage = 'No tienes autorización para realizar esta acción'
    } else if (error.status === 400) {
      errorMessage = error.message || 'Datos inválidos para crear el proyecto'
    } else if (error.status >= 500) {
      errorMessage = 'Error del servidor. Intenta nuevamente'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    triggerToast(errorMessage, 'error')
  } finally {
    isSubmitting.value = false
  }
}

function goToResults() {
  if (generatedContent.value) {
    // Navegar a la página de resultados
    router.push(`/content/results/${businessId.value}`)
  }
}

async function regenerateContent() {
  if (!currentContentId.value) {
    triggerToast('No hay contenido para regenerar', 'error')
    return
  }

  try {
    isGenerating.value = true
    generationStep.value = 'Regenerando contenido con IA...'
    
    const result = await generateContent(currentContentId.value, true)
    
    if (result) {
      generatedContent.value = {
        soundbites: result.soundbites || [],
        taglines: result.taglines || []
      }
      triggerToast('¡Contenido regenerado exitosamente!', 'success')
    }
  } catch (error) {
    console.error('Error al regenerar contenido:', error)
    triggerToast('Error al regenerar contenido', 'error')
  } finally {
    isGenerating.value = false
  }
}

function getButtonText() {
  if (isGenerating.value) {
    return generationStep.value || 'Generando contenido...'
  }
  if (isSubmitting.value) {
    return 'Creando proyecto...'
  }
  return 'Crear Proyecto StoryBrand'
}

// Lifecycle
onMounted(async () => {
  // Verificar que el businessId existe
  if (!businessId.value) {
    triggerToast('ID de negocio requerido', 'error')
    router.push('/dashboard')
    return
  }
  
  // Cargar información del negocio si está disponible
  if (businessStore.businesses.length === 0) {
    await businessStore.fetchBusinesses()
  }
  
  const business = businessStore.businesses.find(b => b.id === businessId.value)
  if (business) {
    questions.value.companyName = business.name
    questions.value.productsServices = business.description || ''
  }
})
</script>

<template>
  <div class="wizard-container">
    <div class="container">
      <!-- Header -->
      <header class="wizard-header">
        <button @click="router.push('/dashboard')" class="back-btn">
          ← Volver al Dashboard
        </button>
        
        <div class="wizard-title">
          <h1>Crear Contenido</h1>
          <p>Completa la información paso a paso para generar contenido personalizado</p>
        </div>
      </header>
 
      <div class="progress-section">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
        <div class="step-indicators">
          <div 
            v-for="step in wizardSteps" 
            :key="step.id"
            class="step-indicator"
            :class="{
              'active': step.id === currentStep,
              'completed': step.id < currentStep
            }"
            @click="goToStep(step.id)"
          >
            <span class="step-number">{{ step.id }}</span>
            <span class="step-title">{{ step.title }}</span>
          </div>
        </div>
      </div>

      <!-- Wizard Content -->
      <div class="wizard-content">
        <div class="step-card">
          <div class="step-header">
            <h2>{{ currentStepData?.title }}</h2>
            <p>{{ currentStepData?.description }}</p>
          </div>

          <div class="step-form">
            <!-- Paso 1: Información Básica -->
            <div v-if="currentStep === 1" class="form-fields">
              <div class="field-group">
                <label for="companyName">Nombre de la empresa *</label>
                <input 
                  id="companyName"
                  v-model="questions.companyName" 
                  type="text" 
                  placeholder="Ej: TechSolutions Inc."
                  class="form-input"
                />
              </div>
              
              <div class="field-group">
                <label for="productsServices">Productos o servicios *</label>
                <textarea 
                  id="productsServices"
                  v-model="questions.productsServices" 
                  placeholder="Describe los productos o servicios que ofreces..."
                  class="form-textarea"
                  rows="4"
                ></textarea>
              </div>
            </div>

            <!-- Paso 2: Audiencia Objetivo -->
            <div v-if="currentStep === 2" class="form-fields">
              <div class="field-group">
                <label for="targetAudience">Audiencia objetivo *</label>
                <textarea 
                  id="targetAudience"
                  v-model="questions.targetAudience" 
                  placeholder="Describe a tu cliente ideal: edad, profesión, intereses, problemas que enfrentan..."
                  class="form-textarea"
                  rows="5"
                ></textarea>
                <small class="field-hint">
                  Sé específico: "Empresarios de 30-45 años que luchan con la gestión del tiempo"
                </small>
              </div>
            </div>

            <!-- Paso 3: Problema Principal -->
            <div v-if="currentStep === 3" class="form-fields">
              <div class="field-group">
                <label for="mainProblem">Problema principal *</label>
                <textarea 
                  id="mainProblem"
                  v-model="questions.mainProblem" 
                  placeholder="¿Cuál es el problema más grande que enfrentan tus clientes?"
                  class="form-textarea"
                  rows="4"
                ></textarea>
                <small class="field-hint">
                  Piensa en el dolor o frustración que experimentan antes de encontrarte
                </small>
              </div>
            </div>

            <!-- Paso 4: Tu Solución -->
            <div v-if="currentStep === 4" class="form-fields">
              <div class="field-group">
                <label for="solution">Tu solución *</label>
                <textarea 
                  id="solution"
                  v-model="questions.solution" 
                  placeholder="¿Cómo resuelves el problema de tus clientes?"
                  class="form-textarea"
                  rows="4"
                ></textarea>
                <small class="field-hint">
                  Enfócate en los beneficios y resultados que obtendrán
                </small>
              </div>
            </div>

            <!-- Paso 5: Características Únicas -->
            <div v-if="currentStep === 5" class="form-fields">
              <div class="field-group">
                <label for="uniqueCharacteristics">Características únicas *</label>
                <textarea 
                  id="uniqueCharacteristics"
                  v-model="questions.uniqueCharacteristics" 
                  placeholder="¿Qué te hace diferente de la competencia?"
                  class="form-textarea"
                  rows="4"
                ></textarea>
                <small class="field-hint">
                  Menciona tu propuesta de valor única, metodología especial, experiencia, etc.
                </small>
              </div>
            </div>

            <!-- Paso 6: Autoridad y Credibilidad -->
            <div v-if="currentStep === 6" class="form-fields">
              <div class="field-group">
                <label for="authority">Autoridad y credibilidad *</label>
                <textarea 
                  id="authority"
                  v-model="questions.authority" 
                  placeholder="¿Por qué deberían confiar en ti?"
                  class="form-textarea"
                  rows="4"
                ></textarea>
                <small class="field-hint">
                  Incluye experiencia, certificaciones, testimonios, casos de éxito, etc.
                </small>
              </div>
            </div>

            <!-- Paso 7: Pasos del Proceso -->
            <div v-if="currentStep === 7" class="form-fields">
              <div class="field-group">
                <label for="steps">Pasos del proceso *</label>
                <textarea 
                  id="steps"
                  v-model="questions.steps" 
                  placeholder="¿Cuáles son los pasos que sigues para ayudar a tus clientes?"
                  class="form-textarea"
                  rows="5"
                ></textarea>
                <small class="field-hint">
                  Ej: "1. Consulta inicial, 2. Análisis detallado, 3. Implementación, 4. Seguimiento"
                </small>
              </div>
            </div>
          </div>

          <!-- Navigation -->
          <div class="step-navigation">
            <button 
              v-if="!isFirstStep" 
              @click="prevStep" 
              class="btn btn-outline"
            >
              ← Anterior
            </button>
            
            <div class="nav-spacer"></div>
            
            <button 
              v-if="!isLastStep" 
              @click="nextStep" 
              :disabled="!canProceed"
              class="btn btn-primary"
            >
              Siguiente →
            </button>
            
            <button 
              v-if="isLastStep" 
              @click="submitWizard" 
              :disabled="!canProceed || isSubmitting || isGenerating"
              class="btn btn-primary"
            >
              <span v-if="isSubmitting || isGenerating">{{ generationStep || 'Generando contenido...' }}</span>
              <span v-else>Generar Contenido</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isGenerating" class="generation-loading">
        <div class="loading-container">
          <div class="loading-spinner">
            <div class="spinner"></div>
          </div>
          <h3>{{ generationStep }}</h3>
          <p>Esto puede tomar unos momentos mientras nuestra IA analiza tu negocio...</p>
          <div class="loading-progress">
            <div class="progress-bar"></div>
          </div>
        </div>
      </div>

      <!-- Results Display -->
      <div v-if="showResults && generatedContent" class="results-section">
        <div class="results-header">
          <h2><i class="fas fa-check-circle"></i> ¡Contenido Generado Exitosamente!</h2>
          <p>Tu contenido StoryBrand ha sido creado. Revisa los resultados a continuación:</p>
        </div>

        <!-- Soundbites Section -->
        <div class="content-section" v-if="generatedContent.soundbites?.length">
          <h3><i class="fas fa-quote-left"></i> Soundbites Generados</h3>
          <div class="content-grid">
            <div 
              v-for="(soundbite, index) in generatedContent.soundbites" 
              :key="index"
              class="content-card soundbite-card"
            >
              <div class="card-header">
                <span class="card-type">{{ soundbite.type || 'Soundbite' }}</span>
                <span class="card-number">#{{ index + 1 }}</span>
              </div>
              <div class="card-content">
                <p>{{ soundbite.content || soundbite.text }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Taglines Section -->
        <div class="content-section" v-if="generatedContent.taglines?.length">
          <h3><i class="fas fa-tag"></i> Taglines Generados</h3>
          <div class="content-grid">
            <div 
              v-for="(tagline, index) in generatedContent.taglines" 
              :key="index"
              class="content-card tagline-card"
            >
              <div class="card-header">
                <span class="card-type">{{ tagline.type || 'Tagline' }}</span>
                <span class="card-number">#{{ index + 1 }}</span>
              </div>
              <div class="card-content">
                <p>{{ tagline.content || tagline.text }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="results-actions">
          <button 
            @click="goToResults" 
            class="btn btn-primary"
          >
            <i class="fas fa-eye"></i>
            Ver Resultados Completos
          </button>
          <button 
            @click="regenerateContent" 
            class="btn btn-secondary"
            :disabled="isGenerating"
          >
            <i class="fas fa-redo"></i>
            Regenerar Contenido
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wizard-container {
  min-height: 100vh;
  background: $BAKANO-LIGHT;
  padding: 2rem 0;
  overflow-x: hidden;
  width: 100%;

  @media (max-width: 768px) {
    padding: 1rem 0;
  }
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 0 0.75rem;
  }

  @media (max-width: 480px) {
    padding: 0 0.5rem;
  }
}

// Header
.wizard-header {
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

  .wizard-title {
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

// Progress
.progress-section {
  margin-bottom: 2rem;

  .progress-bar {
    width: 100%;
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 1rem;

    .progress-fill {
      height: 100%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      transition: width 0.3s ease;
    }
  }

  .step-indicators {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    flex-wrap: wrap;
    padding-bottom: 0.5rem;

    @media (max-width: 768px) {
      gap: 0.25rem;
      justify-content: center;
    }
  }

  .step-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 1;
    max-width: 120px;
    min-width: 80px;

    @media (max-width: 768px) {
      min-width: 60px;
      max-width: 90px;
    }

    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #e2e8f0;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
      transition: all 0.2s ease;

      @media (max-width: 768px) {
        width: 28px;
        height: 28px;
        font-size: 0.75rem;
      }
    }

    .step-title {
      font-size: 0.75rem;
      color: #64748b;
      text-align: center;
      line-height: 1.2;

      @media (max-width: 768px) {
        font-size: 0.625rem;
      }
    }

    &.active {
      .step-number {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
      }

      .step-title {
        color: #667eea;
        font-weight: 600;
      }
    }

    &.completed {
      .step-number {
        background: #10b981;
        color: white;
      }

      .step-title {
        color: #10b981;
      }
    }
  }
}

// Content
.wizard-content {
  .step-card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

    @media (max-width: 768px) {
      padding: 1.5rem;
      border-radius: 12px;
    }
  }

  .step-header {
    text-align: center;
    margin-bottom: 2rem;

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
      font-size: 1rem;
    }
  }

  .step-form {
    margin-bottom: 2rem;

    .form-fields {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      label {
        font-weight: 600;
        color: #374151;
        font-size: 0.875rem;
      }

      .form-input,
      .form-textarea {
        padding: 0.75rem;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.2s ease;
        resize: vertical;

        &:focus {
          outline: none;
          border-color: #667eea;
        }

        &::placeholder {
          color: #9ca3af;
        }
      }

      .field-hint {
        font-size: 0.75rem;
        color: #6b7280;
        font-style: italic;
      }
    }
  }

  .step-navigation {
    display: flex;
    align-items: center;
    gap: 1rem;

    .nav-spacer {
      flex: 1;
    }
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
    opacity: 0.5;
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
  border: 2px solid #667eea;

  &:hover:not(:disabled) {
    background: #667eea;
    color: white;
  }
}

.btn-secondary {
  background: #f8fafc;
  color: #64748b;
  border: 2px solid #e2e8f0;

  &:hover:not(:disabled) {
    background: #e2e8f0;
    color: #475569;
  }
}

// Loading States
.generation-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .loading-container {
    background: white;
    padding: 3rem;
    border-radius: 16px;
    text-align: center;
    max-width: 400px;
    width: 90%;

    .loading-spinner {
      margin-bottom: 1.5rem;

      .spinner {
        width: 60px;
        height: 60px;
        border: 4px solid #e2e8f0;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto;
      }
    }

    h3 {
      color: #1e293b;
      margin-bottom: 0.5rem;
      font-size: 1.25rem;
    }

    p {
      color: #64748b;
      margin-bottom: 1.5rem;
    }

    .loading-progress {
      width: 100%;
      height: 4px;
      background: #e2e8f0;
      border-radius: 2px;
      overflow: hidden;

      .progress-bar {
        height: 100%;
        background: linear-gradient(135deg, #667eea, #764ba2);
        animation: progress 2s ease-in-out infinite;
      }
    }
  }
}

// Results Section
.results-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-top: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  .results-header {
    text-align: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #e2e8f0;

    h2 {
      color: #10b981;
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;

      i {
        font-size: 1.25rem;
      }
    }

    p {
      color: #64748b;
    }
  }

  .content-section {
    margin-bottom: 2rem;

    h3 {
      color: #1e293b;
      font-size: 1.25rem;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      i {
        color: #667eea;
      }
    }

    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }

      @media (max-width: 320px) {
        grid-template-columns: 1fr;
        gap: 0.75rem;
      }
    }

    .content-card {
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.2s ease;

      &:hover {
        border-color: #667eea;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;

        .card-type {
          background: #667eea;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .card-number {
          color: #64748b;
          font-weight: 600;
          font-size: 0.875rem;
        }
      }

      .card-content {
        p {
          color: #374151;
          line-height: 1.6;
          margin: 0;
        }
      }

      &.soundbite-card .card-header .card-type {
        background: #10b981;
      }

      &.tagline-card .card-header .card-type {
        background: #f59e0b;
      }
    }
  }

  .results-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    padding-top: 1rem;
    border-top: 2px solid #e2e8f0;

    @media (max-width: 480px) {
      flex-direction: column;
    }

    .btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      i {
        font-size: 0.875rem;
      }
    }
  }
}

// Animations
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes progress {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(0%); }
  100% { transform: translateX(100%); }
}
</style>