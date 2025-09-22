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
  background: rgba($BAKANO-DARK, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
  animation: fadeIn 0.3s ease-out;

  @media (max-width: 768px) {
    padding: 1rem;
  }

  .modal-content {
    background: $white;
    border-radius: 24px;
    width: 100%;
    max-width: 650px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 80px rgba($BAKANO-PURPLE, 0.2);
    border: 1px solid rgba($BAKANO-PURPLE, 0.1);
    animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: linear-gradient(90deg, $BAKANO-PURPLE, $BAKANO-PINK);
      border-radius: 24px 24px 0 0;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2.5rem 2.5rem 1.5rem;
      border-bottom: 1px solid rgba($BAKANO-PURPLE, 0.08);
      background: linear-gradient(135deg, rgba($BAKANO-LIGHT, 0.05) 0%, rgba($white, 0.9) 100%);

      h3 {
        font-size: 1.75rem;
        font-weight: 700;
        color: $BAKANO-DARK;
        margin: 0;
        font-family: $font-principal;
        background: linear-gradient(135deg, $BAKANO-PURPLE, $BAKANO-PINK);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .close-button {
        width: 44px;
        height: 44px;
        border: none;
        background: rgba($BAKANO-PURPLE, 0.05);
        border-radius: 12px;
        color: rgba($BAKANO-PURPLE, 0.6);
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba($alert-error, 0.1), rgba($alert-error, 0.05));
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        &:hover {
          background: rgba($alert-error, 0.1);
          color: $alert-error;
          transform: scale(1.05);

          &::before {
            opacity: 1;
          }
        }

        i {
          font-size: 18px;
          position: relative;
          z-index: 2;
        }
      }
    }

    .modal-body {
      padding: 2rem 2.5rem;

      .form-group {
        margin-bottom: 2rem;

        &:last-child {
          margin-bottom: 0;
        }

        label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: $BAKANO-DARK;
          margin-bottom: 0.75rem;
          font-family: $font-principal;

          &.required-field::after {
            content: ' *';
            color: $alert-error;
            font-weight: 700;
          }
        }

        .form-textarea {
          width: 100%;
          padding: 1.25rem;
          border: 2px solid rgba($BAKANO-PURPLE, 0.1);
          border-radius: 16px;
          font-size: 0.875rem;
          font-family: $font-secondary;
          resize: vertical;
          min-height: 100px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba($BAKANO-LIGHT, 0.02);
          color: $BAKANO-DARK;

          &:focus {
            outline: none;
            border-color: $BAKANO-PURPLE;
            box-shadow: 0 0 0 4px rgba($BAKANO-PURPLE, 0.1);
            background: $white;
            transform: translateY(-2px);
          }

          &::placeholder {
            color: rgba($BAKANO-DARK, 0.4);
            font-style: italic;
          }
        }

        .form-help {
          display: block;
          font-size: 0.75rem;
          color: rgba($BAKANO-DARK, 0.5);
          margin-top: 0.75rem;
          line-height: 1.5;
          font-family: $font-secondary;
          font-style: italic;
        }
      }
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.5rem 2.5rem 2.5rem;
      border-top: 1px solid rgba($BAKANO-PURPLE, 0.08);
      background: linear-gradient(135deg, rgba($BAKANO-LIGHT, 0.02) 0%, rgba($white, 0.9) 100%);

      @media (max-width: 480px) {
        flex-direction: column;
        gap: 1rem;
      }

      .cancel-button,
      .generate-script-button {
        padding: 1rem 2rem;
        border-radius: 14px;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        white-space: nowrap;
        font-family: $font-principal;
        position: relative;
        overflow: hidden;

        @media (max-width: 480px) {
          justify-content: center;
          padding: 1.25rem;
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

        &:hover:not(:disabled)::before {
          left: 100%;
        }
      }

      .cancel-button {
        background: $white;
        border: 2px solid rgba($BAKANO-PURPLE, 0.2);
        color: rgba($BAKANO-DARK, 0.7);

        &:hover {
          background: rgba($BAKANO-PURPLE, 0.05);
          border-color: rgba($BAKANO-PURPLE, 0.3);
          color: $BAKANO-PURPLE;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba($BAKANO-PURPLE, 0.15);
        }
      }

      .generate-script-button {
        background: linear-gradient(135deg, $BAKANO-PURPLE 0%, $BAKANO-PINK 100%);
        border: 2px solid transparent;
        color: $white;
        box-shadow: 0 4px 20px rgba($BAKANO-PURPLE, 0.3);

        &:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba($BAKANO-PURPLE, 0.4);
        }

        &:active:not(:disabled) {
          transform: translateY(-1px);
        }

        &:disabled {
          background: rgba($BAKANO-PURPLE, 0.2);
          border-color: transparent;
          color: rgba($BAKANO-DARK, 0.4);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;

          &::before {
            display: none;
          }
        }

        i {
          font-size: 16px;

          &.fa-spin {
            animation: spin 1s linear infinite;
          }
        }
      }
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
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>