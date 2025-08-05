<script setup lang="ts">
import { computed } from 'vue'
import SearchableSelect from '@/components/shared/SearchableSelect.vue'
import type { IBusinessContext } from '@/types/onboarding.types'

interface Props {
  modelValue: IBusinessContext
}

interface Emits {
  (e: 'update:modelValue', value: IBusinessContext): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const industryOptions = [
  { value: 'technology', label: 'Tecnología' },
  { value: 'healthcare', label: 'Salud' },
  { value: 'finance', label: 'Finanzas' },
  { value: 'education', label: 'Educación' },
  { value: 'retail', label: 'Retail/Comercio' },
  { value: 'consulting', label: 'Consultoría' },
  { value: 'real_estate', label: 'Bienes Raíces' },
  { value: 'food_beverage', label: 'Alimentos y Bebidas' },
  { value: 'other', label: 'Otro' }
]

const companySizeOptions = [
  { value: '1-10', label: '1-10 empleados' },
  { value: '11-50', label: '11-50 empleados' },
  { value: '51-200', label: '51-200 empleados' },
  { value: '201-1000', label: '201-1000 empleados' },
  { value: '1000+', label: 'Más de 1000 empleados' }
]

const targetMarketOptions = [
  { value: 'b2b', label: 'B2B (Empresas)' },
  { value: 'b2c', label: 'B2C (Consumidores)' },
  { value: 'both', label: 'Ambos' }
]

const businessContext = computed({
  get: () => props.modelValue,
  set: (value: IBusinessContext) => emit('update:modelValue', value)
})

function updateField(field: keyof IBusinessContext, value: any) {
  businessContext.value = { ...businessContext.value, [field]: value }
}
</script>

<template>
  <div class="step2-container">
    <div class="form-grid">
      <div class="form-group">
        <label for="primaryIndustry">¿En qué industria trabajas?</label>
        <SearchableSelect
          :model-value="businessContext.primaryIndustry"
          :items="industryOptions"
          label-field="label"
          value-field="value"
          placeholder="Selecciona tu industria"
          @update:model-value="updateField('primaryIndustry', $event)"
        />
      </div>
      
      <div class="form-group">
        <label for="companySize">¿Cuál es el tamaño de tu empresa?</label>
        <SearchableSelect
          :model-value="businessContext.companySize"
          :items="companySizeOptions"
          label-field="label"
          value-field="value"
          placeholder="Selecciona el tamaño de tu empresa"
          @update:model-value="updateField('companySize', $event)"
        />
      </div>
      
      <div class="form-group full-width">
        <label for="targetMarket">¿Cuál es tu mercado objetivo?</label>
        <SearchableSelect
          :model-value="businessContext.targetMarket"
          :items="targetMarketOptions"
          label-field="label"
          value-field="value"
          placeholder="Selecciona tu mercado objetivo"
          @update:model-value="updateField('targetMarket', $event)"
        />
      </div>
      
      <div class="form-group full-width">
        <label for="competitiveAdvantage">¿Cuál es tu ventaja competitiva? *</label>
        <textarea
          id="competitiveAdvantage"
          :value="businessContext.competitiveAdvantage"
          class="form-textarea"
          placeholder="Describe qué te diferencia de tu competencia..."
          rows="3"
          required
          @input="updateField('competitiveAdvantage', ($event.target as HTMLTextAreaElement).value)"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.step2-container {
  width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

.form-group {
  display: flex;
  flex-direction: column;

  &.full-width {
    grid-column: 1 / -1;
  }

  label {
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }
}

.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  min-height: 100px;
  resize: vertical;
  transition: all 0.2s ease;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
}
</style>