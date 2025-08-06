<script setup lang="ts">
import { ref, computed } from 'vue'
import type { IBusiness } from '@/types/business.types'

interface Props {
  business: IBusiness
  loading?: boolean
}

interface Emits {
  (e: 'delete', businessId: string): void
  (e: 'toggle-status', businessId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const showDeleteConfirmation = ref(false)
const deleteConfirmationText = ref('')
const showStatusConfirmation = ref(false)

// Computed
const isDeleteConfirmationValid = computed(() => {
  return deleteConfirmationText.value.toLowerCase() === 'eliminar'
})

const statusActionText = computed(() => {
  return props.business.isActive ? 'Desactivar' : 'Activar'
})

const statusActionDescription = computed(() => {
  return props.business.isActive 
    ? 'El negocio será marcado como inactivo y no aparecerá en las búsquedas.'
    : 'El negocio será marcado como activo y volverá a aparecer en las búsquedas.'
})

const statusButtonClass = computed(() => {
  return props.business.isActive ? 'btn-warning' : 'btn-success'
})

// Methods
const openDeleteConfirmation = () => {
  showDeleteConfirmation.value = true
  deleteConfirmationText.value = ''
}

const closeDeleteConfirmation = () => {
  showDeleteConfirmation.value = false
  deleteConfirmationText.value = ''
}

const confirmDelete = () => {
  if (isDeleteConfirmationValid.value) {
    emit('delete', props.business.id)
    closeDeleteConfirmation()
  }
}

const openStatusConfirmation = () => {
  showStatusConfirmation.value = true
}

const closeStatusConfirmation = () => {
  showStatusConfirmation.value = false
}

const confirmStatusToggle = () => {
  emit('toggle-status', props.business.id)
  closeStatusConfirmation()
}
</script>

<template>
  <div class="danger-zone">
    <div class="danger-zone-header">
      <h3>Zona de Peligro</h3>
      <p>Las acciones en esta sección son irreversibles. Procede con precaución.</p>
    </div>

    <div class="danger-zone-content">
      <!-- Status Toggle Section -->
      <div class="action-section">
        <div class="action-info">
          <h4>{{ statusActionText }} Negocio</h4>
          <p>{{ statusActionDescription }}</p>
        </div>
        <button
          @click="openStatusConfirmation"
          :class="['btn', statusButtonClass]"
          :disabled="loading"
        >
          {{ statusActionText }}
        </button>
      </div>

      <!-- Delete Section -->
      <div class="action-section delete-section">
        <div class="action-info">
          <h4>Eliminar Negocio</h4>
          <p>
            Esta acción eliminará permanentemente el negocio y todos sus datos asociados.
            <strong>Esta acción no se puede deshacer.</strong>
          </p>
        </div>
        <button
          @click="openDeleteConfirmation"
          class="btn btn-danger"
          :disabled="loading"
        >
          Eliminar Negocio
        </button>
      </div>
    </div>

    <!-- Status Confirmation Modal -->
    <div v-if="showStatusConfirmation" class="modal-overlay" @click.self="closeStatusConfirmation">
      <div class="confirmation-modal">
        <div class="modal-header">
          <h3>Confirmar {{ statusActionText }}</h3>
          <button @click="closeStatusConfirmation" class="close-btn">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="warning-icon">⚠️</div>
          <p>
            ¿Estás seguro de que quieres <strong>{{ statusActionText.toLowerCase() }}</strong> 
            el negocio "<strong>{{ business.name }}</strong>"?
          </p>
          <p class="description">{{ statusActionDescription }}</p>
        </div>
        
        <div class="modal-footer">
          <button
            @click="closeStatusConfirmation"
            class="btn btn-outline"
            :disabled="loading"
          >
            Cancelar
          </button>
          <button
            @click="confirmStatusToggle"
            :class="['btn', statusButtonClass]"
            :disabled="loading"
          >
            <span v-if="loading" class="loading-spinner"></span>
            {{ statusActionText }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirmation" class="modal-overlay" @click.self="closeDeleteConfirmation">
      <div class="confirmation-modal delete-modal">
        <div class="modal-header">
          <h3>Confirmar Eliminación</h3>
          <button @click="closeDeleteConfirmation" class="close-btn">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="danger-icon">🚨</div>
          <p>
            Estás a punto de eliminar permanentemente el negocio 
            "<strong>{{ business.name }}</strong>".
          </p>
          <p class="warning-text">
            Esta acción eliminará:
          </p>
          <ul class="warning-list">
            <li>Toda la información del negocio</li>
            <li>Datos de contacto y dirección</li>
            <li>Historial y configuraciones</li>
            <li>Cualquier contenido asociado</li>
          </ul>
          <p class="final-warning">
            <strong>Esta acción no se puede deshacer.</strong>
          </p>
          
          <div class="confirmation-input">
            <label for="deleteConfirmation" class="form-label">
              Para confirmar, escribe "<strong>eliminar</strong>" en el campo de abajo:
            </label>
            <input
              id="deleteConfirmation"
              v-model="deleteConfirmationText"
              type="text"
              class="form-input"
              placeholder="Escribe 'eliminar' para confirmar"
              autocomplete="off"
            >
          </div>
        </div>
        
        <div class="modal-footer">
          <button
            @click="closeDeleteConfirmation"
            class="btn btn-outline"
            :disabled="loading"
          >
            Cancelar
          </button>
          <button
            @click="confirmDelete"
            class="btn btn-danger"
            :disabled="!isDeleteConfirmationValid || loading"
          >
            <span v-if="loading" class="loading-spinner"></span>
            Eliminar Permanentemente
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.danger-zone {
  border: 2px solid #fecaca;
  border-radius: 12px;
  background: #fef2f2;
  overflow: hidden;
}

.danger-zone-header {
  padding: 1.5rem;
  background: #fee2e2;
  border-bottom: 1px solid #fecaca;

  h3 {
    color: #dc2626;
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &::before {
      content: '⚠️';
      font-size: 1.5rem;
    }
  }

  p {
    color: #991b1b;
    margin: 0;
    font-size: 0.875rem;
  }
}

.danger-zone-content {
  padding: 1.5rem;
}

.action-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  &:last-child {
    margin-bottom: 0;
  }

  &.delete-section {
    border-color: #fecaca;
    background: #fffbfb;
  }
}

.action-info {
  flex: 1;

  h4 {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 0.5rem 0;
  }

  p {
    color: #6b7280;
    font-size: 0.875rem;
    margin: 0;
    line-height: 1.5;
  }

  .delete-section & {
    h4 {
      color: #dc2626;
    }
  }
}

// Modal Styles
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

.confirmation-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;

  &.delete-modal {
    border-top: 4px solid #dc2626;
  }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }

