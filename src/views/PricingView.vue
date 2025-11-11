<template>
  <section class="pricing">
    <div class="container">
      <header class="pricing__header">
        <h1>Planes y precios</h1>
        <p>Elige el plan que mejor se adapte a tu negocio.</p>
      </header>

      <!-- Estados de carga y error -->
      <div v-if="isLoadingPlans" class="pricing__loading">Cargando planes...</div>
      <div v-else>
        <div v-if="plansError" class="pricing__error">{{ plansError }}</div>

        <div class="pricing__grid">
          <article
            v-for="plan in processedPlans"
            :key="plan.name"
            class="card"
            :class="{ 'card--featured': !!plan.isPopular }"
          >
            <div v-if="badgeText(plan)" class="card__badge">{{ badgeText(plan) }}</div>
            <h2 class="card__title">{{ plan.name }}</h2>
            <div class="card__price">
              <span class="card__currency">{{ currencySymbol(plan.currency) }}</span>
              <span class="card__amount">{{ plan.price }}</span>
              <span class="card__period">/{{ intervalLabel('month') }}</span>
            </div>
            <ul class="card__features">
              <li v-for="(feat, i) in plan.features" :key="i">{{ feat }}</li>
            </ul>
            <router-link
              class="card__cta"
              :class="{ 'card__cta--primary': !!plan.isPopular }"
              :to="ctaToForPlan(plan)"
            >
              {{ ctaLabelForPlan(plan) }}
            </router-link>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import useSubscriptionsStore from '@/stores/subscriptions.store'
import type { PricingPlan } from '@/services/subscriptions.service'

const authStore = useAuthStore()
const subscriptionsStore = useSubscriptionsStore()

onMounted(() => {
  if (!subscriptionsStore.availablePlans.length && !subscriptionsStore.loading.plans) {
    subscriptionsStore.fetchAvailablePlans()
  }
})

const isAuthenticated = computed(() => authStore.isAuthenticated)
const plans = computed(() => subscriptionsStore.availablePlans)
const isLoadingPlans = computed(() => subscriptionsStore.loading.plans)
const plansError = computed(() => subscriptionsStore.errors.plans)

const slugify = (name: string) => name.toLowerCase().replace(/\s+/g, '-')
const intervalLabel = (interval: string) => (interval === 'year' ? 'año' : 'mes')
const currencySymbol = (currency: string) => (currency === 'USD' ? '$' : currency)

// Features de UI por nombre de plan (el backend no las envía)
const planFeaturesByName: Record<string, string[]> = {
  Free: ['Ideal para probar', 'Funciones básicas', 'Hasta 1 marca'],
  Starter: ['Todo lo que hacemos', 'Hasta 3 marcas', 'Soporte por correo'],
  Advanced: ['Hasta 10 marcas', 'Todo lo del Starter', 'Soporte prioritario'],
}

// Decorar los planes obtenidos con features e indicador de popular
const processedPlans = computed(() => {
  return plans.value.map((p) => ({
    ...p,
    features: planFeaturesByName[p.name] ?? [],
    isPopular: p.name === 'Starter',
  })) as PricingPlan[]
})

const badgeText = (plan: PricingPlan) => {
  if (plan.price === 0) return 'Gratis'
  if (plan.isPopular) return 'Popular'
  return ''
}

const ctaToForPlan = (plan: PricingPlan) => {
  const planSlug = slugify(plan.name)
  // Si es el plan Free, dirigir al dashboard con ?plan=free cuando ya está loggeado
  if (plan.price === 0) {
    return isAuthenticated.value
      ? { name: 'dashboard', query: { plan: 'free' } }
      : { name: 'register' }
  }
  // Para planes de pago: si está loggeado, ir a la página del plan para preparar el pago; si no, registro
  return isAuthenticated.value
    ? { name: 'plan', params: { slug: planSlug } }
    : { name: 'register' }
}

const ctaLabelForPlan = (plan: PricingPlan) => {
  if (plan.price === 0) return isAuthenticated.value ? 'Ir al dashboard' : 'Comenzar'
  // Para planes de pago, siempre mostrar "Adquirir" (registro si no está loggeado, dashboard si sí)
  return 'Adquirir'
}
</script>

<style scoped lang="scss">
.pricing {
  padding: 48px 0;
  background: $BAKANO-LIGHT;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 16px;
}

.pricing__header {
  text-align: center;
  margin-bottom: 32px;
}

.pricing__header h1 {
  margin: 0 0 8px;
  font-size: 28px;
  color: $BAKANO-DARK;
}

.pricing__header p {
  margin: 0;
  color: lighten($BAKANO-DARK, 35%);
}

.pricing__grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;
}

@media (min-width: 768px) {
  .pricing__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.card {
  border: 1px solid lighten($BAKANO-DARK, 70%);
  border-radius: 12px;
  padding: 24px;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.card--featured {
  border-color: $BAKANO-PINK;
  box-shadow: 0 8px 20px rgba(230, 40, 92, 0.15);
}

.card__badge {
  font-size: 12px;
  color: $BAKANO-PINK;
  font-weight: 600;
  margin-bottom: 8px;
}

.card__title {
  margin: 0 0 12px;
  font-size: 22px;
  color: $BAKANO-DARK;
}

.card__price {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 16px;
}

.card__currency {
  font-weight: 600;
  color: $BAKANO-DARK;
}

.card__amount {
  font-size: 28px;
  font-weight: 700;
  color: $BAKANO-DARK;
}

.card__period {
  color: lighten($BAKANO-DARK, 35%);
}

.card__features {
  list-style: none;
  padding: 0;
  margin: 0 0 16px;
}

.card__features li {
  margin: 8px 0;
  color: $BAKANO-DARK;
}

.card__cta {
  margin-top: auto;
  display: inline-block;
  text-align: center;
  padding: 10px 14px;
  background: lighten($BAKANO-LIGHT, 4%);
  border-radius: 8px;
  color: $BAKANO-DARK;
  text-decoration: none;
}

.card__cta--primary {
  background: $BAKANO-PINK;
  color: #fff;
}

.card__cta:hover {
  filter: brightness(0.98);
}

.card__cta--primary:hover {
  filter: brightness(0.95);
}

.pricing__loading,
.pricing__error {
  text-align: center;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.pricing__loading {
  background: lighten($BAKANO-LIGHT, 6%);
  color: $BAKANO-DARK;
}

.pricing__error {
  background: lighten($BAKANO-PINK, 40%);
  color: $BAKANO-DARK;
}
</style>