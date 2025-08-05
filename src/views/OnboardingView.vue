<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { useToast } from '@/composables/useToast'
import ProgressBar from '@/components/onboarding/ProgressBar.vue'
import {
  Step1PersonalProfile,
  Step2BusinessInfo,
  Step3Preferences,
  Step4Confirmation,
  STEP_TITLES,
  TOTAL_STEPS
} from '@/components/onboarding/steps'
import type { IUserProfile, IBusinessContext, IOnboardingPreferences, CreateOnboardingRequest, UpdateOnboardingRequest } from '@/types/onboarding.types'

const router = useRouter()
const authStore = useAuthStore()
const onboardingStore = useOnboardingStore()
const toast = useToast()

const currentStep = ref(1)
const isSubmitting = ref(false)

const formData = ref<{
  userProfile: IUserProfile
  businessContext: IBusinessContext
  preferences: Partial<IOnboardingPreferences>
}>({
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



// Computed
const progressPercentage = computed(() => (currentStep.value / TOTAL_STEPS) * 100)

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return formData.value.userProfile?.jobTitle && formData.value.userProfile?.experienceLevel
    case 2:
      return formData.value.businessContext?.primaryIndustry && formData.value.businessContext?.companySize && formData.value.businessContext?.competitiveAdvantage
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
  if (currentStep.value < TOTAL_STEPS && canProceed.value) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

async function submitOnboarding() {
  isSubmitting.value = true
  try {
    const finalPayload = {
      userProfile: formData.value.userProfile,
      businessContext: formData.value.businessContext,
      preferences: {
        ...formData.value.preferences,
        onboardingCompleted: true,
      },
    }

    const hasExisting = onboardingStore.currentOnboarding?._id

    if (hasExisting) {
      await onboardingStore.updateOnboarding(finalPayload)
    } else {
      await onboardingStore.createOnboarding(finalPayload)
    }

    toast.triggerToast('¡Onboarding completado exitosamente!', 'success')
    router.push('/dashboard')
  } catch (error: any) {
    toast.triggerToast(error.message || 'Error al completar el onboarding', 'error')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
})
</script>

<template>
  <div class="onboarding-container">
    <header class="onboarding-header">
      <div class="container">
        <div class="header-content">
          <h1 class="title">Configuración Inicial</h1>
          <p class="subtitle">Personaliza tu experiencia en unos simples pasos</p>
        </div>
        <ProgressBar 
          :current-step="currentStep"
          :total-steps="TOTAL_STEPS"
          :step-titles="STEP_TITLES"
        />
      </div>
    </header>
    <main class="onboarding-main">
      <div class="container">
        <div class="form-container">
          <Step1PersonalProfile
            v-if="currentStep === 1"
            v-model="formData.userProfile"
          />
          <Step2BusinessInfo
            v-if="currentStep === 2"
            v-model="formData.businessContext"
          />
          <Step3Preferences
            v-if="currentStep === 3"
            v-model:preferences="formData.preferences"
            v-model:business-context="formData.businessContext"
          />
          <Step4Confirmation
            v-if="currentStep === 4"
            :user-profile="formData.userProfile"
            :business-context="formData.businessContext"
            :preferences="formData.preferences"
            :is-submitting="isSubmitting"
            @submit="submitOnboarding"
          />
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
              v-if="currentStep < TOTAL_STEPS"
              @click="nextStep"
              :disabled="!canProceed"
              class="btn btn-primary"
              type="button"
            >
              Siguiente
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