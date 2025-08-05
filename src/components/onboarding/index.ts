export { default as OnboardingStep } from './OnboardingStep.vue'
export { default as ProgressBar } from './ProgressBar.vue'

export {
  Step1PersonalProfile,
  Step2BusinessInfo,
  Step3Preferences,
  Step4Confirmation,
  STEP_CONFIGS,
  STEP_TITLES,
  TOTAL_STEPS,
  type StepConfig,
} from './steps'

// Exportar tipos
export type {
  IUserProfile,
  IBusinessContext,
  IOnboardingPreferences,
} from '@/types/onboarding.types'
