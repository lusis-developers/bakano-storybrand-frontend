<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { IBusiness, ICreateBusinessRequest, IUpdateBusinessRequest, IBusinessAddress } from '@/types/business.types'
import { BusinessIndustry } from '@/types/business.types'

interface Props {
  mode: 'create' | 'edit'
  business?: IBusiness | null
  loading?: boolean
  error?: string | null
}

interface Emits {
  (e: 'submit', data: ICreateBusinessRequest | IUpdateBusinessRequest): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Form data
const formData = ref({
  name: '',
  description: '',
  industry: '',
  website: '',
  phone: '',
  email: '',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  } as IBusinessAddress,
  isActive: true
})

// Validation
const errors = ref({
  name: '',
  email: '',
  website: '',
  phone: ''
})

const showAdvanced = ref(false)

// Computed
const isEdit = computed(() => props.mode === 'edit')
const modalTitle = computed(() => isEdit.value ? 'Editar Negocio' : 'Crear Nuevo Negocio')
const submitButtonText = computed(() => isEdit.value ? 'Actualizar Negocio' : 'Crear Negocio')

const industryOptions = computed(() => {
  return Object.entries(BusinessIndustry).map(([key, value]) => ({
    value: key.toLowerCase(),
    label: value
  }))
})

const isFormValid = computed(() => {
  return formData.value.name.trim() &&
    !Object.values(errors.value).some(error => error)
})

const hasAddress = computed(() => {
  const addr = formData.value.address
  return addr.street || addr.city || addr.state || addr.zipCode || addr.country
})

// Methods
const validateField = (field: string, value: string) => {
  switch (field) {
    case 'name':
      errors.value.name = !value.trim() ? 'El nombre es requerido' :
        value.length > 100 ? 'El nombre no puede exceder 100 caracteres' : ''
      break

    case 'email':
      if (value) {
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
        errors.value.email = !emailRegex.test(value) ? 'Email inválido' : ''
      } else {
        errors.value.email = ''
      }
      break

    case 'website':
      if (value) {
        const websiteRegex = /^https?:\/\/.+/
        errors.value.website = !websiteRegex.test(value) ? 'La URL debe comenzar con http:// o https://' : ''
      } else {
        errors.value.website = ''
      }
      break

    case 'phone':
      if (value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
        errors.value.phone = !phoneRegex.test(value.replace(/\s/g, '')) ? 'Número de teléfono inválido' : ''
      } else {
        errors.value.phone = ''
      }
      break
  }
}

const handleSubmit = () => {
  // Validate all fields
  validateField('name', formData.value.name)
  validateField('email', formData.value.email)
  validateField('website', formData.value.website)
  validateField('phone', formData.value.phone)

  if (!isFormValid.value) {
    return
  }

  // Prepare data for submission
  const submitData = {
    name: formData.value.name.trim(),
    description: formData.value.description.trim() || undefined,
    industry: formData.value.industry || undefined,
    website: formData.value.website.trim() || undefined,
    phone: formData.value.phone.trim() || undefined,
    email: formData.value.email.trim() || undefined,
    address: hasAddress.value ? formData.value.address : undefined
  }

  // Add isActive for edit mode
  if (isEdit.value) {
    (submitData as IUpdateBusinessRequest).isActive = formData.value.isActive
  }

  emit('submit', submitData)
}

const handleCancel = () => {
  emit('cancel')
}

const resetForm = () => {
  formData.value = {
    name: '',
    description: '',
    industry: '',
    website: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    isActive: true
  }

  errors.value = {
    name: '',
    email: '',
    website: '',
    phone: ''
  }
}

const loadBusinessData = () => {
  if (props.business) {
    formData.value = {
      name: props.business.name,
      description: props.business.description || '',
      industry: props.business.industry || '',
      website: props.business.website || '',
      phone: props.business.phone || '',
      email: props.business.email || '',
      address: {
        street: props.business.address?.street || '',
        city: props.business.address?.city || '',
        state: props.business.address?.state || '',
        zipCode: props.business.address?.zipCode || '',
        country: props.business.address?.country || ''
      },
      isActive: props.business.isActive
    }
  }
}

