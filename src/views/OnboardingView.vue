<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { useToast } from '@/composables/useToast'
import ProgressBar from '@/components/onboarding/ProgressBar.vue'
import OnboardingStep from '@/components/onboarding/OnboardingStep.vue'
import SearchableSelect from '@/components/shared/SearchableSelect.vue'
import type { IUserProfile, IBusinessContext, IOnboardingPreferences, CreateOnboardingRequest } from '@/types/onboarding.types'

// Composables
const router = useRouter()
const authStore = useAuthStore()
const onboardingStore = useOnboardingStore()
const toast = useToast()

// Lista de puestos de trabajo comunes
const commonJobTitles = [
  { id: 'ceo', title: 'CEO / Director Ejecutivo' },
  { id: 'cmo', title: 'CMO / Director de Marketing' },
  { id: 'marketing-manager', title: 'Gerente de Marketing' },
  { id: 'marketing-coordinator', title: 'Coordinador de Marketing' },
  { id: 'digital-marketing-manager', title: 'Gerente de Marketing Digital' },
  { id: 'content-manager', title: 'Gerente de Contenido' },
  { id: 'social-media-manager', title: 'Community Manager' },
  { id: 'brand-manager', title: 'Gerente de Marca' },
  { id: 'product-manager', title: 'Gerente de Producto' },
  { id: 'sales-manager', title: 'Gerente de Ventas' },
  { id: 'business-owner', title: 'Propietario del Negocio' },
  { id: 'entrepreneur', title: 'Emprendedor' },
  { id: 'consultant', title: 'Consultor' },
  { id: 'freelancer', title: 'Freelancer' },
  { id: 'other', title: 'Otro' }
]

// Estado local
const currentStep = ref(1)
const totalSteps = 4
const isSubmitting = ref(false)

// Configuración de pasos
const stepTitles = [
  'Perfil Personal',
  'Contexto de Negocio',
  'Preferencias',
  'Confirmación'
]

const stepConfig = [
  {
    title: 'Cuéntanos sobre ti',
    subtitle: 'Necesitamos conocer algunos datos básicos para personalizar tu experiencia',
    icon: '👤'
  },
  {
    title: 'Tu negocio',
    subtitle: 'Ayúdanos a entender tu industria y objetivos para crear contenido relevante',
    icon: '🏢'
  },
  {
    title: 'Tus preferencias',
    subtitle: 'Configura cómo quieres que trabajemos juntos y qué tipo de contenido prefieres',
    icon: '⚙️'
  },
  {
    title: 'Confirmación',
    subtitle: 'Revisa tu información antes de completar la configuración inicial',
    icon: '✅'
  }
]

// Datos del formulario
const formData = ref<{
  userProfile: IUserProfile
  businessContext: IBusinessContext
  preferences: Partial<IOnboardingPreferences>
}>({
  // businessId removido: ya no es necesario con la nueva API
  userProfile: {
    jobTitle: '',
    department: 'marketing' as const,
    experienceLevel: 'intermediate' as const,
    marketingExperience: 'intermediate' as const,
    primaryGoals: [],
    painPoints: [],
    preferredCommunicationStyle: 'formal' as const,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    workingHours: {
      start: '09:00',
      end: '17:00'
    }
  },
  businessContext: {
    businessStage: 'startup' as const,
    companySize: '1-10' as const,
    targetMarket: 'b2b' as const,
    primaryIndustry: '',
    secondaryIndustries: [],
    geographicMarkets: [],
    competitiveAdvantage: '',
    brandMaturity: 'new_brand' as const,
    marketingBudget: 'under_1k' as const,
    currentMarketingChannels: [],
    marketingChallenges: [],
    contentCreationFrequency: 'weekly' as const,
    brandVoice: 'professional' as const
  },
  preferences: {
    communicationFrequency: 'weekly' as const,
    preferredContentTypes: [],
    aiProviderPreference: 'openai' as const,
    notificationSettings: {
      email: true,
      inApp: true,
      contentGenerated: true,
      weeklyReports: false,
      systemUpdates: true
    },
    onboardingCompleted: false,
    completedSteps: []
  }
})

// Opciones para los formularios
const roleOptions = [
  { value: 'ceo', label: 'CEO/Fundador' },
  { value: 'marketing_manager', label: 'Gerente de Marketing' },
  { value: 'business_owner', label: 'Dueño de Negocio' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'consultant', label: 'Consultor' },
  { value: 'other', label: 'Otro' }
]

