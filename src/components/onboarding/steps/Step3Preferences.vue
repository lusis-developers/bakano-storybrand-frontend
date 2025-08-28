<script setup lang="ts">
import { computed } from 'vue'
import type { IOnboardingPreferences, IBusinessContext } from '@/types/onboarding.types'

interface Props {
  preferences: Partial<IOnboardingPreferences>
  businessContext: IBusinessContext
}

interface Emits {
  (e: 'update:preferences', value: Partial<IOnboardingPreferences>): void
  (e: 'update:businessContext', value: IBusinessContext): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const preferences = computed({
  get: () => props.preferences,
  set: (value: Partial<IOnboardingPreferences>) => emit('update:preferences', value)
})

const businessContext = computed({
  get: () => props.businessContext,
  set: (value: IBusinessContext) => emit('update:businessContext', value)
})

function updatePreference(field: keyof IOnboardingPreferences, value: any) {
  preferences.value = { ...preferences.value, [field]: value }
}

function updateBusinessField(field: keyof IBusinessContext, value: any) {
  businessContext.value = { ...businessContext.value, [field]: value }
}

function toggleContentType(type: 'blog_posts' | 'social_media' | 'email_campaigns' | 'video_scripts' | 'ad_copy' | 'website_copy') {
  const currentTypes = preferences.value.preferredContentTypes || []
  const index = currentTypes.indexOf(type)

  if (index > -1) {

    const newTypes = currentTypes.filter(t => t !== type)
    updatePreference('preferredContentTypes', newTypes)
  } else {

    const newTypes = [...currentTypes, type]
    updatePreference('preferredContentTypes', newTypes)
  }
}

function isContentTypeSelected(type: string): boolean {
  return (preferences.value.preferredContentTypes || []).includes(type as 'blog_posts' | 'social_media' | 'email_campaigns' | 'video_scripts' | 'ad_copy' | 'website_copy')
}
</script>

<template>
  <div class="step3-container">
    <div class="form-grid">
      <div class="form-group">
        <label for="communicationFrequency" class="form-label">Frecuencia de comunicación *</label>
        <select 
          id="communicationFrequency"
          :value="preferences.communicationFrequency" 
          class="form-select" 
          required
          @change="updatePreference('communicationFrequency', ($event.target as HTMLSelectElement).value)"
        >
          <option value="daily">Diario</option>
          <option value="weekly">Semanal</option>
          <option value="monthly">Mensual</option>
          <option value="as_needed">Según necesidad</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="aiProviderPreference" class="form-label">Proveedor de IA preferido *</label>
        <select 
          id="aiProviderPreference"
          :value="preferences.aiProviderPreference" 
          class="form-select" 
          required
          @change="updatePreference('aiProviderPreference', ($event.target as HTMLSelectElement).value)"
        >
          <option value="openai">OpenAI</option>
          <option value="gemini">Gemini</option>
          <option value="no_preference">Sin preferencia</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="brandVoice" class="form-label">Voz de marca *</label>
        <select 
          id="brandVoice"
          :value="businessContext.brandVoice" 
          class="form-select" 
          required
          @change="updateBusinessField('brandVoice', ($event.target as HTMLSelectElement).value)"
        >
          <option value="professional">Profesional</option>
          <option value="friendly">Amigable</option>
          <option value="authoritative">Autoritativo</option>
          <option value="casual">Casual</option>
        </select>
      </div>
      
      <div class="form-group full-width">
        <label class="form-label">Tipos de contenido preferidos</label>
        <div class="checkbox-group">
          <div class="checkbox-item">
            <input
              id="blog_posts"
              type="checkbox"
              :checked="isContentTypeSelected('blog_posts')"
              @change="toggleContentType('blog_posts')"
            />
            <label for="blog_posts">Blog posts</label>
          </div>
          <div class="checkbox-item">
            <input
              id="social_media"
              type="checkbox"
              :checked="isContentTypeSelected('social_media')"
              @change="toggleContentType('social_media')"
            />
            <label for="social_media">Redes sociales</label>
          </div>
          <div class="checkbox-item">
            <input
              id="email_campaigns"
              type="checkbox"
              :checked="isContentTypeSelected('email_campaigns')"
              @change="toggleContentType('email_campaigns')"
            />
            <label for="email_campaigns">Campañas de email</label>
          </div>
          <div class="checkbox-item">
            <input
              id="ad_copy"
              type="checkbox"
              :checked="isContentTypeSelected('ad_copy')"
              @change="toggleContentType('ad_copy')"
            />
            <label for="ad_copy">Textos publicitarios</label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.step3-container {
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
}

.form-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: #667eea;
    cursor: pointer;
  }

  label {
    font-size: 0.875rem;
    color: #374151;
    cursor: pointer;
    margin: 0;
  }
}
</style>