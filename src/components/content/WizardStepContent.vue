<script setup lang="ts">
import type { IBusinessQuestions } from '@/types/content.types'

interface WizardStep {
  id: number
  title: string
  description: string
  fields: string[]
}

interface Props {
  currentStepData: WizardStep | undefined
  questions: IBusinessQuestions
  prefilledFields: string[]
  isFirstStep: boolean
  isLastStep: boolean
  canProceed: boolean
  isSubmitting: boolean
  getButtonText: () => string
}

interface Emits {
  'update:questions': [questions: IBusinessQuestions]
  prevStep: []
  nextStep: []
  submitWizard: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function updateQuestion(field: keyof IBusinessQuestions, value: string) {
  const updatedQuestions = { ...props.questions }
  updatedQuestions[field] = value
  emit('update:questions', updatedQuestions)
}

function handlePrevStep() {
  emit('prevStep')
}

function handleNextStep() {
  emit('nextStep')
}

function handleSubmit() {
  emit('submitWizard')
}

function isFieldPrefilled(fieldName: string): boolean {
  return props.prefilledFields.includes(fieldName)
}

function getFieldLabel(fieldName: string): string {
  const labels: Record<string, string> = {
    companyName: 'Nombre de la empresa',
    productsServices: 'Productos y servicios',
    targetAudience: 'Audiencia objetivo',
    mainProblem: 'Problema principal',
    solution: 'Tu solución',
    uniqueCharacteristics: 'Características únicas',
    authority: 'Autoridad y credibilidad',
    steps: 'Pasos del proceso'
  }
  return labels[fieldName] || fieldName
}

function getFieldPlaceholder(fieldName: string): string {
  const placeholders: Record<string, string> = {
    companyName: 'Ej: TechSolutions Inc.',
    productsServices: 'Describe los productos o servicios que ofreces...',
    targetAudience: 'Describe a tu audiencia ideal...',
    mainProblem: 'Describe el problema principal que resuelves...',
    solution: 'Explica cómo resuelves el problema...',
    uniqueCharacteristics: 'Qué te hace diferente de la competencia...',
    authority: 'Por qué deberían confiar en ti...',
    steps: 'Describe los pasos de tu proceso...'
  }
  return placeholders[fieldName] || ''
}

function isTextarea(fieldName: string): boolean {
  return !['companyName'].includes(fieldName)
}
</script>

<template>
  <div class="wizard-content">
    <div class="step-card">
      <div class="step-header">
        <h2>{{ currentStepData?.title }}</h2>
        <p>{{ currentStepData?.description }}</p>
      </div>

      <div class="step-content">
        <div 
          v-for="field in currentStepData?.fields" 
          :key="field"
          class="form-group"
        >
          <label :for="field" class="form-label">
            {{ getFieldLabel(field) }}
            <span 
              v-if="isFieldPrefilled(field)" 
              class="prefilled-indicator"
              title="Campo prellenado automáticamente"
            >
              ✨ Prellenado
            </span>
          </label>
          
          <textarea
            v-if="isTextarea(field)"
            :id="field"
            :value="questions[field as keyof IBusinessQuestions]"
            @input="updateQuestion(field as keyof IBusinessQuestions, ($event.target as HTMLTextAreaElement).value)"
            :placeholder="getFieldPlaceholder(field)"
            class="form-textarea"
            :class="{ 'prefilled': isFieldPrefilled(field) }"
            rows="4"
          ></textarea>
          
          <input
            v-else
            :id="field"
            type="text"
            :value="questions[field as keyof IBusinessQuestions]"
            @input="updateQuestion(field as keyof IBusinessQuestions, ($event.target as HTMLInputElement).value)"
            :placeholder="getFieldPlaceholder(field)"
            class="form-input"
            :class="{ 'prefilled': isFieldPrefilled(field) }"
          />
        </div>
      </div>

      <div class="step-actions">
        <button 
          v-if="!isFirstStep" 
          @click="handlePrevStep"
          class="btn btn-secondary"
          type="button"
        >
          ← Anterior
        </button>
        
        <div class="spacer"></div>
        
        <button 
          v-if="!isLastStep"
          @click="handleNextStep"
          :disabled="!canProceed"
          class="btn btn-primary"
          type="button"
        >
          Siguiente →
        </button>
        
