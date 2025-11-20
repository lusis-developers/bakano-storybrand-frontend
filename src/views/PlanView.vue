
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
const acceptTerms = ref(false)
const nationalId = ref('')
const phone = ref('')
const address = ref<{ street: string; city: string; state?: string; zipCode?: string; country: string }>({ street: '', city: '', state: '', zipCode: '', country: '' })
const identityError = ref<string | null>(null)

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
    identityError.value = null
    preparing.value = true

    if (!currentPlan.value) throw new Error('Plan inválido')
    if (!acceptTerms.value) throw new Error('Debes aceptar la Política de Privacidad y el Aviso Legal para continuar')

    const phoneRegex = /^[\+]?[1-9][\d]{6,15}$/
    const hasAddress = !!(address.value.street && address.value.city && address.value.country)
    if (!nationalId.value || nationalId.value.trim().length < 5) {
      identityError.value = 'Ingresa una cédula válida (mínimo 5 caracteres)'
      throw new Error(identityError.value)
    }
    if (!phone.value || !phoneRegex.test(phone.value)) {
      identityError.value = 'Ingresa un teléfono válido (ej: +593987654321)'
      throw new Error(identityError.value)
    }
    if (!hasAddress) {
      identityError.value = 'Dirección requerida: incluye calle, ciudad y país'
      throw new Error(identityError.value)
    }

    localStorage.setItem('pending_subscription_identity', JSON.stringify({
      nationalId: nationalId.value.trim(),
      phone: phone.value.trim(),
      address: {
        street: address.value.street?.trim(),
        city: address.value.city?.trim(),
        state: address.value.state?.trim(),
        zipCode: address.value.zipCode?.trim(),
        country: address.value.country?.trim(),
      },
    }))

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
          <div class="identity">
            <div class="identity__row">
              <label class="identity__label" for="nationalId">Cédula</label>
              <input
                id="nationalId"
                class="identity__input"
                type="text"
                placeholder="Ingrese su cédula"
                v-model.trim="nationalId"
                inputmode="numeric"
                autocomplete="off"
              />
            </div>
            <div class="identity__row">
              <label class="identity__label" for="phone">Teléfono</label>
              <input
                id="phone"
                class="identity__input"
                type="tel"
                placeholder="Ej: +593987654321"
                v-model.trim="phone"
                autocomplete="tel"
              />
            </div>
            <div class="identity__grid">
              <div class="identity__row">
                <label class="identity__label" for="street">Calle</label>
                <input id="street" class="identity__input" type="text" v-model.trim="address.street" placeholder="Calle y número" />
              </div>
              <div class="identity__row">
                <label class="identity__label" for="city">Ciudad</label>
                <input id="city" class="identity__input" type="text" v-model.trim="address.city" placeholder="Ciudad" />
              </div>
              <div class="identity__row">
                <label class="identity__label" for="state">Provincia/Estado</label>
                <input id="state" class="identity__input" type="text" v-model.trim="address.state" placeholder="Provincia/Estado" />
              </div>
              <div class="identity__row">
                <label class="identity__label" for="zip">Código Postal</label>
                <input id="zip" class="identity__input" type="text" v-model.trim="address.zipCode" placeholder="Código postal" />
              </div>
              <div class="identity__row">
                <label class="identity__label" for="country">País</label>
                <input id="country" class="identity__input" type="text" v-model.trim="address.country" placeholder="País" />
              </div>
            </div>
            <p v-if="identityError" class="identity__error">{{ identityError }}</p>
          </div>
          <div class="terms">
            <label class="terms__label">
              <input
                class="terms__checkbox"
                type="checkbox"
                :checked="acceptTerms"
                @change="acceptTerms = ($event.target as HTMLInputElement).checked"
              />
                  <span>
                    Acepto la
                    <a href="https://bakano.ec/politicas-privacidad" target="_blank" rel="noopener">Política de Privacidad</a>
                    y el
                    <a href="https://bakano.ec/aviso-legal" target="_blank" rel="noopener">Aviso Legal</a>
                  </span>
                </label>
              </div>
              <button
                class="btn btn--payphone btn--lg btn--block btn--with-icon"
                @click="preparePayment"
                :disabled="preparing || !acceptTerms"
                aria-label="Pagar con Payphone"
              >
                <span class="btn__icon" aria-hidden="true">
                  <i class="fas fa-credit-card"></i>
                </span>
                <span class="btn__label">
                  {{ preparing ? 'Preparando pago...' : 'Pagar ahora con Payphone' }}
                </span>
              </button>
              <div class="plan-card__trust">
                <span class="trust-item"><i class="fas fa-lock"></i> Pago seguro con Payphone</span>
                <span class="trust-item"><i class="fas fa-shield-halved"></i> Cancela cuando quieras</span>
              </div>
              <p v-if="error" class="plan-card__error">{{ error }}</p>
            </footer>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>


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
  flex-direction: column;
}

.identity {
  width: 100%;
  display: grid;
  gap: 10px;
}

.identity__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.identity__row {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 8px;
  align-items: center;
}

.identity__label {
  color: lighten($BAKANO-DARK, 35%);
  font-size: 12px;
}

.identity__input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid lighten($BAKANO-DARK, 80%);
  border-radius: 10px;
  font-size: 14px;
}

.identity__error {
  color: darken($BAKANO-PINK, 10%);
  font-size: 12px;
  text-align: center;
}

.terms {
  width: 100%;
  display: flex;
  justify-content: center;
}

.terms__label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: lighten($BAKANO-DARK, 35%);
}

.terms__checkbox {
  width: 18px;
  height: 18px;
  accent-color: $BAKANO-PINK;
}

.terms a {
  color: $BAKANO-PINK;
  text-decoration: none;
}

.terms a:hover {
  text-decoration: underline;
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
  animation: payPulse 2.6s ease-in-out infinite;
}

.btn--payphone:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 26px rgba(247, 115, 0, 0.35);
  filter: brightness(1.04);
}

.btn--payphone:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  animation: none;
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

.plan-card__trust {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 12px;
  color: lighten($BAKANO-DARK, 35%);
}

.plan-card__trust .trust-item i {
  color: $BAKANO-PINK;
}

@keyframes payPulse {

  0%,
  100% {
    transform: translateY(0);
    box-shadow: 0 10px 20px rgba(247, 115, 0, 0.28);
  }

  50% {
    transform: translateY(-1px);
    box-shadow: 0 14px 26px rgba(247, 115, 0, 0.35);
  }
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

  .identity__grid {
    grid-template-columns: 1fr;
  }

  .identity__row {
    grid-template-columns: 1fr;
  }
}
</style>