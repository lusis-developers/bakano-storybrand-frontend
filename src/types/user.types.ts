export type PaidPlan = 'starter' | 'pro' | 'enterprise'
export type BillingInterval = 'monthly' | 'yearly'
export type SubscriptionStatus =
  | 'free'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'paused'
  | 'incomplete'
export type Provider = 'stripe' | 'manual' | 'payphone'

// Suscripción embebida dentro del usuario (fechas como string en frontend)
export interface UserSubscription {
  plan: 'free' | PaidPlan
  status: SubscriptionStatus
  provider?: Provider
  customerId?: string
  subscriptionId?: string
  billingInterval?: BillingInterval
  currentPeriodStart?: string | Date
  currentPeriodEnd?: string | Date
  trialStart?: string | Date
  trialEnd?: string | Date
  cancelAtPeriodEnd?: boolean
  canceledAt?: string | Date
  nextBillingDate?: string | Date
  paymentMethodId?: string
  providerMetadata?: Record<string, any>
}

// Usuario global utilizado en el frontend
export interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  birthDate?: string | Date
  businesses: string[]
  role: 'admin' | 'client'
  isVerified: boolean
  verificationToken?: string
  verificationTokenExpires?: string | Date
  onboarding?: string | null
  subscription?: UserSubscription
  createdAt: string | Date
  updatedAt: string | Date
  fullName?: string
  age?: number
}
