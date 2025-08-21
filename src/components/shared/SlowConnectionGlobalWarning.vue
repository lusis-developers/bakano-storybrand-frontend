<script setup lang="ts">
import { showSlowWarning, hideSlowConnectionWarning } from '@/services/httpBase'

// Usar el estado global del httpBase
const isVisible = showSlowWarning
const hideWarning = hideSlowConnectionWarning
</script>

<template>
  <Teleport to="body">
    <Transition name="slide-down">
      <div v-if="isVisible" class="slow-connection-global-warning">
        <div class="warning-container">
          <div class="warning-content">
            <div class="warning-icon">
              <i class="fas fa-wifi" aria-hidden="true"></i>
            </div>
            <div class="warning-text">
              <h4>Conexión lenta detectada</h4>
              <p>Tu conexión a internet parece ser lenta. Los procesos pueden tardar más de lo habitual.</p>
            </div>
            <button 
              @click="hideWarning" 
              class="close-button"
              aria-label="Cerrar aviso"
            >
              <i class="fas fa-times" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
@import '@/styles/colorVariables.module.scss';

.slow-connection-global-warning {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  pointer-events: none;
  
  .warning-container {
    max-width: 100%;
    margin: 0 auto;
    padding: 1rem;
    pointer-events: auto;
    
    @media (min-width: 768px) {
      max-width: 600px;
      padding: 1rem 2rem;
    }
  }
  
  .warning-content {
    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
    color: white;
    padding: 1rem;
    border-radius: 0.75rem;
    box-shadow: 0 8px 32px rgba(255, 107, 53, 0.3);
    display: flex;
    align-items: center;
    gap: 1rem;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    @media (max-width: 767px) {
      padding: 0.875rem;
      gap: 0.75rem;
      border-radius: 0.5rem;
    }
  }
  
  .warning-icon {
    flex-shrink: 0;
    width: 2.5rem;
    height: 2.5rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    i {
      font-size: 1.25rem;
      animation: pulse 2s infinite;
    }
    
    @media (max-width: 767px) {
      width: 2rem;
      height: 2rem;
      
      i {
        font-size: 1rem;
      }
    }
  }
  
  .warning-text {
    flex: 1;
    min-width: 0;
    
    h4 {
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
      font-weight: 600;
      line-height: 1.2;
      
      @media (max-width: 767px) {
        font-size: 0.9rem;
      }
    }
    
    p {
      margin: 0;
      font-size: 0.875rem;
      opacity: 0.95;
      line-height: 1.3;
      
      @media (max-width: 767px) {
        font-size: 0.8rem;
      }
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
    
    i {
      font-size: 0.875rem;
    }
    
    @media (max-width: 767px) {
      width: 1.75rem;
      height: 1.75rem;
      
      i {
        font-size: 0.75rem;
      }
    }
  }
}

// Animaciones
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

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
</style>