const experienceOptions = [
  { value: 'beginner', label: 'Principiante (0-1 años)' },
  { value: 'intermediate', label: 'Intermedio (2-5 años)' },
  { value: 'advanced', label: 'Avanzado (5+ años)' },
  { value: 'expert', label: 'Experto (10+ años)' }
]

const industryOptions = [
  { value: 'technology', label: 'Tecnología' },
  { value: 'healthcare', label: 'Salud' },
  { value: 'finance', label: 'Finanzas' },
  { value: 'education', label: 'Educación' },
  { value: 'retail', label: 'Retail/Comercio' },
  { value: 'consulting', label: 'Consultoría' },
  { value: 'real_estate', label: 'Bienes Raíces' },
  { value: 'food_beverage', label: 'Alimentos y Bebidas' },
  { value: 'other', label: 'Otro' }
]

const companySizeOptions = [
  { value: '1-10', label: '1-10 empleados' },
  { value: '11-50', label: '11-50 empleados' },
  { value: '51-200', label: '51-200 empleados' },
  { value: '201-1000', label: '201-1000 empleados' },
  { value: '1000+', label: 'Más de 1000 empleados' }
]

const targetMarketOptions = [
  { value: 'b2b', label: 'B2B (Empresas)' },
  { value: 'b2c', label: 'B2C (Consumidores)' },
  { value: 'both', label: 'Ambos' }
]

const businessSizeOptions = [
  { value: 'solo', label: 'Solo (1 persona)' },
  { value: 'small', label: 'Pequeño (2-10 empleados)' },
  { value: 'medium', label: 'Mediano (11-50 empleados)' },
  { value: 'large', label: 'Grande (50+ empleados)' }
]

const budgetOptions = [
  { value: 'under_1k', label: 'Menos de $1,000/mes' },
  { value: '1k_5k', label: '$1,000 - $5,000/mes' },
  { value: '5k_10k', label: '$5,000 - $10,000/mes' },
  { value: 'over_10k', label: 'Más de $10,000/mes' }
]

const contentStyleOptions = [
  { value: 'professional', label: 'Profesional y Formal' },
  { value: 'casual', label: 'Casual y Amigable' },
  { value: 'creative', label: 'Creativo y Dinámico' },
  { value: 'technical', label: 'Técnico y Detallado' }
]

const brandVoiceOptions = [
  { value: 'authoritative', label: 'Autoritativo' },
  { value: 'friendly', label: 'Amigable' },
  { value: 'innovative', label: 'Innovador' },
  { value: 'trustworthy', label: 'Confiable' }
]

// Computed
const progressPercentage = computed(() => (currentStep.value / totalSteps) * 100)

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return formData.value.userProfile?.jobTitle && formData.value.userProfile?.experienceLevel
    case 2:
      return formData.value.businessContext?.primaryIndustry && formData.value.businessContext?.companySize
    case 3:
      return formData.value.businessContext?.targetMarket && formData.value.preferences?.communicationFrequency
    case 4:
      return formData.value.preferences?.aiProviderPreference && formData.value.businessContext?.brandVoice
    default:
      return false
  }
})

// Métodos
function nextStep() {
  if (currentStep.value < totalSteps && canProceed.value) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

function addPrimaryGoal(goal: 'brand_awareness' | 'lead_generation' | 'sales_conversion' | 'customer_retention' | 'market_expansion') {
  if (goal && formData.value.userProfile?.primaryGoals) {
    formData.value.userProfile.primaryGoals.push(goal)
  }
}

function removePrimaryGoal(index: number) {
  if (formData.value.userProfile?.primaryGoals) {
    formData.value.userProfile.primaryGoals.splice(index, 1)
  }
}

async function submitOnboarding() {
  if (!canProceed.value) return

  isSubmitting.value = true

  try {
    // Validar que los datos requeridos estén completos
    if (!formData.value.userProfile.jobTitle || !formData.value.businessContext.primaryIndustry) {
      throw new Error('Por favor completa todos los campos requeridos')
    }

    // Crear onboarding con los datos del formulario
    const onboardingData: CreateOnboardingRequest = {
      userProfile: formData.value.userProfile,
      businessContext: formData.value.businessContext,
      preferences: formData.value.preferences
    }

    await onboardingStore.createOnboarding(onboardingData)

    toast.triggerToast('¡Onboarding completado exitosamente!', 'success')
    router.push('/dashboard') // Redirigir al dashboard
  } catch (error: any) {
    toast.triggerToast(error.message || 'Error al completar el onboarding', 'error')
  } finally {
    isSubmitting.value = false
  }
}

// Verificar autenticación al montar
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  // La verificación de isVerified se maneja en el router guard
  // No necesitamos verificarla aquí para evitar redirecciones innecesarias
})
</script>

