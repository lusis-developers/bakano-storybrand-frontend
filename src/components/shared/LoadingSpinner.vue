<script setup lang="ts">
interface Props {
  message?: string
  size?: 'small' | 'medium' | 'large'
  showMessage?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  message: 'Cargando...',
  size: 'medium',
  showMessage: true
})
</script>

<template>
  <div class="loading-spinner" :class="`loading-spinner--${size}`">
    <div class="spinner">
      <div class="spinner__circle"></div>
      <div class="spinner__circle"></div>
      <div class="spinner__circle"></div>
    </div>
    
    <div v-if="showMessage" class="loading-message">
      {{ message }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  
  &--small {
    .spinner {
      width: 2rem;
      height: 2rem;
    }
    
    .loading-message {
      font-size: 0.875rem;
    }
  }
  
  &--medium {
    .spinner {
      width: 3rem;
      height: 3rem;
    }
    
    .loading-message {
      font-size: 1rem;
    }
  }
  
  &--large {
    .spinner {
      width: 4rem;
      height: 4rem;
    }
    
    .loading-message {
      font-size: 1.125rem;
    }
  }
}

.spinner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &__circle {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 3px solid transparent;
    border-top: 3px solid var(--primary-color, #3b82f6);
    border-radius: 50%;
    animation: spin 1.2s linear infinite;
    
    &:nth-child(1) {
      animation-delay: 0s;
      opacity: 1;
    }
    
    &:nth-child(2) {
      animation-delay: 0.4s;
      opacity: 0.7;
      transform: scale(0.8);
    }
    
    &:nth-child(3) {
      animation-delay: 0.8s;
      opacity: 0.4;
      transform: scale(0.6);
    }
  }
}

.loading-message {
  color: var(--text-secondary, #6b7280);
  font-weight: 500;
  text-align: center;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>