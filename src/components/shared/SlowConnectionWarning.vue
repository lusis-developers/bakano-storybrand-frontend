<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits<{
  close: []
}>()

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <Transition name="slide-down">
    <div v-if="show" class="slow-connection-warning">
      <div class="warning-content">
        <div class="warning-icon">
          <i class="fas fa-layer-group fa-lg"></i>
        </div>
        
        <div class="warning-text">
          <p class="warning-title">Conexión lenta detectada</p>
          <p class="warning-message">
            Estamos experimentando lentitud debido a tu conexión a internet. 
            Por favor, ten paciencia mientras cargamos el contenido.
          </p>
        </div>
        
        <button 
          @click="handleClose" 
          class="close-button"
          aria-label="Cerrar aviso"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="m18 6-12 12" stroke="currentColor" stroke-width="2"/>
            <path d="m6 6 12 12" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.slow-connection-warning {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  @media (max-width: 768px) {
    position: relative;
    margin: 0;
  }
}

.warning-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 0.875rem 1rem;
    gap: 0.75rem;
  }
}

.warning-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  
  svg {
    color: white;
  }
  
  @media (max-width: 768px) {
    width: 2rem;
    height: 2rem;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
}

.warning-text {
  flex: 1;
  min-width: 0;
}

.warning-title {
  font-weight: 600;
  font-size: 0.875rem;
  margin: 0 0 0.25rem 0;
  color: white;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
}

.warning-message {
  font-size: 0.8rem;
  margin: 0;
  opacity: 0.95;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
    line-height: 1.3;
  }
}

.close-button {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &:focus {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: 2px;
  }
  
  @media (max-width: 768px) {
    width: 1.75rem;
    height: 1.75rem;
    
    svg {
      width: 14px;
      height: 14px;
    }
  }
}

// Transiciones
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

// Animación de pulso para el icono
.warning-icon {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
</style>