// Watchers
watch(() => props.business, () => {
  if (isEdit.value) {
    loadBusinessData()
  }
}, { immediate: true })

watch(() => props.mode, () => {
  if (!isEdit.value) {
    resetForm()
  }
})

// Lifecycle
onMounted(() => {
  if (isEdit.value) {
    loadBusinessData()
  }
})
</script>

<template>
  <div class="modal-overlay" @click.self="handleCancel">
    <div class="modal-container">
      <form @submit.prevent="handleSubmit" class="business-form">
        <!-- Modal Header -->
        <div class="modal-header">
          <h2>{{ modalTitle }}</h2>
          <button type="button" @click="handleCancel" class="close-btn">
            ✕
          </button>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="error-banner">
          <span class="error-icon">⚠️</span>
          <span>{{ error }}</span>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <!-- Basic Information -->
          <section class="form-section">
            <h3>Información Básica</h3>
            
            <div class="form-grid">
              <!-- Business Name -->
              <div class="form-group full-width">
                <label for="name" class="form-label required">
                  Nombre del Negocio
                </label>
                <input
                  id="name"
                  v-model="formData.name"
                  type="text"
                  class="form-input"
                  :class="{ error: errors.name }"
                  placeholder="Ej: Mi Empresa S.A."
                  maxlength="100"
                  @blur="validateField('name', formData.name)"
                  required
                >
                <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
              </div>

              <!-- Industry -->
              <div class="form-group">
                <label for="industry" class="form-label">
                  Industria
                </label>
                <select
                  id="industry"
                  v-model="formData.industry"
                  class="form-select"
                >
                  <option value="">Seleccionar industria</option>
                  <option 
                    v-for="option in industryOptions" 
                    :key="option.value" 
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <!-- Status (Edit mode only) -->
              <div v-if="isEdit" class="form-group">
                <label class="form-label">
                  Estado
                </label>
                <div class="toggle-group">
                  <label class="toggle-option">
                    <input
                      v-model="formData.isActive"
                      type="radio"
                      :value="true"
                    >
                    <span class="toggle-label active">Activo</span>
                  </label>
                  <label class="toggle-option">
                    <input
                      v-model="formData.isActive"
                      type="radio"
                      :value="false"
                    >
                    <span class="toggle-label inactive">Inactivo</span>
                  </label>
                </div>
              </div>

              <!-- Description -->
              <div class="form-group full-width">
                <label for="description" class="form-label">
                  Descripción
                </label>
                <textarea
                  id="description"
                  v-model="formData.description"
                  class="form-textarea"
                  placeholder="Describe tu negocio..."
                  rows="3"
                  maxlength="500"
                ></textarea>
                <div class="char-counter">
                  {{ formData.description.length }}/500
                </div>
              </div>
            </div>
          </section>

          <!-- Contact Information -->
          <section class="form-section">
            <h3>Información de Contacto</h3>
            
            <div class="form-grid">
              <!-- Email -->
              <div class="form-group">
                <label for="email" class="form-label">
                  Email
                </label>
                <input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  class="form-input"
                  :class="{ error: errors.email }"
                  placeholder="contacto@empresa.com"
                  @blur="validateField('email', formData.email)"
                >
                <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
              </div>

              <!-- Phone -->
              <div class="form-group">
                <label for="phone" class="form-label">
                  Teléfono
                </label>
                <input
                  id="phone"
                  v-model="formData.phone"
                  type="tel"
                  class="form-input"
                  :class="{ error: errors.phone }"
                  placeholder="+1234567890"
                  @blur="validateField('phone', formData.phone)"
                >
                <span v-if="errors.phone" class="error-text">{{ errors.phone }}</span>
              </div>

              <!-- Website -->
              <div class="form-group full-width">
                <label for="website" class="form-label">
                  Sitio Web
                </label>
                <input
                  id="website"
                  v-model="formData.website"
                  type="url"
                  class="form-input"
                  :class="{ error: errors.website }"
                  placeholder="https://www.empresa.com"
                  @blur="validateField('website', formData.website)"
                >
                <span v-if="errors.website" class="error-text">{{ errors.website }}</span>
              </div>
            </div>
          </section>

          <!-- Advanced Section -->
          <section class="form-section">
            <button
              type="button"
              @click="showAdvanced = !showAdvanced"
              class="section-toggle"
            >
              <span>Información Adicional</span>
              <span class="toggle-icon" :class="{ expanded: showAdvanced }">
                ▼
              </span>
            </button>

            <div v-show="showAdvanced" class="advanced-section">
              <div class="form-grid">
                <!-- Address -->
                <div class="form-group full-width">
                  <label class="form-label">Dirección</label>
                  
                  <div class="address-grid">
                    <input
                      v-model="formData.address.street"
                      type="text"
                      class="form-input"
                      placeholder="Calle y número"
                    >
                    
                    <input
                      v-model="formData.address.city"
                      type="text"
                      class="form-input"
                      placeholder="Ciudad"
                    >
                    
                    <input
                      v-model="formData.address.state"
                      type="text"
                      class="form-input"
                      placeholder="Estado/Provincia"
                    >
                    
                    <input
                      v-model="formData.address.zipCode"
                      type="text"
                      class="form-input"
                      placeholder="Código postal"
                    >
                    
                    <input
                      v-model="formData.address.country"
                      type="text"
                      class="form-input"
                      placeholder="País"
                    >
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <button
            type="button"
            @click="handleCancel"
            class="btn btn-outline"
            :disabled="loading"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="!isFormValid || loading"
          >
            <span v-if="loading" class="loading-spinner"></span>
            {{ submitButtonText }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.business-form {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

// Modal Header
.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;

    @media (max-width: 768px) {
      font-size: 1.25rem;
    }
  }
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:hover {
    background: #e2e8f0;
    color: #374151;
  }
}