<template>
  <div class="onboarding-container">
    <!-- Header -->
    <header class="onboarding-header">
      <div class="container">
        <div class="header-content">
          <h1 class="title">Configuración Inicial</h1>
          <p class="subtitle">Personaliza tu experiencia en unos simples pasos</p>
        </div>
        
        <!-- Progress Bar -->
        <ProgressBar 
          :current-step="currentStep"
          :total-steps="totalSteps"
          :step-titles="stepTitles"
        />
      </div>
    </header>

    <!-- Main Content -->
    <main class="onboarding-main">
      <div class="container">
        <div class="form-container">
          
          <!-- Paso 1: Perfil Personal -->
          <OnboardingStep
            v-if="currentStep === 1"
            :title="stepConfig[0].title"
            :subtitle="stepConfig[0].subtitle"
            :icon="stepConfig[0].icon"
          >
            <div class="form-grid">
              <div class="form-group">
                <label for="jobTitle">¿Cuál es tu puesto de trabajo?</label>
                <SearchableSelect
                  v-model="formData.userProfile!.jobTitle"
                  :items="commonJobTitles"
                  label-field="title"
                  value-field="title"
                  placeholder="Busca tu puesto de trabajo..."
                  @select="(item) => formData.userProfile!.jobTitle = item?.title || ''"
                />
              </div>
              
              <div class="form-group">
                <label for="experienceLevel">¿Cuál es tu nivel de experiencia?</label>
                <select 
                  id="experienceLevel" 
                  v-model="formData.userProfile!.experienceLevel"
                  class="form-select"
                >
                  <option value="beginner">Principiante</option>
                  <option value="intermediate">Intermedio</option>
                  <option value="advanced">Avanzado</option>
                  <option value="expert">Experto</option>
                </select>
              </div>
              
              <div class="form-group full-width">
                <label>Horario de trabajo preferido</label>
                <div class="time-inputs">
                  <div class="time-group">
                    <label for="start-time">Inicio</label>
                    <input 
                      id="start-time"
                      v-model="formData.userProfile!.workingHours.start"
                      type="time" 
                      class="form-input"
                    >
                  </div>
                  <div class="time-group">
                    <label for="end-time">Fin</label>
                    <input 
                      id="end-time"
                      v-model="formData.userProfile!.workingHours.end"
                      type="time" 
                      class="form-input"
                    >
                  </div>
                </div>
              </div>
            </div>
          </OnboardingStep>

          <!-- Paso 2: Información del Negocio -->
          <OnboardingStep
            v-if="currentStep === 2"
            :title="stepConfig[1].title"
            :subtitle="stepConfig[1].subtitle"
            :icon="stepConfig[1].icon"
          >
            <div class="form-grid">
              <div class="form-group">
                <label for="primaryIndustry">¿En qué industria trabajas?</label>
                <SearchableSelect
                  v-model="formData.businessContext!.primaryIndustry"
                  :items="industryOptions"
                  label-field="label"
                  value-field="value"
                  placeholder="Selecciona tu industria"
                />
              </div>
              
              <div class="form-group">
                <label for="companySize">¿Cuál es el tamaño de tu empresa?</label>
                <SearchableSelect
                  v-model="formData.businessContext!.companySize"
                  :items="companySizeOptions"
                  label-field="label"
                  value-field="value"
                  placeholder="Selecciona el tamaño de tu empresa"
                />
              </div>
              
              <div class="form-group full-width">
                <label for="targetMarket">¿Cuál es tu mercado objetivo?</label>
                <SearchableSelect
                  v-model="formData.businessContext!.targetMarket"
                  :items="targetMarketOptions"
                  label-field="label"
                  value-field="value"
                  placeholder="Selecciona tu mercado objetivo"
                />
              </div>
            </div>
          </OnboardingStep>

          <!-- Paso 3: Preferencias -->
          <OnboardingStep
            v-if="currentStep === 3"
            :title="stepConfig[2].title"
            :subtitle="stepConfig[2].subtitle"
            :icon="stepConfig[2].icon"
          >
            <div class="form-grid">
              <div class="form-group">
                <label for="communicationFrequency" class="form-label">Frecuencia de comunicación *</label>
                <select 
                  id="communicationFrequency"
                  v-model="formData.preferences!.communicationFrequency" 
                  class="form-select" 
                  required
                >
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                  <option value="as_needed">Según necesidad</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="aiProviderPreference" class="form-label">Proveedor de IA preferido *</label>
                <select 
                  id="aiProviderPreference"
                  v-model="formData.preferences!.aiProviderPreference" 
                  class="form-select" 
                  required
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="google">Google</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="brandVoice" class="form-label">Voz de marca *</label>
                <select 
                  id="brandVoice"
                  v-model="formData.businessContext!.brandVoice" 
                  class="form-select" 
                  required
                >
                  <option value="professional">Profesional</option>
                  <option value="friendly">Amigable</option>
                  <option value="authoritative">Autoritativo</option>
                  <option value="casual">Casual</option>
                </select>
              </div>
              
              <div class="form-group full-width">
                <label class="form-label">Tipos de contenido preferidos</label>
                <div class="checkbox-group">
                  <div class="checkbox-item">
                    <input
                      id="blog_posts"
                      v-model="formData.preferences!.preferredContentTypes"
                      type="checkbox"
                      value="blog_posts"
                    />
                    <span>Blog posts</span>
                  </div>
                  <div class="checkbox-item">
                    <input
                      id="social_media"
                      v-model="formData.preferences!.preferredContentTypes"
                      type="checkbox"
                      value="social_media"
                    />
                    <span>Redes sociales</span>
                  </div>
                  <div class="checkbox-item">
                    <input
                      id="email_campaigns"
                      v-model="formData.preferences!.preferredContentTypes"
                      type="checkbox"
                      value="email_campaigns"
                    />
                    <span>Campañas de email</span>
                  </div>
                  <div class="checkbox-item">
                    <input
                      id="ad_copy"
                      v-model="formData.preferences!.preferredContentTypes"
                      type="checkbox"
                      value="ad_copy"
                    />
                    <span>Textos publicitarios</span>
                  </div>
                </div>
              </div>
            </div>
          </OnboardingStep>

          <!-- Paso 4: Confirmación -->
          <OnboardingStep
            v-if="currentStep === 4"
            :title="stepConfig[3].title"
            :subtitle="stepConfig[3].subtitle"
            :icon="stepConfig[3].icon"
          >
            <div class="confirmation-content">
              <!-- Resumen del Perfil -->
              <div class="summary-section">
                <h3>👤 Perfil Personal</h3>
                <div class="summary-grid">
                  <div class="summary-item">
                    <span class="label">Puesto:</span>
                    <span class="value">{{ formData.userProfile?.jobTitle || 'No especificado' }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Experiencia:</span>
                    <span class="value">{{ formData.userProfile?.experienceLevel || 'No especificado' }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Horario:</span>
                    <span class="value">{{ formData.userProfile?.workingHours.start }} - {{ formData.userProfile?.workingHours.end }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Zona horaria:</span>
                    <span class="value">{{ formData.userProfile?.timezone }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Resumen del Negocio -->
              <div class="summary-section">
                <h3>🏢 Información del Negocio</h3>
                <div class="summary-grid">
                  <div class="summary-item">
                    <span class="label">Industria:</span>
                    <span class="value">{{ formData.businessContext?.primaryIndustry || 'No especificado' }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Tamaño:</span>
                    <span class="value">{{ formData.businessContext?.companySize || 'No especificado' }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Mercado:</span>
                    <span class="value">{{ formData.businessContext?.targetMarket || 'No especificado' }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Voz de marca:</span>
                    <span class="value">{{ formData.businessContext?.brandVoice || 'No especificado' }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Estilo de comunicación:</span>
                    <span class="value">{{ formData.userProfile?.preferredCommunicationStyle || 'No especificado' }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Resumen de Preferencias -->
              <div class="summary-section">
                <h3>⚙️ Preferencias</h3>
                <div class="summary-grid">
                  <div class="summary-item">
                    <span class="label">Frecuencia de comunicación:</span>
                    <span class="value">{{ formData.preferences?.communicationFrequency || 'No especificado' }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Proveedor de IA:</span>
                    <span class="value">{{ formData.preferences?.aiProviderPreference || 'No especificado' }}</span>
                  </div>
                  <div class="summary-item full-width">
                    <span class="label">Tipos de contenido:</span>
                    <span class="value">{{ formData.preferences?.preferredContentTypes?.join(', ') || 'No especificado' }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Mensaje de confirmación -->
              <div class="confirmation-message">
                <div class="message-icon">🎉</div>
                <h3>¡Casi terminamos!</h3>
                <p>Revisa tu información y haz clic en "Completar Configuración" para finalizar tu configuración inicial.</p>
              </div>
            </div>
          </OnboardingStep>

          <!-- Navigation -->
          <div class="step-navigation">
            <button 
              v-if="currentStep > 1"
              @click="prevStep"
              class="btn btn-secondary"
              type="button"
            >
              Anterior
            </button>
            
            <div class="nav-spacer"></div>
            
            <button 
              v-if="currentStep < totalSteps"
              @click="nextStep"
              :disabled="!canProceed"
              class="btn btn-primary"
              type="button"
            >
              Siguiente
            </button>
            
            <button 
              v-if="currentStep === totalSteps"
              @click="submitOnboarding"
              :disabled="!canProceed || isSubmitting"
              class="btn btn-primary"
              type="button"
            >
              <span v-if="isSubmitting">Completando...</span>
              <span v-else>Completar Configuración</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.onboarding-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  @media (max-width: 768px) {
    background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  }
}

// Confirmation Content
.confirmation-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.summary-section {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;

  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  &.full-width {
    grid-column: 1 / -1;
  }

  .label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .value {
    font-size: 0.875rem;
    color: #1e293b;
    font-weight: 500;
  }
}

.confirmation-message {
  text-align: center;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid #e2e8f0;

  .message-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }

  p {
    color: #64748b;
    margin: 0;
  }
}

// Checkbox Group
.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }

  input[type="checkbox"] {
    margin: 0;
    accent-color: #667eea;
  }

  span {
    font-size: 0.875rem;
    color: #374151;
    font-weight: 500;
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
.onboarding-header {
  padding: 2rem 0;
  color: white;

  @media (max-width: 768px) {
    padding: 1.5rem 0;
  }
}

.header-content {
  text-align: center;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.75rem;
  }
}

.subtitle {
  font-size: 1.125rem;
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
}

// Progress
.progress-container {
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ade80, #22c55e);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.step-indicators {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-indicator {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
  }

  &.active {
    background: #4ade80;
    transform: scale(1.1);
  }

  &.completed {
    background: #22c55e;
  }
}

.step-number {
  font-weight: 600;
  font-size: 0.875rem;

  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
}

// Main Content
.onboarding-main {
  padding: 2rem 0 4rem;

  @media (max-width: 768px) {
    padding: 1.5rem 0 3rem;
  }
}

.form-container {
  background: white;
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 2rem;
    border-radius: 12px;
  }

  @media (max-width: 480px) {
    padding: 1.5rem;
    border-radius: 8px;
  }
}

.step-content {
  min-height: 400px;

  @media (max-width: 768px) {
    min-height: 350px;
  }
}

.step-header {
  text-align: center;
  margin-bottom: 2rem;

  h2 {
    font-size: 1.875rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.5rem;

    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
  }

  p {
    color: #6b7280;
    font-size: 1rem;

    @media (max-width: 768px) {
      font-size: 0.875rem;
    }
  }
}

// Forms
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

.form-group {
  &.full-width {
    grid-column: 1 / -1;
  }
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-select,
.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  @media (max-width: 480px) {
    padding: 0.625rem;
    font-size: 0.875rem;
  }
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

// Time inputs
.time-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 480px) {
    gap: 0.75rem;
  }
}

.time-group {
  label {
    font-size: 0.75rem;
    color: #6b7280;
    margin-bottom: 0.25rem;
  }
}

// Color options
.color-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;

  @media (max-width: 480px) {
    gap: 0.75rem;
  }
}

.color-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #667eea;
  }

  input[type="radio"] {
    display: none;

    &:checked+.color-preview {
      transform: scale(1.1);
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
    }

    &:checked~span {
      color: #667eea;
      font-weight: 600;
    }
  }

  @media (max-width: 480px) {
    padding: 0.75rem;
  }
}

.color-preview {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.2s ease;

  &.modern {
    background: linear-gradient(135deg, #667eea, #764ba2);
  }

  &.classic {
    background: linear-gradient(135deg, #2c3e50, #34495e);
  }

  &.vibrant {
    background: linear-gradient(135deg, #ff6b6b, #feca57);
  }

  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
  }
}

// Navigation
.step-navigation {
  display: flex;
  align-items: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;

  @media (max-width: 768px) {
    margin-top: 2rem;
    padding-top: 1.5rem;
  }
}

.nav-spacer {
  flex: 1;
}

// Buttons
.btn {
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    padding: 0.625rem 1.5rem;
    font-size: 0.875rem;
  }
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;

  &:hover {
    background: #e5e7eb;
  }
}
</style>