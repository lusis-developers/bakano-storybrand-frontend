<script setup lang="ts">
const emit = defineEmits<{
  scrollToScripts: []
}>()

const handleScrollToScripts = () => {
  emit('scrollToScripts')
}
</script>

<template>
  <div class="progress-indicator">
    <div class="progress-step completed">
      <div class="step-circle">
        <i class="fas fa-check"></i>
      </div>
      <div class="step-label">
        <h4>Soundbites y Taglines Generados</h4>
        <p>Soundbites y taglines listos</p>
      </div>
    </div>
    
    <div class="progress-connector"></div>
    
    <div class="progress-step current" @click="handleScrollToScripts" style="cursor: pointer;">
      <div class="step-circle">
        <i class="fas fa-file-alt"></i>
      </div>
      <div class="step-label">
        <h4>Ver Sección de Scripts <i class="fas fa-arrow-down click-indicator"></i></h4>
        <p>Gestionar y crear nuevos scripts</p>
      </div>
    </div>
    
    <div class="progress-connector disabled"></div>
    
    <div class="progress-step disabled">
      <div class="step-circle">
        <i class="fas fa-rocket"></i>
      </div>
      <div class="step-label">
        <h4>Lanzar Campañas</h4>
        <p>Usar scripts en marketing</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';

.progress-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
  }
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;

  @media (max-width: 768px) {
    flex-direction: row;
    text-align: left;
    width: 100%;
  }

  &.completed {
    .step-circle {
      background: #10b981;
      color: white;
      border-color: #10b981;
    }

    .step-label h4 {
      color: #10b981;
    }
  }

  &.current {
    .step-circle {
      background: #667eea;
      color: white;
      border-color: #667eea;
      animation: pulse 2s infinite;
    }

    .step-label h4 {
      color: #667eea;
      font-weight: 700;
    }

    &:hover {
      transform: translateY(-2px);
      
      .step-circle {
        transform: scale(1.05);
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      }
      
      .step-label h4 {
        color: #5a67d8;
      }
    }

    transition: all 0.3s ease;
  }

  &.disabled {
    opacity: 0.5;

    .step-circle {
      background: #f1f5f9;
      color: #94a3b8;
      border-color: #e2e8f0;
    }

    .step-label h4 {
      color: #94a3b8;
    }

    .step-label p {
      color: #cbd5e1;
    }
  }
}

.step-circle {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  border: 3px solid #e2e8f0;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    width: 3rem;
    height: 3rem;
    font-size: 1rem;
    margin-bottom: 0;
    margin-right: 1rem;
  }
}

.step-label {
  h4 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
    color: #1e293b;

    @media (max-width: 768px) {
      font-size: 0.875rem;
    }
  }

  p {
    font-size: 0.875rem;
    color: #64748b;
    margin: 0;

    @media (max-width: 768px) {
      font-size: 0.75rem;
    }
  }
}

.progress-connector {
  width: 4rem;
  height: 2px;
  background: #10b981;
  margin: 0 1rem;

  @media (max-width: 768px) {
    width: 2px;
    height: 2rem;
    margin: 0;
  }

  &.disabled {
    background: #e2e8f0;
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(102, 126, 234, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0);
  }
}

.click-indicator {
  font-size: 0.75rem;
  margin-left: 0.5rem;
  opacity: 0.7;
  animation: bounce 2s infinite;
  
  @media (max-width: 768px) {
    font-size: 0.625rem;
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-3px);
  }
  60% {
    transform: translateY(-2px);
  }
}
</style>