        <button 
          v-else
          @click="handleSubmit"
          :disabled="!canProceed || isSubmitting"
          class="btn btn-primary btn-submit"
          type="button"
        >
          {{ getButtonText() }}
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wizard-content {
  max-width: 800px;
  margin: 0 auto 2rem;
}

.step-card {
  background: $white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 8px 32px rgba($BAKANO-DARK, 0.08);
  border: 1px solid rgba($BAKANO-PURPLE, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, $BAKANO-PINK 0%, $BAKANO-PURPLE 100%);
  }

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    margin: 0 1rem;
    border-radius: 16px;
  }
}

.step-header {
  text-align: center;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba($BAKANO-PURPLE, 0.1);

  h2 {
    font-size: 1.75rem;
    font-weight: 700;
    color: $BAKANO-DARK;
    margin: 0 0 0.75rem 0;
    background: linear-gradient(135deg, $BAKANO-PINK 0%, $BAKANO-PURPLE 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;

    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
  }

  p {
    color: rgba($BAKANO-DARK, 0.7);
    font-size: 1.125rem;
    margin: 0;
    font-weight: 500;
    line-height: 1.6;

    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }
}

.step-content {
  margin-bottom: 2.5rem;

  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }
}

.form-group {
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  color: $BAKANO-DARK;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.prefilled-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: rgba($BAKANO-GREEN, 0.1);
  color: $BAKANO-GREEN;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: help;

  &::before {
    content: '✓';
    font-size: 0.75rem;
  }
}

.form-input,
.form-textarea {
  width: 80%;
  padding: 1rem 1.25rem;
  border: 2px solid rgba($BAKANO-PURPLE, 0.2);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba($BAKANO-LIGHT, 0.3);
  color: $BAKANO-DARK;
  font-weight: 500;
  line-height: 1.6;

  &:focus {
    outline: none;
    border-color: $BAKANO-PURPLE;
    box-shadow: 0 0 0 4px rgba($BAKANO-PURPLE, 0.1);
    background: $white;
    transform: translateY(-1px);
  }

  &.prefilled {
    background: rgba($BAKANO-GREEN, 0.05);
    border-color: rgba($BAKANO-GREEN, 0.3);

    &:focus {
      border-color: $BAKANO-GREEN;
      box-shadow: 0 0 0 4px rgba($BAKANO-GREEN, 0.1);
    }
  }

  &::placeholder {
    color: rgba($BAKANO-DARK, 0.5);
    font-weight: 400;
  }

  @media (max-width: 768px) {
    padding: 0.875rem 1rem;
    font-size: 0.9rem;
  }
}

.form-textarea {
  resize: vertical;
  min-height: 140px;
  font-family: inherit;
}

.step-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 1px solid rgba($BAKANO-PURPLE, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    margin-top: 2rem;
  }
}

.spacer {
  flex: 1;

  @media (max-width: 768px) {
    display: none;
  }
}

.btn {
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 1rem 1.5rem;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  &.btn-primary {
    background: linear-gradient(135deg, $BAKANO-PINK 0%, $BAKANO-PURPLE 100%);
    color: $white;
    box-shadow: 0 4px 16px rgba($BAKANO-PURPLE, 0.3);

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba($BAKANO-PURPLE, 0.4);
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba($white, 0.2), transparent);
      transition: left 0.5s;
    }

    &:hover::before {
      left: 100%;
    }
  }

  &.btn-secondary {
    background: rgba($BAKANO-LIGHT, 0.8);
    color: $BAKANO-DARK;
    border: 2px solid rgba($BAKANO-PURPLE, 0.2);

    &:hover:not(:disabled) {
      background: rgba($BAKANO-PURPLE, 0.1);
      border-color: $BAKANO-PURPLE;
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba($BAKANO-PURPLE, 0.15);
    }
  }

  &.btn-submit {
    min-width: 200px;
    background: linear-gradient(135deg, $BAKANO-GREEN 0%, darken($BAKANO-GREEN, 10%) 100%);
    color: $white;
    box-shadow: 0 4px 16px rgba($BAKANO-GREEN, 0.3);

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba($BAKANO-GREEN, 0.4);
    }
  }
}
</style>