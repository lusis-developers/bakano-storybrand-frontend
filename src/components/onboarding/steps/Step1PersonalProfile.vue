<script setup lang="ts">
import { computed } from 'vue'
import SearchableSelect from '@/components/shared/SearchableSelect.vue'
import type { IUserProfile } from '@/types/onboarding.types'

interface Props {
  modelValue: IUserProfile
}

interface Emits {
  (e: 'update:modelValue', value: IUserProfile): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const commonJobTitles = [
  { id: 'ceo', title: 'CEO / Director Ejecutivo' },
  { id: 'cmo', title: 'CMO / Director de Marketing' },
  { id: 'marketing-manager', title: 'Gerente de Marketing' },
  { id: 'marketing-coordinator', title: 'Coordinador de Marketing' },
  { id: 'digital-marketing-manager', title: 'Gerente de Marketing Digital' },
  { id: 'content-manager', title: 'Gerente de Contenido' },
  { id: 'social-media-manager', title: 'Community Manager' },
  { id: 'brand-manager', title: 'Gerente de Marca' },
  { id: 'product-manager', title: 'Gerente de Producto' },
  { id: 'sales-manager', title: 'Gerente de Ventas' },
  { id: 'business-owner', title: 'Propietario del Negocio' },
  { id: 'entrepreneur', title: 'Emprendedor' },
  { id: 'consultant', title: 'Consultor' },
  { id: 'freelancer', title: 'Freelancer' },
  { id: 'other', title: 'Otro' }
]

const userProfile = computed({
  get: () => props.modelValue,
  set: (value: IUserProfile) => emit('update:modelValue', value)
})

function updateJobTitle(title: string) {
  userProfile.value = { ...userProfile.value, jobTitle: title }
}

function updateExperienceLevel(level: string) {
  userProfile.value = { ...userProfile.value, experienceLevel: level as any }
}

function updateWorkingHours(field: 'start' | 'end', value: string) {
  userProfile.value = {
    ...userProfile.value,
    workingHours: {
      ...userProfile.value.workingHours,
      [field]: value
    }
  }
}
</script>

<template>
  <div class="step1-container">
    <div class="form-grid">
      <div class="form-group">
        <label for="jobTitle">¿Cuál es tu puesto de trabajo?</label>
        <SearchableSelect
          :model-value="userProfile.jobTitle"
          :items="commonJobTitles"
          label-field="title"
          value-field="title"
          placeholder="Busca tu puesto de trabajo..."
          @select="(item) => updateJobTitle(item?.title || '')"
        />
      </div>
      
      <div class="form-group">
        <label for="experienceLevel">¿Cuál es tu nivel de experiencia?</label>
        <select 
          id="experienceLevel" 
          :value="userProfile.experienceLevel"
          class="form-select"
          @change="updateExperienceLevel(($event.target as HTMLSelectElement).value)"
        >
          <option value="beginner">Principiante</option>
          <option value="intermediate">Intermedio</option>
          <option value="advanced">Avanzado</option>
          <option value="expert">Experto</option>
        </select>
      </div>
      
      <div class="form-group full-width">
        <label>Horario de trabajo preferido</label>
        <div class="time-inputs">
          <div class="time-group">
            <label for="start-time">Inicio</label>
            <input 
              id="start-time"
              :value="userProfile.workingHours.start"
              type="time" 
              class="form-input"
              @input="updateWorkingHours('start', ($event.target as HTMLInputElement).value)"
            >
          </div>
          <div class="time-group">
            <label for="end-time">Fin</label>
            <input 
              id="end-time"
              :value="userProfile.workingHours.end"
              type="time" 
              class="form-input"
              @input="updateWorkingHours('end', ($event.target as HTMLInputElement).value)"
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.step1-container {
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

.form-select,
.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
}

.form-select {
  background: white;
  cursor: pointer;
}

.time-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.time-group {
  display: flex;
  flex-direction: column;

  label {
    font-size: 0.75rem;
    margin-bottom: 0.25rem;
    color: #6b7280;
  }
}
</style>