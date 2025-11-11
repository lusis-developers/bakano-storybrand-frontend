<template>
  <section class="plan">
    <div class="container">
      <div class="plan__wrap">
        <header class="plan__header">
          <h1 class="plan__title">{{ planName }}</h1>
          <p class="plan__subtitle">Elige el plan ideal para tu negocio</p>
        </header>

        <div v-if="loading" class="plan__loading">Cargando plan...</div>
        <div v-else>
          <div v-if="!currentPlan" class="plan__error">No se encontró el plan solicitado.</div>

          <article v-else class="plan-card">
            <header class="plan-card__head">
              <div class="plan-card__title-row">
                <h2 class="plan-card__title">{{ currentPlan.name }}</h2>
                <span v-if="currentPlan.name === 'Starter'" class="plan-card__badge">Popular</span>
              </div>

              <div class="plan-card__price">
                <span class="plan-card__currency">{{ currencySymbol(currency) }}</span>
                <span class="plan-card__amount">{{ planPrice }}</span>
                <span class="plan-card__period">/mes</span>
              </div>
            </header>

            <ul class="plan-card__features">
              <li class="feature" v-for="(feat, i) in features" :key="i">{{ feat }}</li>
            </ul>

            <footer class="plan-card__cta">
              <button
                class="btn btn--payphone btn--lg btn--block btn--with-icon"
                @click="preparePayment"
                :disabled="preparing"
                aria-label="Pagar con Payphone"
              >
                <span class="btn__icon" aria-hidden="true">
                  <!-- Simple credit card icon -->
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 7a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7zm3-1h14a1 1 0 0 1 1 1v1H4V7a1 1 0 0 1 1-1zm-1 5h16v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6zm3 4a1 1 0 1 0 0 2h3a1 1 0 1 0 0-2H7z" />
                  </svg>
                </span>
                <span class="btn__label">
                  {{ preparing ? 'Preparando pago...' : 'Pagar ahora con Payphone' }}
                </span>
              </button>
              <p v-if="error" class="plan-card__error">{{ error }}</p>
            </footer>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import useSubscriptionsStore from '@/stores/subscriptions.store'
import { dollarsToCents, generateTransactionId, PAYPHONE_CONFIG } from '@/config/payphone'
import payphoneService from '@/services/payphone.service'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const subscriptionsStore = useSubscriptionsStore()

const slug = computed(() => String(route.params.slug || '').toLowerCase())
const planName = computed(() => slug.value.charAt(0).toUpperCase() + slug.value.slice(1))

const loading = ref(true)
const error = ref<string | null>(null)
const preparing = ref(false)

onMounted(async () => {
  // Si no está autenticado, regresar al registro
  if (!authStore.isAuthenticated) {
    router.push({ name: 'register' })
    return
  }

  try {
    if (!subscriptionsStore.availablePlans.length && !subscriptionsStore.loading.plans) {
      await subscriptionsStore.fetchAvailablePlans()
    }
  } catch (e: any) {
    error.value = e?.message || 'Error al cargar los planes'
  } finally {
    loading.value = false
  }
})

const plans = computed(() => subscriptionsStore.availablePlans)
const currentPlan = computed(() => plans.value.find((p) => p.name.toLowerCase() === slug.value))
const currency = computed(() => currentPlan.value?.currency || PAYPHONE_CONFIG.CURRENCY)
const planPrice = computed<number | null>(() => (currentPlan.value ? currentPlan.value.price : null))
const featuresByName: Record<string, string[]> = {
  Free: ['Ideal para probar', 'Funciones básicas', 'Hasta 1 marca'],
  Starter: ['Todo lo que hacemos', 'Hasta 3 marcas', 'Soporte por correo'],
  Advanced: ['Hasta 10 marcas', 'Todo lo del Starter', 'Soporte prioritario'],
}
const features = computed(() => featuresByName[currentPlan.value?.name || planName.value] || [])

const currencySymbol = (cur: string) => (cur === 'USD' ? '$' : cur)

