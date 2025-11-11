import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import subscriptionsService, {
  type ISubscriptionUserInfo,
  type StartSubscriptionRequest,
  type ISubscriptionRecord,
  type CancelMySubscriptionRequest,
  type PricingPlan,
} from '@/services/subscriptions.service'
import type { UserSubscription, SubscriptionStatus, BillingInterval, PaidPlan } from '@/types/user.types'

type SubscriptionsLoadingState = {
  me: boolean
  list: boolean
  start: boolean
  cancel: boolean
  plans: boolean
}

type SubscriptionsErrorState = {
  me: string | null
  list: string | null
  start: string | null
  cancel: string | null
  plans: string | null
}

export const useSubscriptionsStore = defineStore('subscriptionsStore', () => {
  // Estado principal
  const user = ref<ISubscriptionUserInfo | null>(null)
  const snapshot = ref<UserSubscription | null>(null)
  const derived = ref<{
    isActive: boolean
    isOnTrial: boolean
    remainingDays: number | null
    endsAt: string | null
    isExpired: boolean
  } | null>(null)

  const subscriptions = ref<ISubscriptionRecord[]>([])
  const availablePlans = ref<PricingPlan[]>([])

  // Carga y errores
  const loading = ref<SubscriptionsLoadingState>({ me: false, list: false, start: false, cancel: false, plans: false })
  const errors = ref<SubscriptionsErrorState>({ me: null, list: null, start: null, cancel: null, plans: null })

  // Getters
  const isLoading = computed(() => Object.values(loading.value).some(Boolean))
  const hasErrors = computed(() => Object.values(errors.value).some((e) => e !== null))

  const currentPlan = computed<'free' | PaidPlan>(() => snapshot.value?.plan || 'free')
  const currentStatus = computed<SubscriptionStatus>(() => snapshot.value?.status || 'free')
  const isActive = computed(() => derived.value?.isActive ?? false)
  const isOnTrial = computed(() => derived.value?.isOnTrial ?? false)
  const remainingDays = computed(() => derived.value?.remainingDays ?? null)
  const endsAt = computed(() => derived.value?.endsAt ?? null)
  const isExpired = computed(() => derived.value?.isExpired ?? false)
  const billingInterval = computed<BillingInterval | null>(() => snapshot.value?.billingInterval || null)

  // Acciones
  const clearErrors = () => {
    errors.value = { me: null, list: null, start: null, cancel: null, plans: null }
  }

  const resetState = () => {
    user.value = null
    snapshot.value = null
    derived.value = null
    subscriptions.value = []
    availablePlans.value = []
    clearErrors()
    loading.value = { me: false, list: false, start: false, cancel: false, plans: false }
  }

  /**
   * Cargar la suscripción actual del usuario (snapshot + datos derivados)
   */
  const fetchMySubscription = async () => {
    loading.value.me = true
    errors.value.me = null
    try {
      const res = await subscriptionsService.getMySubscription()
      user.value = res.data.user
      snapshot.value = res.data.snapshot
      derived.value = res.data.derived
    } catch (err: any) {
      const message = err?.message || 'Error al obtener tu suscripción'
      errors.value.me = message
    } finally {
      loading.value.me = false
    }
  }

  /**
   * Listado/historial de suscripciones del usuario
   */
  const listMySubscriptions = async () => {
    loading.value.list = true
    errors.value.list = null
    try {
      const res = await subscriptionsService.listMySubscriptions()
      subscriptions.value = Array.isArray(res.data) ? res.data : []
    } catch (err: any) {
      const message = err?.message || 'Error al obtener el historial de suscripciones'
      errors.value.list = message
    } finally {
      loading.value.list = false
    }
  }

  /**
   * Iniciar suscripción (opcionalmente con trial)
   */
  const startSubscription = async (payload: StartSubscriptionRequest) => {
    loading.value.start = true
    errors.value.start = null
    try {
      const res = await subscriptionsService.startSubscription(payload)
      // Opcional: actualizar el historial con el nuevo registro
      if (res?.data) {
        subscriptions.value = [res.data, ...subscriptions.value]
      }
      // Importante: refrescar snapshot/derived del usuario
      await fetchMySubscription()
    } catch (err: any) {
      const message = err?.message || 'No se pudo iniciar la suscripción'
      errors.value.start = message
      throw err
    } finally {
      loading.value.start = false
    }
  }

  /**
   * Cancelar suscripción (inmediata o al final del periodo)
   */
  const cancelMySubscription = async (payload: CancelMySubscriptionRequest = {}) => {
    loading.value.cancel = true
    errors.value.cancel = null
    try {
      await subscriptionsService.cancelMySubscription(payload)
      // Refrescar snapshot/derived tras la cancelación
      await fetchMySubscription()
    } catch (err: any) {
      const message = err?.message || 'No se pudo cancelar la suscripción'
      errors.value.cancel = message
      throw err
    } finally {
      loading.value.cancel = false
    }
  }

  /**
   * Obtener planes disponibles para mostrar en Pricing
   */
  const fetchAvailablePlans = async () => {
    loading.value.plans = true
    errors.value.plans = null
    try {
      const plans = await subscriptionsService.getPlans()
      availablePlans.value = plans
    } catch (err: any) {
      const message = err?.message || 'Error al obtener los planes disponibles'
      errors.value.plans = message
    } finally {
      loading.value.plans = false
    }
  }

  return {
    // Estado
    user,
    snapshot,
    derived,
    subscriptions,
    availablePlans,
    loading,
    errors,

    // Getters
    isLoading,
    hasErrors,
    currentPlan,
    currentStatus,
    isActive,
    isOnTrial,
    remainingDays,
    endsAt,
    isExpired,
    billingInterval,

    // Acciones
    fetchMySubscription,
    listMySubscriptions,
    startSubscription,
    cancelMySubscription,
    fetchAvailablePlans,
    clearErrors,
    resetState,
  }
})

export default useSubscriptionsStore