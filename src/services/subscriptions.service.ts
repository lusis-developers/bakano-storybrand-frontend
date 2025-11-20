import APIBase from './httpBase'
import type { AxiosResponse } from 'axios'
import type {
  PaidPlan,
  BillingInterval,
  Provider,
  SubscriptionStatus,
  UserSubscription,
} from '@/types/user.types'

// Snapshot de suscripción almacenado en el usuario (reutilizamos el tipo centralizado)
export type ISubscriptionSnapshot = UserSubscription

// Estructura básica de usuario que el endpoint /subscriptions/me retorna
export interface ISubscriptionUserInfo {
  id: string
  firstName: string
  lastName: string
  email: string
}

export interface GetMySubscriptionResponse {
  success: boolean
  data: {
    user: ISubscriptionUserInfo
    snapshot: ISubscriptionSnapshot
    derived: {
      isActive: boolean
      isOnTrial: boolean
      remainingDays: number | null
      endsAt: string | null
      isExpired: boolean
    }
  }
}

// Registro completo de suscripciones (historial)
export interface ISubscriptionRecord {
  _id: string
  user?: string
  plan: 'free' | PaidPlan
  status: SubscriptionStatus
  provider?: Provider
  billingInterval?: BillingInterval
  priceId?: string
  amount?: number
  currency?: string
  trialStart?: string
  trialEnd?: string
  currentPeriodStart?: string
  currentPeriodEnd?: string
  nextBillingDate?: string
  cancelAtPeriodEnd?: boolean
  canceledAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface ListMySubscriptionsResponse {
  success: boolean
  data: ISubscriptionRecord[]
}

export interface StartSubscriptionRequest {
  plan: PaidPlan
  billingInterval: BillingInterval
  provider?: Provider
  trialDays?: number
  priceId?: string
  amount?: number
  currency?: string
  nationalId?: string
  phone?: string
  address?: { street?: string; city?: string; state?: string; zipCode?: string; country?: string }
}

export interface StartSubscriptionResponse {
  success: boolean
  message: string
  data: ISubscriptionRecord
}

export interface CancelMySubscriptionRequest {
  immediate?: boolean
}

export interface CancelMySubscriptionResponse {
  success: boolean
  message: string
}

// Pricing plans response
export interface PricingPlan {
  // Identificador opcional
  id?: string
  // Nombre del plan (visible)
  name: string
  // Precio y moneda
  price: number
  currency: string
  // Intervalo de cobro (opcional)
  interval?: BillingInterval
  // Metadata opcional para UI
  description?: string
  features?: string[]
  isPopular?: boolean
}

export interface GetPlansResponse {
  success: boolean
  data: PricingPlan[]
}

class SubscriptionsService extends APIBase {
  private readonly endpoint = 'subscriptions'

  /**
   * Info rápida del usuario (snapshot + datos derivados)
   * Backend: GET /subscriptions/me
   */
  async getMySubscription(): Promise<GetMySubscriptionResponse> {
    const response: AxiosResponse<GetMySubscriptionResponse> = await this.get<GetMySubscriptionResponse>(
      `${this.endpoint}/me`,
    )
    return response.data
  }

  /**
   * Historial/listado de suscripciones del usuario
   * Backend: GET /subscriptions
   */
  async listMySubscriptions(): Promise<ListMySubscriptionsResponse> {
    const response: AxiosResponse<ListMySubscriptionsResponse> = await this.get<ListMySubscriptionsResponse>(
      `${this.endpoint}`,
    )
    return response.data
  }

  /**
   * Iniciar compra/suscripción (plan de pago, provider, intervalo, trial opcional)
   * Backend: POST /subscriptions/start
   */
  async startSubscription(payload: StartSubscriptionRequest): Promise<StartSubscriptionResponse> {
    const response: AxiosResponse<StartSubscriptionResponse> = await this.post<StartSubscriptionResponse>(
      `${this.endpoint}/start`,
      payload,
    )
    return response.data
  }

  /**
   * Cancelar suscripción (inmediata o al final del periodo)
   * Backend: POST /subscriptions/cancel
   */
  async cancelMySubscription(payload: CancelMySubscriptionRequest = {}): Promise<CancelMySubscriptionResponse> {
    const response: AxiosResponse<CancelMySubscriptionResponse> = await this.post<CancelMySubscriptionResponse>(
      `${this.endpoint}/cancel`,
      payload,
    )
    return response.data
  }

  /**
   * Obtener los planes disponibles para pricing
   * Backend: GET /subscriptions/plans
   */
  async getPlans(): Promise<PricingPlan[]> {
    const response: AxiosResponse<GetPlansResponse> = await this.get<GetPlansResponse>(
      `${this.endpoint}/plans`,
    )
    return response.data.data
  }
}

const subscriptionsService = new SubscriptionsService()
export { subscriptionsService }
export default subscriptionsService