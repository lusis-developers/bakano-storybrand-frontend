// Interfaces para el sistema de onboarding basadas en el modelo del backend

// Interface para el perfil profesional del usuario
export interface IUserProfile {
  jobTitle: string
  department: 'marketing' | 'sales' | 'operations' | 'executive' | 'other'
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  marketingExperience: 'none' | 'basic' | 'intermediate' | 'advanced'
  primaryGoals: (
    | 'brand_awareness'
    | 'lead_generation'
    | 'sales_conversion'
    | 'customer_retention'
    | 'market_expansion'
  )[]
  painPoints: (
    | 'lack_of_time'
    | 'limited_budget'
    | 'no_marketing_expertise'
    | 'unclear_messaging'
    | 'low_conversion_rates'
  )[]
  preferredCommunicationStyle: 'formal' | 'casual' | 'technical' | 'creative'
  timezone: string
  workingHours: {
    start: string // Formato HH:MM
    end: string // Formato HH:MM
  }
}

// Interface para el contexto del negocio
export interface IBusinessContext {
  businessStage: 'startup' | 'growth' | 'established' | 'enterprise'
  companySize: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+'
  targetMarket: 'b2b' | 'b2c' | 'both'
  primaryIndustry: string
  secondaryIndustries: string[]
  geographicMarkets: string[] // Países/regiones
  competitiveAdvantage: string
  brandMaturity: 'new_brand' | 'developing' | 'established' | 'mature'
  marketingBudget: 'under_1k' | '1k_5k' | '5k_25k' | '25k_100k' | 'over_100k'
  currentMarketingChannels: (
    | 'social_media'
    | 'email'
    | 'content_marketing'
    | 'paid_ads'
    | 'seo'
    | 'events'
    | 'partnerships'
    | 'traditional'
  )[]
  marketingChallenges: (
    | 'inconsistent_messaging'
    | 'low_engagement'
    | 'poor_conversion'
    | 'limited_reach'
    | 'high_costs'
    | 'measuring_roi'
  )[]
  contentCreationFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'as_needed'
  brandVoice:
    | 'professional'
    | 'friendly'
    | 'authoritative'
    | 'innovative'
    | 'trustworthy'
    | 'playful'
}

// Interface para las preferencias de onboarding
export interface IOnboardingPreferences {
  communicationFrequency: 'daily' | 'weekly' | 'monthly' | 'as_needed'
  preferredContentTypes: (
    | 'blog_posts'
    | 'social_media'
    | 'email_campaigns'
    | 'video_scripts'
    | 'ad_copy'
    | 'website_copy'
  )[]
  aiProviderPreference: 'openai' | 'gemini' | 'no_preference'
  notificationSettings: {
    email: boolean
    inApp: boolean
    contentGenerated: boolean
    weeklyReports: boolean
    systemUpdates: boolean
  }
  onboardingCompleted: boolean
  completedSteps: ('user_profile' | 'business_context' | 'preferences' | 'first_content')[]
}

// Interface principal del onboarding
export interface IOnboarding {
  _id?: string
  user: string // ObjectId como string
  userProfile?: IUserProfile
  businessContext?: IBusinessContext
  preferences?: IOnboardingPreferences
  completionPercentage: number
  startedAt: string // ISO date string
  completedAt?: string // ISO date string
  lastUpdated: string // ISO date string
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
}

// DTOs para las requests del API
export interface CreateOnboardingRequest {
  userProfile: IUserProfile
  businessContext: IBusinessContext
  preferences?: Partial<IOnboardingPreferences>
}

export interface UpdateOnboardingRequest {
  userProfile?: Partial<IUserProfile>
  businessContext?: Partial<IBusinessContext>
  preferences?: Partial<IOnboardingPreferences>
  completedStep?: 'user_profile' | 'business_context' | 'preferences' | 'first_content'
}

export interface CompleteStepRequest {
  step: 'user_profile' | 'business_context' | 'preferences' | 'first_content'
}

// Responses del API
export interface OnboardingResponse {
  message: string
  onboarding: IOnboarding
  nextStep?: string | null
  isComplete?: boolean
}

export interface OnboardingListResponse {
  message: string
  onboardings: (IOnboarding & {
    nextStep: string | null
    isComplete: boolean
  })[]
  total: number
}

export interface CompleteStepResponse {
  message: string
  completionPercentage: number
  nextStep: string | null
  isComplete: boolean
}

// Tipos de utilidad
export type OnboardingStep = 'user_profile' | 'business_context' | 'preferences' | 'first_content'
export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed'

// Estados de carga para el frontend
export interface OnboardingLoadingState {
  creating: boolean
  updating: boolean
  fetching: boolean
  completing: boolean
  deleting: boolean
}

// Estado de error
export interface OnboardingError {
  message: string
  field?: string
  code?: string
}

// Configuración de pasos del onboarding
export interface OnboardingStepConfig {
  id: OnboardingStep
  title: string
  description: string
  icon: string
  order: number
  estimatedTime: string
  required: boolean
}

// Datos del formulario por pasos
export interface UserProfileFormData extends IUserProfile {}
export interface BusinessContextFormData extends IBusinessContext {}
export interface PreferencesFormData extends IOnboardingPreferences {}

// Validación de formularios
export interface FormValidationError {
  field: string
  message: string
}

export interface FormValidationResult {
  isValid: boolean
  errors: FormValidationError[]
}

// Métricas y analytics
export interface OnboardingMetrics {
  totalUsers: number
  completedOnboardings: number
  averageCompletionTime: number
  dropOffByStep: Record<OnboardingStep, number>
  completionRate: number
}

// Configuración del onboarding
export interface OnboardingConfig {
  steps: OnboardingStepConfig[]
  maxSteps: number
  allowSkipping: boolean
  autoSave: boolean
  sessionTimeout: number
}