// Error Banner
.error-banner {
  padding: 1rem 2rem;
  background: #fef2f2;
  border-bottom: 1px solid #fecaca;
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;

  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
  }
}

.error-icon {
  font-size: 1rem;
}

// Modal Body
.modal-body {
  padding: 1rem;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  -webkit-overflow-scrolling: touch;

  @media (min-width: 768px) {
    padding: 2rem;
  }
}

// Form Sections
.form-section {
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }

  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 1rem 0;
  }
}

.section-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #374151;
  transition: all 0.2s ease;
  margin-bottom: 1rem;

  &:hover {
    background: #f1f5f9;
  }
}

.toggle-icon {
  transition: transform 0.2s ease;
  font-size: 0.75rem;

  &.expanded {
    transform: rotate(180deg);
  }
}

.advanced-section {
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Form Grid
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.address-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

// Form Groups
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &.full-width {
    grid-column: 1 / -1;
  }
}

.form-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;

  &.required::after {
    content: ' *';
    color: #ef4444;
  }
}

// Form Inputs
.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &.error {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.char-counter {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: right;
  margin-top: -0.25rem;
}

.error-text {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: -0.25rem;
}

// Toggle Group
.toggle-group {
  display: flex;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
}

.toggle-option {
  flex: 1;
  position: relative;
  cursor: pointer;

  input {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    cursor: pointer;

    &:checked+.toggle-label {
      background: #667eea;
      color: white;
    }
  }
}

.toggle-label {
  display: block;
  padding: 0.75rem 1rem;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 500;
  background: white;
  color: #374151;
  transition: all 0.2s ease;
  border-right: 1px solid #d1d5db;

  &:last-child {
    border-right: none;
  }

  &:hover {
    background: #f9fafb;
  }

  &.active {
    color: #059669;
  }

  &.inactive {
    color: #dc2626;
  }
}

// Modal Footer
.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    flex-direction: column;
  }
}

// Buttons
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 120px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    min-width: auto;
  }
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 1px solid #667eea;

  &:hover:not(:disabled) {
    background: #667eea;
    color: white;
  }
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>