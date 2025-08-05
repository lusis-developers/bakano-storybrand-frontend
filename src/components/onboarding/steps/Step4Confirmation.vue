<script setup lang="ts">
import type { IUserProfile, IBusinessContext, IOnboardingPreferences } from '@/types/onboarding.types'

interface Props {
  userProfile: IUserProfile
  businessContext: IBusinessContext
  preferences: Partial<IOnboardingPreferences>
  isSubmitting?: boolean
}

interface Emits {
  (e: 'submit'): void
}

const props = withDefaults(defineProps<Props>(), {
  isSubmitting: false
})

const emit = defineEmits<Emits>()

const experienceLevelLabels: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
  expert: 'Experto'
}

const industryLabels: Record<string, string> = {
  technology: 'Tecnología',
  healthcare: 'Salud',
  finance: 'Finanzas',
  education: 'Educación',
  retail: 'Retail/Comercio',
  consulting: 'Consultoría',
  real_estate: 'Bienes Raíces',
  food_beverage: 'Alimentos y Bebidas',
  other: 'Otro'
}

const companySizeLabels: Record<string, string> = {
  '1-10': '1-10 empleados',
  '11-50': '11-50 empleados',
  '51-200': '51-200 empleados',
  '201-1000': '201-1000 empleados',
  '1000+': 'Más de 1000 empleados'
}

const targetMarketLabels: Record<string, string> = {
  b2b: 'B2B (Empresas)',
  b2c: 'B2C (Consumidores)',
  both: 'Ambos'
}

const communicationFrequencyLabels: Record<string, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensual',
  as_needed: 'Según necesidad'
}

const aiProviderLabels: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google'
}

const brandVoiceLabels: Record<string, string> = {
  professional: 'Profesional',
  friendly: 'Amigable',
  authoritative: 'Autoritativo',
  casual: 'Casual'
}

const contentTypeLabels: Record<string, string> = {
  blog_posts: 'Blog posts',
  social_media: 'Redes sociales',
  email_campaigns: 'Campañas de email',
  ad_copy: 'Textos publicitarios'
}

function handleSubmit() {
  emit('submit')
}
</script>

<template>
  <div class="step4-container">
    <div class="confirmation-content">
      <!-- Resumen del Perfil -->
      <div class="summary-section">
        <h3>👤 Perfil Personal</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="label">Puesto:</span>
            <span class="value">{{ userProfile?.jobTitle || 'No especificado' }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Experiencia:</span>
            <span class="value">{{ experienceLevelLabels[userProfile?.experienceLevel || ''] || 'No especificado' }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Horario:</span>
            <span class="value">{{ userProfile?.workingHours.start }} - {{ userProfile?.workingHours.end }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Zona horaria:</span>
            <span class="value">{{ userProfile?.timezone }}</span>
          </div>
        </div>
      </div>
      
      <!-- Resumen del Negocio -->
      <div class="summary-section">
        <h3>🏢 Información del Negocio</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="label">Industria:</span>
            <span class="value">{{ industryLabels[businessContext?.primaryIndustry || ''] || 'No especificado' }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Tamaño:</span>
            <span class="value">{{ companySizeLabels[businessContext?.companySize || ''] || 'No especificado' }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Mercado objetivo:</span>
            <span class="value">{{ targetMarketLabels[businessContext?.targetMarket || ''] || 'No especificado' }}</span>
          </div>
          <div class="summary-item full-width">
            <span class="label">Ventaja competitiva:</span>
            <span class="value">{{ businessContext?.competitiveAdvantage || 'No especificado' }}</span>
          </div>
        </div>
      </div>
      
      <!-- Resumen de Preferencias -->
      <div class="summary-section">
        <h3>⚙️ Preferencias</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="label">Comunicación:</span>
            <span class="value">{{ communicationFrequencyLabels[preferences?.communicationFrequency || ''] || 'No especificado' }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Proveedor IA:</span>
            <span class="value">{{ aiProviderLabels[preferences?.aiProviderPreference || ''] || 'No especificado' }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Voz de marca:</span>
            <span class="value">{{ brandVoiceLabels[businessContext?.brandVoice || ''] || 'No especificado' }}</span>
          </div>
          <div class="summary-item full-width">
            <span class="label">Tipos de contenido:</span>
            <span class="value">
              <template v-if="preferences?.preferredContentTypes?.length">
                {{preferences.preferredContentTypes.map(type => contentTypeLabels[type]).join(', ')}}
              </template>
              <template v-else>
                No especificado
              </template>
            </span>
          </div>
        </div>
      </div>
      
      <!-- Botón de confirmación -->
      <div class="confirmation-actions">
        <div class="confirmation-message">
          <p>¿Confirmas que toda la información es correcta?</p>
          <p class="sub-message">Podrás modificar estos datos más tarde desde tu perfil.</p>
        </div>
        
        <button 
          type="button"
          class="submit-button"
          :disabled="isSubmitting"
          @click="handleSubmit"
        >
          <span v-if="isSubmitting" class="loading-spinner"></span>
          {{ isSubmitting ? 'Completando...' : 'Completar Configuración' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.step4-container {
  width: 100%;
}

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
    margin: 0 0 1rem 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
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
    word-break: break-word;
  }
}

.confirmation-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.confirmation-message {
  text-align: center;

  p {
    margin: 0;
    font-size: 1rem;
    color: #1e293b;
    font-weight: 600;

    &.sub-message {
      font-size: 0.875rem;
      color: #64748b;
      font-weight: 400;
      margin-top: 0.5rem;
    }
  }
}

.submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 200px;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
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
</style>