<template>
  <div v-if="visible" class="alert-overlay" @click="handleOverlayClick">
    <div class="alert-container" @click.stop>
      <div class="alert-header">
        <div class="alert-icon">
          <i class="fas fa-exclamation-circle"></i>
        </div>
        <button class="close-button" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="alert-content">
        <h3 class="alert-title">Límite de Negocios Alcanzado</h3>
        <p class="alert-message">
          Alcanzaste el límite de tu plan actual. Mejora tu plan para crear más negocios y desbloquear beneficios.
        </p>

        <div v-if="plans && plans.length" class="plans">
          <div class="plans-grid">
            <div v-for="p in plans" :key="p.id || p.name" class="plan-card" :class="{ popular: p.isPopular }">
              <div class="plan-header">
                <span class="badge" v-if="p.isPopular">Recomendado</span>
                <div class="name">{{ p.name }}</div>
                <div class="price">
                  <span class="amount">{{ p.price }}</span>
                  <span class="currency">{{ p.currency }}</span>
                  <span v-if="p.interval" class="interval">/{{ p.interval }}</span>
                </div>
              </div>
              <div v-if="p.description" class="desc">{{ p.description }}</div>
              <ul v-if="p.features && p.features.length" class="features">
                <li v-for="f in p.features" :key="f" class="feature">{{ f }}</li>
              </ul>
              <button class="cta" type="button" @click="$emit('upgrade', p)">
                Mejorar ahora
                <i class="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="alert-actions">
        <button class="btn-secondary" @click="$emit('upgrade')">
          Ver planes
        </button>
        <button class="btn-primary" @click="$emit('close')">
          Entendido
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PricingPlan } from '@/services/subscriptions.service'

interface Props {
  visible: boolean
  plans?: PricingPlan[]
}

defineProps<Props>()
defineEmits<{ close: []; upgrade: [PricingPlan?] }>()

const handleOverlayClick = () => {}
</script>

<style scoped lang="scss">
@use 'sass:color';
.alert-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba($BAKANO-DARK, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.25rem;
}

.alert-container {
  background: $white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba($BAKANO-DARK, 0.1), 0 10px 10px -5px rgba($BAKANO-DARK, 0.04);
  max-width: 760px;
  width: 100%;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

.alert-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 0 1.5rem;
}

.alert-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: $alert-warning-bg;
  color: $alert-warning;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  i {
    font-size: 24px;
  }
}

.close-button {
  background: none;
  border: none;
  color: lighten($BAKANO-DARK, 35%);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  i {
    font-size: 16px;
  }

  &:hover {
    background-color: lighten($BAKANO-LIGHT, 4%);
    color: lighten($BAKANO-DARK, 35%);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba($BAKANO-PINK, 0.25);
  }
}

.alert-content {
  padding: 1.25rem 1.5rem;
}

.alert-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: $BAKANO-DARK;
  margin: 0 0 0.75rem 0;
  line-height: 1.3;
}

.alert-message {
  font-size: 1rem;
  color: lighten($BAKANO-DARK, 40%);
  line-height: 1.5;
  margin: 0;
}

.alert-actions {
  padding: 0 1.5rem 1.5rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-primary {
  background-color: $BAKANO-PINK;
  color: $white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: color.adjust($BAKANO-PINK, $lightness: -10%);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba($BAKANO-PINK, 0.25);
  }
}

.btn-secondary {
  background: transparent;
  color: $BAKANO-DARK;
  border: 1px solid lighten($BAKANO-DARK, 85%);
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: lighten($BAKANO-LIGHT, 4%);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba($BAKANO-PINK, 0.2);
  }
}

.plans {
  margin-top: 0.75rem;
}
.plans-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem; }
.plan-card { border: 1px solid lighten($BAKANO-DARK, 88%); border-radius: 14px; padding: 1rem; background: $white; box-shadow: 0 8px 18px rgba($BAKANO-DARK, 0.06); display: flex; flex-direction: column; gap: 0.625rem; transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease; }
.plan-card:hover { box-shadow: 0 12px 26px rgba($BAKANO-DARK, 0.08); transform: translateY(-2px); border-color: lighten($BAKANO-DARK, 82%); }
.plan-card.popular { border-color: $BAKANO-PINK; box-shadow: 0 10px 24px rgba($BAKANO-PINK, 0.18); }
.plan-header { display: grid; gap: 6px; }
.badge { align-self: start; font-size: 0.6875rem; padding: 0.25rem 0.5rem; border-radius: 999px; background: rgba($BAKANO-PINK, 0.12); color: $BAKANO-PINK; border: 1px solid lighten($BAKANO-PINK, 22%); font-weight: 700; }
.name { font-weight: 800; color: $BAKANO-DARK; font-size: 1.125rem; }
.price { display: flex; align-items: baseline; gap: 6px; }
.amount { font-size: 1.75rem; font-weight: 900; color: $BAKANO-PINK; }
.currency, .interval { font-size: 0.75rem; color: lighten($BAKANO-DARK, 40%); }
.desc { font-size: 0.8125rem; color: lighten($BAKANO-DARK, 40%); }
.features { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.feature { font-size: 0.75rem; color: lighten($BAKANO-DARK, 30%); display: flex; align-items: center; gap: 6px; }
.feature::before { content: '✓'; color: $BAKANO-PINK; font-weight: 900; }
.cta { margin-top: auto; display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.625rem 0.875rem; border-radius: 10px; background: $BAKANO-PINK; color: $white; border: 1px solid lighten($BAKANO-PINK, 8%); font-weight: 800; cursor: pointer; transition: transform 0.05s ease, box-shadow 0.2s ease, background 0.2s ease; }
.cta:hover { background: color.adjust($BAKANO-PINK, $lightness: -6%); box-shadow: 0 8px 18px rgba($BAKANO-PINK, 0.28); }
.cta:active { transform: translateY(1px); }
.cta:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba($BAKANO-PINK, 0.25); }

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 640px) {
  .alert-container {
    margin: 1.25rem;
    max-width: none;
  }

  .alert-header,
  .alert-content,
  .alert-actions {
    padding-left: 1.25rem;
    padding-right: 1.25rem;
  }

  .alert-title {
    font-size: 1.125rem;
  }

  .alert-message {
    font-size: 0.875rem;
  }
}
</style>