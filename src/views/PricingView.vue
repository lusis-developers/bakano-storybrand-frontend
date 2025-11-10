<template>
  <section class="pricing">
    <div class="container">
      <header class="pricing__header">
        <h1>Planes y precios</h1>
        <p>Elige el plan que mejor se adapte a tu negocio.</p>
      </header>

      <div class="pricing__grid">
        <!-- Free -->
        <article class="card">
          <div class="card__badge">Gratis</div>
          <h2 class="card__title">Free</h2>
          <div class="card__price">
            <span class="card__currency">$</span>
            <span class="card__amount">0</span>
            <span class="card__period">/mes</span>
          </div>
          <ul class="card__features">
            <li>Ideal para probar</li>
            <li>Funciones básicas</li>
            <li>Hasta 1 marca</li>
          </ul>
          <router-link class="card__cta" :to="{ name: 'register' }">Comenzar</router-link>
        </article>

        <!-- Starter -->
        <article class="card card--featured">
          <div class="card__badge">Popular</div>
          <h2 class="card__title">Starter</h2>
          <div class="card__price">
            <span class="card__currency">$</span>
            <span class="card__amount">18</span>
            <span class="card__period">/mes</span>
          </div>
          <ul class="card__features">
            <li>Todo lo que hacemos</li>
            <li>Hasta 3 marcas</li>
            <li>Soporte por correo</li>
          </ul>
          <router-link
            class="card__cta card__cta--primary"
            :to="starterCtaTo"
          >
            {{ starterCtaLabel }}
          </router-link>
        </article>

        <!-- Advanced -->
        <article class="card">
          <div class="card__badge">Avanzado</div>
          <h2 class="card__title">Advanced</h2>
          <div class="card__price">
            <span class="card__currency">$</span>
            <span class="card__amount">49</span>
            <span class="card__period">/mes</span>
          </div>
          <ul class="card__features">
            <li>Hasta 10 marcas</li>
            <li>Todo lo del Starter</li>
            <li>Soporte prioritario</li>
          </ul>
          <router-link
            class="card__cta"
            :to="advancedCtaTo"
          >
            {{ advancedCtaLabel }}
          </router-link>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)

// CTAs dinámicos por plan
const starterCtaTo = computed(() =>
  isAuthenticated.value ? { name: 'dashboard', query: { plan: 'starter' } } : { name: 'register' },
)
const starterCtaLabel = computed(() => (isAuthenticated.value ? 'Adquirir ahora' : 'Registrarme y adquirir'))

const advancedCtaTo = computed(() =>
  isAuthenticated.value ? { name: 'dashboard', query: { plan: 'advanced' } } : { name: 'register' },
)
const advancedCtaLabel = computed(() => (isAuthenticated.value ? 'Adquirir ahora' : 'Registrarme y adquirir'))
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
  color: $BAKANO-PURPLE;
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
</style>