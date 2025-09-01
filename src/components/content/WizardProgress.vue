<script setup lang="ts">
interface WizardStep {
  id: number
  title: string
  description: string
  fields: string[]
}

interface Props {
  currentStep: number
  progressPercentage: number
  wizardSteps: WizardStep[]
}

interface Emits {
  goToStep: [stepNumber: number]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function handleStepClick(stepNumber: number) {
  emit('goToStep', stepNumber)
}
</script>

<template>
  <div class="progress-section">
    <div class="progress-bar">
      <div 
        class="progress-fill" 
        :style="{ width: `${progressPercentage}%` }"
      ></div>
    </div>
    
    <div class="step-indicators">
      <div 
        v-for="step in wizardSteps" 
        :key="step.id"
        class="step-indicator"
        :class="{
          'active': step.id === currentStep,
          'completed': step.id < currentStep
        }"
        @click="handleStepClick(step.id)"
      >
        <div class="step-number">
          <span v-if="step.id <= currentStep">{{ step.id }}</span>
          <i v-if="step.id < currentStep" class="fas fa-check"></i>
        </div>
        <span class="step-title">{{ step.title }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.progress-section {
  background: $white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba($BAKANO-DARK, 0.08);
  border: 1px solid rgba($BAKANO-PURPLE, 0.1);
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: rgba($BAKANO-PURPLE, 0.1);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 2rem;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg,
        rgba($BAKANO-PINK, 0.1) 0%,
        rgba($BAKANO-PURPLE, 0.1) 100%);
    border-radius: 8px;
  }
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, $BAKANO-PINK 0%, $BAKANO-PURPLE 100%);
  border-radius: 8px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 20px;
    height: 100%;
    background: linear-gradient(90deg, transparent 0%, rgba($white, 0.3) 100%);
    border-radius: 0 8px 8px 0;
  }
}

.step-indicators {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.75rem;
  }
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0.75rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  border: 2px solid transparent;
  background: rgba($BAKANO-LIGHT, 0.5);

  &:hover {
    background: rgba($BAKANO-PURPLE, 0.05);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba($BAKANO-PURPLE, 0.15);
  }

  &.active {
    background: linear-gradient(135deg, rgba($BAKANO-PINK, 0.1) 0%, rgba($BAKANO-PURPLE, 0.1) 100%);
    border-color: $BAKANO-PURPLE;
    color: $BAKANO-PURPLE;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba($BAKANO-PURPLE, 0.2);

    .step-number {
      background: linear-gradient(135deg, $BAKANO-PINK 0%, $BAKANO-PURPLE 100%);
      color: $white;
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba($BAKANO-PURPLE, 0.3);
    }
  }

  &.completed {
    color: $BAKANO-GREEN;
    background: rgba($BAKANO-GREEN, 0.05);
    border-color: rgba($BAKANO-GREEN, 0.3);

    .step-number {
      background: $BAKANO-GREEN;
      color: $white;

      i {
        position: absolute;
        font-size: 0.7rem;
        font-weight: bold;
      }
    }
  }
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba($BAKANO-PURPLE, 0.2);
  color: rgba($BAKANO-DARK, 0.6);
  font-size: 0.875rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.step-title {
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.3;
  color: rgba($BAKANO-DARK, 0.7);
  transition: color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }

  .step-indicator.active &,
  .step-indicator.completed & {
    color: inherit;
    font-weight: 700;
  }
}
</style>