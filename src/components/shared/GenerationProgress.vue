<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'

interface Props {
  isGenerating: boolean
  message?: string
  showProgress?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  message: 'Generando soundbites y taglines...',
  showProgress: true
})

const progress = ref(0)
const currentMessage = ref(props.message)
let progressInterval: number | null = null
let messageInterval: number | null = null

const generationMessages = [
  '<i class="fas fa-bullseye"></i> Analizando tu información empresarial...',
  '<i class="fas fa-sparkles"></i> Creando soundbites únicos para tu marca...',
  '<i class="fas fa-rocket"></i> Generando taglines personalizados...',
  '<i class="fas fa-lightbulb"></i> Aplicando la metodología StoryBrand...',
  '<i class="fas fa-palette"></i> Puliendo soundbites y taglines finales...'
]

let messageIndex = 0

function startProgress() {
  progress.value = 0
  messageIndex = 0
  currentMessage.value = generationMessages[0]
  
  // Simular progreso
  progressInterval = setInterval(() => {
    if (progress.value < 90) {
      progress.value += Math.random() * 15
      if (progress.value > 90) progress.value = 90
    }
  }, 800)
  
  // Cambiar mensajes
  messageInterval = setInterval(() => {
    messageIndex = (messageIndex + 1) % generationMessages.length
    currentMessage.value = generationMessages[messageIndex]
  }, 3000)
}

function stopProgress() {
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
  if (messageInterval) {
    clearInterval(messageInterval)
    messageInterval = null
  }
  progress.value = 100
  currentMessage.value = '<i class="fas fa-check-circle"></i> ¡Soundbites y taglines generados exitosamente!'
}

onMounted(() => {
  if (props.isGenerating) {
    startProgress()
  }
})

onUnmounted(() => {
  stopProgress()
})

// Watch para cambios en isGenerating
watch(() => props.isGenerating, (newValue: boolean) => {
  if (newValue) {
    startProgress()
  } else {
    stopProgress()
  }
})

// Watch para cambios en el mensaje externo
watch(() => props.message, (newMessage: string) => {
  if (newMessage && newMessage !== 'Generando soundbites y taglines...') {
    currentMessage.value = newMessage
  }
})
</script>

<template>
  <div v-if="isGenerating" class="generation-progress">
    <div class="generation-progress__container">
      <!-- Spinner principal -->
      <div class="generation-progress__spinner">
        <LoadingSpinner 
          :message="currentMessage" 
          size="large" 
          :show-message="false"
        />
      </div>
      
      <!-- Mensaje dinámico -->
      <div class="generation-progress__message">
        <h3 class="generation-progress__title" v-html="currentMessage">
        </h3>
        <p class="generation-progress__subtitle">
          Esto puede tomar unos momentos. ¡Estamos creando algo increíble para ti!
        </p>
      </div>
      
      <!-- Barra de progreso -->
      <div v-if="showProgress" class="generation-progress__bar">
        <div class="progress-bar">
          <div 
            class="progress-bar__fill" 
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <div class="progress-percentage">
          {{ Math.round(progress) }}%
        </div>
      </div>
      
      <!-- Indicadores de pasos -->
      <div class="generation-progress__steps">
        <div 
          v-for="(step, index) in generationMessages" 
          :key="index"
          class="step-indicator"
          :class="{
            'step-indicator--active': index === messageIndex,
            'step-indicator--completed': index < messageIndex
          }"
        >
          <div class="step-indicator__dot"></div>
          <span class="step-indicator__label" v-html="step.replace(/<i[^>]*><\/i>\s*/g, '')"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.generation-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-out;
  
  &__container {
    background: white;
    border-radius: 1rem;
    padding: 3rem;
    max-width: 500px;
    width: 90%;
    text-align: center;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    animation: slideUp 0.4s ease-out;
  }
  
  &__spinner {
    margin-bottom: 2rem;
  }
  
  &__message {
    margin-bottom: 2rem;
  }
  
  &__title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary, #1f2937);
    margin-bottom: 0.5rem;
    animation: messageSlide 0.5s ease-out;
  }
  
  &__subtitle {
    font-size: 0.875rem;
    color: var(--text-secondary, #6b7280);
    margin: 0;
  }
  
  &__bar {
    margin-bottom: 2rem;
  }
  
  &__steps {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--gray-200, #e5e7eb);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
  
  &__fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-color, #3b82f6), var(--primary-light, #60a5fa));
    border-radius: 4px;
    transition: width 0.8s ease-out;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      animation: shimmer 2s infinite;
    }
  }
}

.progress-percentage {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-color, #3b82f6);
}

.step-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  
  &__dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--gray-300, #d1d5db);
    transition: all 0.3s ease;
    flex-shrink: 0;
  }
  
  &__label {
    font-size: 0.875rem;
    color: var(--text-secondary, #6b7280);
    transition: color 0.3s ease;
    text-align: left;
  }
  
  &--active {
    .step-indicator__dot {
      background: var(--primary-color, #3b82f6);
      animation: pulse 2s infinite;
    }
    
    .step-indicator__label {
      color: var(--primary-color, #3b82f6);
      font-weight: 600;
    }
  }
  
  &--completed {
    .step-indicator__dot {
      background: var(--success-color, #10b981);
    }
    
    .step-indicator__label {
      color: var(--success-color, #10b981);
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(2rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes messageSlide {
  from {
    opacity: 0;
    transform: translateX(-1rem);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

// Responsive
@media (max-width: 640px) {
  .generation-progress {
    &__container {
      padding: 2rem 1.5rem;
      margin: 1rem;
    }
    
    &__title {
      font-size: 1.125rem;
    }
    
    &__steps {
      gap: 0.5rem;
    }
  }
  
  .step-indicator {
    &__label {
      font-size: 0.8rem;
    }
  }
}
</style>