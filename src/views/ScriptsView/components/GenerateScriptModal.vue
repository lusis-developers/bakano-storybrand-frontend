<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import CustomSelect from '../../../components/shared/CustomSelect.vue'
import { useConfirmationDialog } from '../../../composables/useConfirmationDialog'

interface NewScript {
  scriptType: 'content' | 'ad' | ''
  platform: 'youtube' | 'instagram' | 'tiktok' | 'social' | 'email' | 'website' | ''
  selectedSoundbite: string
  selectedTagline: string
  customText: string
}

interface Props {
  showModal: boolean
  isGenerating: boolean
  soundbiteOptions: Array<{ value: string; label: string }>
  taglineOptions: Array<{ value: string; label: string }>
}

interface Emits {
  (e: 'close'): void
  (e: 'generate', script: NewScript): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { reveal: showConfirmationDialog } = useConfirmationDialog()

// Form data
const newScript = ref<NewScript>({
  scriptType: '',
  platform: '',
  selectedSoundbite: '',
  selectedTagline: '',
  customText: ''
})

// Form options
const scriptTypeOptions = [
  { value: 'content', label: 'Contenido' },
  { value: 'ad', label: 'Anuncio' }
]

const platformOptions = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'social', label: 'Redes Sociales' },
  { value: 'email', label: 'Email' },
  { value: 'website', label: 'Sitio Web' }
]

// Computed properties
const canSubmitScript = computed(() => {
  return newScript.value.scriptType && 
         newScript.value.platform && 
         newScript.value.selectedSoundbite && 
         newScript.value.selectedTagline
})

const hasFormChanges = computed(() => {
  return newScript.value.scriptType !== '' ||
         newScript.value.platform !== '' ||
         newScript.value.selectedSoundbite !== '' ||
         newScript.value.selectedTagline !== '' ||
         newScript.value.customText.trim() !== ''
})

// Methods
const resetForm = () => {
  newScript.value = {
    scriptType: '',
    platform: '',
    selectedSoundbite: '',
    selectedTagline: '',
    customText: ''
  }
}

const handleGenerate = () => {
  if (!canSubmitScript.value) return
  
  emit('generate', { ...newScript.value })
}

const confirmCloseModal = async () => {
  if (hasFormChanges.value) {
    const confirmed = await showConfirmationDialog({
      title: 'Confirmar cierre',
      message: '¿Estás seguro de que quieres cerrar? Se perderán los cambios no guardados.'
    })
    
    if (confirmed) {
      resetForm()
      emit('close')
    }
  } else {
    emit('close')
  }
}

// Watch for modal close to reset form
watch(() => props.showModal, (newValue) => {
  if (!newValue) {
    resetForm()
  }
})
</script>

<template>
  <div class="modal-overlay" v-if="showModal" @click="confirmCloseModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Generar Nuevo Script</h3>
        <button @click="confirmCloseModal" class="close-button">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="form-group">
          <label class="required-field">Tipo de Script *</label>
          <CustomSelect
            v-model="newScript.scriptType"
            :options="scriptTypeOptions"
            placeholder="Seleccionar tipo de script"
          />
        </div>
        
        <div class="form-group">
          <label class="required-field">Plataforma *</label>
          <CustomSelect
            v-model="newScript.platform"
            :options="platformOptions"
            placeholder="Seleccionar plataforma de destino"
          />
        </div>
        
        <div class="form-group">
          <label class="required-field">Soundbite *</label>
          <CustomSelect
            v-model="newScript.selectedSoundbite"
            :options="soundbiteOptions"
            placeholder="Seleccionar soundbite para el script"
            class="custom-select"
          />
        </div>
        
        <div class="form-group">
          <label class="required-field">Tagline *</label>
          <CustomSelect
            v-model="newScript.selectedTagline"
            :options="taglineOptions"
            placeholder="Seleccionar tagline para el script"
            class="custom-select"
          />
        </div>
        
        <div class="form-group">
          <label>Tema Personalizado (Opcional)</label>
          <textarea 
            v-model="newScript.customText"
            class="form-textarea"
            placeholder="Describe el tema específico del que quieres hablar en este script..."
            rows="3"
          ></textarea>
          <small class="form-help">Especifica un tema o mensaje particular que quieras incluir en el script</small>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="confirmCloseModal" class="cancel-button">
          Cancelar
        </button>
        <button 
          @click="handleGenerate"
          class="generate-script-button"
          :disabled="isGenerating || !canSubmitScript"
        >
          <i v-if="isGenerating" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-magic"></i>
          {{ isGenerating ? 'Generando...' : 'Generar Script' }}
        </button>
      </div>
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
  padding: var(--spacing-lg);

  @media (max-width: 768px) {
    padding: var(--spacing-md);
  }

  .modal-content {
    background: var(--color-white);
    border-radius: var(--border-radius-lg);
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-lg);
      border-bottom: 1px solid var(--color-border-light);

      h3 {
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
        margin: 0;
      }

      .close-button {
        width: 40px;
        height: 40px;
        border: none;
        background: var(--color-background-light);
        border-radius: var(--border-radius-md);
        color: var(--color-text-secondary);
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background: var(--color-danger);
          color: var(--color-white);
          transform: scale(1.05);
        }

        i {
          font-size: 16px;
        }
      }
    }

    .modal-body {
      padding: var(--spacing-lg);

      .form-group {
        margin-bottom: var(--spacing-lg);

        &:last-child {
          margin-bottom: 0;
        }

        label {
          display: block;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--color-text-primary);
          margin-bottom: var(--spacing-sm);

          &.required-field::after {
            content: ' *';
            color: var(--color-danger);
          }
        }

        .form-textarea {
          width: 100%;
          padding: var(--spacing-md);
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius-md);
          font-size: var(--font-size-sm);
          font-family: inherit;
          resize: vertical;
          min-height: 80px;
          transition: all 0.2s ease;

          &:focus {
            outline: none;
            border-color: var(--color-primary);
            box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
          }

          &::placeholder {
            color: var(--color-text-tertiary);
          }
        }

        .form-help {
          display: block;
          font-size: var(--font-size-xs);
          color: var(--color-text-tertiary);
          margin-top: var(--spacing-xs);
          line-height: 1.4;
        }
      }
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-sm);
      padding: var(--spacing-lg);
      border-top: 1px solid var(--color-border-light);

      @media (max-width: 480px) {
        flex-direction: column;
      }

      .cancel-button,
      .generate-script-button {
        padding: var(--spacing-sm) var(--spacing-lg);
        border-radius: var(--border-radius-md);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        white-space: nowrap;

        @media (max-width: 480px) {
          justify-content: center;
          padding: var(--spacing-md);
        }
      }

      .cancel-button {
        background: var(--color-white);
        border: 1px solid var(--color-border);
        color: var(--color-text-secondary);

        &:hover {
          background: var(--color-background-light);
          border-color: var(--color-text-secondary);
        }
      }

      .generate-script-button {
        background: var(--color-primary);
        border: 1px solid var(--color-primary);
        color: var(--color-white);

        &:hover:not(:disabled) {
          background: var(--color-primary-dark);
          border-color: var(--color-primary-dark);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.3);
        }

        &:disabled {
          background: var(--color-border);
          border-color: var(--color-border);
          color: var(--color-text-tertiary);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        i {
          font-size: 14px;

          &.fa-spin {
            animation: spin 1s linear infinite;
          }
        }
      }
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>