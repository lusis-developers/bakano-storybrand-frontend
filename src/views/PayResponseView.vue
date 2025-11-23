<template>
  <section class="pay-response">
    <div class="container">
      <div class="card">
        <header class="card__header">
          <h1 class="card__title">Estado del pago</h1>
          <p class="card__subtitle">Validando información de Payphone…</p>
        </header>

        <div v-if="loading" class="card__loading">Procesando…</div>

        <div v-else>
          <div v-if="error" class="card__error">
            <strong>Error:</strong> {{ error }}
          </div>

          <div v-else class="result">
            <div class="result__status" :class="statusClass">
              <span class="result__icon" aria-hidden="true">
                <svg v-if="isApproved" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0a12 12 0 1 0 12 12A12.013 12.013 0 0 0 12 0zm-1.2 17.4L6 12.6l1.8-1.8 3 3 5.4-5.4L18 10.2z" />
                </svg>
                <svg v-else-if="isRejected" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0a12 12 0 1 0 12 12A12.013 12.013 0 0 0 12 0zm5 15.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12z"/>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm1 15h-2v-2h2zm0-4h-2V7h2z"/>
                </svg>
              </span>
              <div class="result__texts">
                <h2 class="result__title">{{ statusLabel }}</h2>
                <p class="result__desc">{{ helperText }}</p>
              </div>
            </div>

            <dl class="details">
              <div class="details__row">
                <dt>Transacción (id)</dt>
                <dd>{{ id }}</dd>
              </div>
              <div class="details__row">
                <dt>Client Transaction Id</dt>
                <dd>{{ clientTransactionId }}</dd>
              </div>
              <div class="details__row" v-if="planSlug">
                <dt>Plan</dt>
                <dd>{{ planName }}</dd>
              </div>
              <div class="details__row" v-if="providerMessage">
                <dt>Mensaje del proveedor</dt>
                <dd>{{ providerMessage }}</dd>
              </div>
            </dl>

            <div class="actions">
              <button class="btn btn--primary" @click="goDashboard">Ir al dashboard</button>
              <button class="btn btn--secondary" @click="goPricing">Ver otros planes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import payphoneService from '@/services/payphone.service'
import subscriptionsService from '@/services/subscriptions.service'

const route = useRoute()
const router = useRouter()

const id = computed(() => String(route.query.id || ''))
const clientTransactionId = computed(() => String(route.query.clientTransactionId || ''))

const loading = ref(true)
const error = ref<string | null>(null)
const status = ref<string>('Pending')
const providerMessage = ref<string>('')

const planSlug = computed(() => {
  const parts = clientTransactionId.value.split('-')
  return parts.length >= 3 ? parts[1] : ''
})
const planName = computed(() => planSlug.value ? planSlug.value.charAt(0).toUpperCase() + planSlug.value.slice(1) : '')

const isApproved = computed(() => /approved/i.test(status.value))
const isRejected = computed(() => /reject/i.test(status.value))

const statusLabel = computed(() => {
  if (isApproved.value) return 'Pago aprobado'
  if (isRejected.value) return 'Pago rechazado'
  return 'Pago pendiente'
})

const helperText = computed(() => {
  if (isApproved.value) return 'Tu compra fue confirmada. Estamos activando tu suscripción…'
  if (isRejected.value) return 'El pago fue rechazado o cancelado. Puedes intentar nuevamente.'
  return 'Estamos validando la transacción con Payphone.'
})

onMounted(async () => {
  try {
    if (!id.value) throw new Error('Identificador de transacción no recibido (id).')
    error.value = null

    const res = await payphoneService.confirmButton(id.value)
    // Normalizar campo de estado
    status.value = res?.transactionStatus || res?.status || 'Pending'
    providerMessage.value = res?.message || ''

    // Activar suscripción si está aprobado (best-effort)
    if (isApproved.value && planSlug.value) {
      try {
        const identityRaw = localStorage.getItem('pending_subscription_identity')
        const identity = identityRaw ? JSON.parse(identityRaw) : null

        await subscriptionsService.startSubscription({
          plan: planSlug.value as any,
          billingInterval: 'monthly',
          provider: 'payphone',
          nationalId: identity?.nationalId,
          phone: identity?.phone,
          address: identity?.address,
        })
        localStorage.removeItem('pending_subscription_identity')
      } catch (_) {
        // Silenciar errores aquí; el backend puede activar vía webhook igualmente
      }
    }
  } catch (e: any) {
    error.value = e?.message || 'No se pudo validar el pago.'
  } finally {
    loading.value = false
  }
})

const goDashboard = () => router.push({ name: 'dashboard' })
const goPricing = () => router.push({ name: 'pricing' })
</script>

<style scoped lang="scss">
.pay-response {
  background: linear-gradient(180deg, lighten($BAKANO-LIGHT, 4%) 0%, $BAKANO-LIGHT 100%);
  padding: 56px 0;
}

.container {
  max-width: 820px;
  margin: 0 auto;
  padding: 0 20px;
}

.card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  padding: 24px;
}

.card__header {
  text-align: center;
  margin-bottom: 16px;
}

.card__title {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  color: $BAKANO-DARK;
}

.card__subtitle {
  color: lighten($BAKANO-DARK, 35%);
}

.card__loading {
  text-align: center;
  color: $BAKANO-DARK;
}

.card__error {
  color: darken($BAKANO-PINK, 10%);
  background: rgba($BAKANO-PINK, 0.08);
  border: 1px solid rgba($BAKANO-PINK, 0.3);
  padding: 12px;
  border-radius: 10px;
}

.result__status {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 16px;
}

.result__status.success {
  background: rgba(68, 189, 81, 0.08);
  border: 1px solid rgba(68, 189, 81, 0.3);
  color: #2f9e44;
}

.result__status.pending {
  background: rgba(250, 184, 47, 0.08);
  border: 1px solid rgba(250, 184, 47, 0.3);
  color: #b08900;
}

.result__status.error {
  background: rgba(244, 63, 94, 0.08);
  border: 1px solid rgba(244, 63, 94, 0.3);
  color: #c0003b;
}

.result__title {
  margin: 0;
  font-weight: 800;
}

.result__desc {
  margin: 2px 0 0;
  color: lighten($BAKANO-DARK, 30%);
}

.details {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin: 12px 0 20px;
}

.details__row {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 10px;
  align-items: center;
}

.details dt {
  color: lighten($BAKANO-DARK, 30%);
}

.details dd {
  color: $BAKANO-DARK;
  margin: 0;
  font-weight: 700;
}

.actions {
  display: flex;
  gap: 10px;
}

.btn {
  display: inline-block;
  padding: 12px 18px;
  border-radius: 12px;
  font-weight: 700;
  text-align: center;
}

.btn--primary {
  background: #f77300;
  color: #fff;
  box-shadow: 0 10px 20px rgba(247, 115, 0, 0.28);
  border: 1px solid rgba(247, 115, 0, 0.6);
}

.btn--secondary {
  background: #fff;
  color: $BAKANO-DARK;
  border: 1px solid lighten($BAKANO-DARK, 80%);
}

.btn--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 26px rgba(247, 115, 0, 0.35);
}
</style>

<script lang="ts">
// Helper computed for dynamic class in template scope
export default {
  computed: {
    statusClass(): string {
      // @ts-ignore - accessed from <script setup> reactive ref
      const s = (this as any).status?.toLowerCase?.() || 'pending'
      if (s.includes('approve')) return 'success'
      if (s.includes('reject')) return 'error'
      return 'pending'
    },
  },
}
</script>