  .delete-modal & h3 {
    color: #dc2626;
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

.modal-body {
  padding: 1.5rem;
  text-align: center;

  .warning-icon,
  .danger-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  p {
    color: #374151;
    line-height: 1.6;
    margin-bottom: 1rem;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .description {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .warning-text {
    font-weight: 600;
    color: #dc2626;
    margin-bottom: 0.5rem;
  }

  .final-warning {
    font-weight: 700;
    color: #dc2626;
    background: #fef2f2;
    padding: 0.75rem;
    border-radius: 6px;
    border: 1px solid #fecaca;
  }
}

.warning-list {
  text-align: left;
  color: #374151;
  margin: 1rem 0;
  padding-left: 1.5rem;

  li {
    margin-bottom: 0.5rem;
    line-height: 1.5;
  }
}

.confirmation-input {
  margin-top: 1.5rem;
  text-align: left;

  .form-label {
    display: block;
    font-weight: 500;
    color: #374151;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }

  .form-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.875rem;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: #dc2626;
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
    }
  }
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;

  @media (max-width: 768px) {
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

.btn-danger {
  background: #dc2626;
  color: white;

  &:hover:not(:disabled) {
    background: #b91c1c;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
  }
}

.btn-warning {
  background: #f59e0b;
  color: white;

  &:hover:not(:disabled) {
    background: #d97706;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  }
}

.btn-success {
  background: #059669;
  color: white;

  &:hover:not(:disabled) {
    background: #047857;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
  }
}

.btn-outline {
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;

  &:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #9ca3af;
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>