const preparePayment = async () => {
  try {
    error.value = null
    preparing.value = true

    if (!currentPlan.value) throw new Error('Plan inválido')

    // Precio a cobrar: siempre el precio del plan
    const dollars = currentPlan.value.price
    const amount = dollarsToCents(dollars)

    const clientTransactionId = generateTransactionId(slug.value)

    const tx = {
      amount,
      amountWithoutTax: amount, // Mantener coherencia: suma = amount
      tax: 0,
      service: 0,
      tip: 0,
      currency: currency.value,
      reference: `${currentPlan.value.name} - ${slug.value}`,
      clientTransactionId,
      storeId: PAYPHONE_CONFIG.STORE_ID,
      responseUrl: PAYPHONE_CONFIG.RESPONSE_URL,
      cancellationUrl: PAYPHONE_CONFIG.CANCEL_URL,
    }

    const res = await payphoneService.prepareButton(tx)

    if (res?.payWithPayPhone) {
      window.location.href = res.payWithPayPhone
    } else {
      throw new Error(res?.message || 'No se pudo obtener la URL de pago')
    }
  } catch (e: any) {
    error.value = e?.message || 'Error al preparar el pago'
  } finally {
    preparing.value = false
  }
}
</script>

<style scoped lang="scss">
.plan {
  padding: 64px 0;
  background: linear-gradient(180deg, lighten($BAKANO-LIGHT, 4%) 0%, $BAKANO-LIGHT 100%);
}

.container {
  max-width: 980px;
  margin: 0 auto;
  padding: 0 20px;
}

.plan__wrap {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.plan__header {
  text-align: center;
}

.plan__title {
  margin: 0;
  font-size: 32px;
  font-weight: 800;
  color: $BAKANO-DARK;
}

.plan__subtitle {
  margin-top: 6px;
  color: lighten($BAKANO-DARK, 35%);
}

.plan-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  padding: 24px;
}

.plan-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid lighten($BAKANO-DARK, 80%);
  padding-bottom: 16px;
  margin-bottom: 16px;
}

.plan-card__title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.plan-card__title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: $BAKANO-DARK;
}

.plan-card__badge {
  display: inline-block;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: $BAKANO-PINK;
  border-radius: 999px;
}

.plan-card__price {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.plan-card__currency {
  font-weight: 700;
  color: $BAKANO-DARK;
}

.plan-card__amount {
  font-size: 32px;
  font-weight: 800;
  color: $BAKANO-DARK;
}

.plan-card__period {
  color: lighten($BAKANO-DARK, 35%);
}

.plan-card__features {
  list-style: none;
  padding: 0;
  margin: 0 0 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 16px;
}

.feature {
  position: relative;
  padding-left: 24px;
  color: $BAKANO-DARK;
}

.feature::before {
  content: '✓';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  color: $BAKANO-PINK;
  font-weight: 800;
}

.plan-card__cta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn {
  display: inline-block;
  padding: 12px 18px;
  border-radius: 12px;
  text-align: center;
  text-decoration: none;
  font-weight: 700;
}

.btn--payphone {
  /* Primary brand color requested */
  background: #f77300;
  color: #fff;
  box-shadow: 0 10px 20px rgba(247, 115, 0, 0.28);
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
  border: 1px solid rgba(247, 115, 0, 0.6);
}

.btn--payphone:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 26px rgba(247, 115, 0, 0.35);
  filter: brightness(1.04);
}

.btn--payphone:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn--payphone:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(247, 115, 0, 0.25), 0 12px 22px rgba(247, 115, 0, 0.28);
}

.btn--lg {
  padding: 14px 22px;
  font-size: 16px;
}

.btn--block {
  width: 100%;
}

.btn--with-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn__icon {
  display: inline-flex;
  align-items: center;
}

.plan-card__error {
  color: darken($BAKANO-PINK, 10%);
}

.plan__loading {
  color: $BAKANO-DARK;
  text-align: center;
}

.plan__error {
  color: darken($BAKANO-PINK, 10%);
  text-align: center;
}

@media (max-width: 720px) {
  .plan-card__features {
    grid-template-columns: 1fr;
  }
  .plan-card__head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>