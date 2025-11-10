<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  currentStep: number
  totalSteps: number
  stepTitles?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  stepTitles: () => []
})

// Computed
const progressPercentage = computed(() => {
  return Math.round((props.currentStep / props.totalSteps) * 100)
})

const steps = computed(() => {
  return Array.from({ length: props.totalSteps }, (_, index) => {
    const stepNumber = index + 1
    return {
      number: stepNumber,
      title: props.stepTitles[index] || `Paso ${stepNumber}`,
      isCompleted: stepNumber < props.currentStep,
      isCurrent: stepNumber === props.currentStep,
      isPending: stepNumber > props.currentStep
    }
  })
})
</script>

<template>
  <div class="progress-container">
    <!-- Progress Bar -->
    <div class="progress-bar">
      <div 
        class="progress-fill" 
        :style="{ width: `${progressPercentage}%` }"
      ></div>
    </div>
    
    <!-- Progress Text -->
    <div class="progress-text">
      <span class="current-step">Paso {{ currentStep }} de {{ totalSteps }}</span>
      <span class="progress-percentage">{{ progressPercentage }}% completado</span>
    </div>
    
    <!-- Step Indicators -->
    <div class="step-indicators">
      <div 
        v-for="step in steps" 
        :key="step.number"
        class="step-indicator"
        :class="{
          'completed': step.isCompleted,
          'current': step.isCurrent,
          'pending': step.isPending
        }"
      >
        <div class="step-circle">
          <span v-if="step.isCompleted" class="check-icon">✓</span>
          <span v-else class="step-number">{{ step.number }}</span>
        </div>
        <span class="step-title">{{ step.title }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.progress-container {
  width: 100%;
  margin-bottom: 2rem;
}

// Progress Bar
.progress-bar {
  width: 100%;
  height: 8px;
  background: lighten($BAKANO-DARK, 75%);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: $BAKANO-PINK;
  border-radius: 4px;
  transition: width 0.3s ease;
}

// Progress Text
.progress-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.25rem;
    text-align: center;
  }
}

.current-step {
  font-weight: 600;
  color: $BAKANO-DARK;
  font-size: 0.875rem;
}

.progress-percentage {
  font-size: 0.75rem;
  color: lighten($BAKANO-DARK, 35%);
}

// Step Indicators
.step-indicators {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
  }
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
  max-width: 120px;

  @media (max-width: 768px) {
    flex: none;
    width: auto;
  }
}

.step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  transition: all 0.2s ease;

  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
    font-size: 0.625rem;
  }
}

.step-title {
  font-size: 0.75rem;
  line-height: 1.2;

  @media (max-width: 480px) {
    font-size: 0.625rem;
  }
}

// Step States
.step-indicator.completed {
  .step-circle {
    background: $BAKANO-PINK;
    color: white;
  }

  .step-title {
    color: $BAKANO-PINK;
    font-weight: 600;
  }
}

.step-indicator.current {
  .step-circle {
    background: $BAKANO-PINK;
    color: white;
    box-shadow: 0 0 0 4px rgba($BAKANO-PINK, 0.2);
  }

  .step-title {
    color: $BAKANO-DARK;
    font-weight: 600;
  }
}

.step-indicator.pending {
  .step-circle {
    background: lighten($BAKANO-LIGHT, 2%);
    color: lighten($BAKANO-DARK, 50%);
    border: 2px solid lighten($BAKANO-DARK, 75%);
  }

  .step-title {
    color: lighten($BAKANO-DARK, 50%);
  }
}

.check-icon {
  font-size: 0.875rem;

  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
}

.step-number {
  font-size: 0.75rem;

  @media (max-width: 480px) {
    font-size: 0.625rem;
  }
}
</style>