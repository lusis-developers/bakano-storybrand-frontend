// Exportación centralizada de todos los steps del onboarding
export { default as Step1PersonalProfile } from './Step1PersonalProfile.vue'
export { default as Step2BusinessInfo } from './Step2BusinessInfo.vue'
export { default as Step3Preferences } from './Step3Preferences.vue'
export { default as Step4Confirmation } from './Step4Confirmation.vue'

// Tipos y configuraciones para los steps
export interface StepConfig {
  title: string
  subtitle: string
  icon: string
  component: string
}

export const STEP_CONFIGS: StepConfig[] = [
  {
    title: 'Cuéntanos sobre ti',
    subtitle: 'Necesitamos conocer algunos datos básicos para personalizar tu experiencia',
    icon: '👤',
    component: 'Step1PersonalProfile'
  },
  {
    title: 'Tu negocio',
    subtitle: 'Ayúdanos a entender tu industria y objetivos para crear contenido relevante',
    icon: '🏢',
    component: 'Step2BusinessInfo'
  },
  {
    title: 'Tus preferencias',
    subtitle: 'Configura cómo quieres que trabajemos juntos y qué tipo de contenido prefieres',
    icon: '⚙️',
    component: 'Step3Preferences'
  },
  {
    title: 'Confirmación',
    subtitle: 'Revisa tu información antes de completar la configuración inicial',
    icon: '✅',
    component: 'Step4Confirmation'
  }
]

export const STEP_TITLES = [
  'Perfil Personal',
  'Contexto de Negocio',
  'Preferencias',
  'Confirmación'
]

export const TOTAL_STEPS = STEP_CONFIGS.length