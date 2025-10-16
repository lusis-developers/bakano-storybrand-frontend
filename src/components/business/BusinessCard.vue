<script setup lang="ts">
import { computed } from 'vue'
import type { IBusiness } from '@/types/business.types'
import IntegrationsStatus from './IntegrationsStatus.vue'

interface Props {
  business: IBusiness
  viewMode: 'grid' | 'list'
}

interface Emits {
  (e: 'edit', business: IBusiness): void
  (e: 'delete', business: IBusiness): void
  (e: 'connect-facebook'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Computed
const statusColor = computed(() => {
  return props.business.isActive ? 'success' : 'warning'
})

const statusText = computed(() => {
  return props.business.isActive ? 'Activo' : 'Inactivo'
})

const formattedDate = computed(() => {
  return new Date(props.business.createdAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
})

const hasAddress = computed(() => {
  const address = props.business.address
  return address && (address.city || address.country)
})

const addressText = computed(() => {
  const address = props.business.address
  if (!address) return ''

  const parts = []
  if (address.city) parts.push(address.city)
  if (address.country) parts.push(address.country)

  return parts.join(', ')
})

// Methods
const handleEdit = () => {
  emit('edit', props.business)
}

const handleDelete = () => {
  emit('delete', props.business)
}

const openWebsite = () => {
  if (props.business.website) {
    window.open(props.business.website, '_blank')
  }
}

const sendEmail = () => {
  if (props.business.email) {
    window.location.href = `mailto:${props.business.email}`
  }
}

const callPhone = () => {
  if (props.business.phone) {
    window.location.href = `tel:${props.business.phone}`
  }
}
</script>

<template>
  <div :class="['business-card', viewMode, { inactive: !business.isActive }]">
    <!-- Card Header -->
    <div class="card-header">
      <div class="business-info">
        <div class="business-name-section">
          <h3 class="business-name">{{ business.name }}</h3>
          <span :class="['status-badge', statusColor]">{{ statusText }}</span>
        </div>
        
        <p v-if="business.industry" class="business-industry">
          {{ business.industry }}
        </p>
      </div>

      <div class="card-actions">
        <button 
          @click="handleEdit" 
          class="action-btn edit"
          title="Editar negocio"
        >
          <i class="fas fa-edit"></i>
        </button>
        
      </div>
    </div>

    <!-- Card Content -->
    <div class="card-content">
      <p v-if="business.description" class="business-description">
        {{ business.description }}
      </p>

      <!-- Contact Information -->
      <div v-if="business.email || business.phone || business.website" class="contact-info">
        <div class="contact-grid">
          <button 
            v-if="business.email"
            @click="sendEmail"
            class="contact-item email"
            title="Enviar email"
          >
            <span class="contact-icon"><i class="fas fa-envelope"></i></span>
            <span class="contact-text">{{ business.email }}</span>
          </button>

          <button 
            v-if="business.phone"
            @click="callPhone"
            class="contact-item phone"
            title="Llamar"
          >
            <span class="contact-icon"><i class="fas fa-phone"></i></span>
            <span class="contact-text">{{ business.phone }}</span>
          </button>

          <button 
            v-if="business.website"
            @click="openWebsite"
            class="contact-item website"
            title="Visitar sitio web"
          >
            <span class="contact-icon"><i class="fas fa-globe"></i></span>
            <span class="contact-text">{{ business.website.replace(/^https?:\/\//, '') }}</span>
          </button>
        </div>
      </div>

      <!-- Address -->
      <div v-if="hasAddress" class="address-info">
        <span class="address-icon"><i class="fas fa-map-marker-alt"></i></span>
        <span class="address-text">{{ addressText }}</span>
      </div>
      
      <!-- Integrations Status -->
      <div class="integrations-wrapper">
        <IntegrationsStatus @connect-facebook="$emit('connect-facebook')" />
      </div>
    </div>

    <!-- Card Footer -->
    <div class="card-footer">
      <div class="footer-info">
        <span class="created-date">Creado: {{ formattedDate }}</span>
        <span v-if="business.employees?.length" class="employee-count">
          <i class="fas fa-users"></i> {{ business.employees.length }} empleado{{ business.employees.length !== 1 ? 's' : '' }}
        </span>
      </div>

      <div class="footer-actions">
        <button @click="handleEdit" class="btn btn-outline btn-sm">
          Editar
        </button>
        
        <button @click="handleDelete" class="btn btn-danger btn-sm">
          Eliminar
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.business-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  overflow: hidden;
  border: 1px solid #e2e8f0;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  &.inactive {
    opacity: 0.7;
    background: #f8fafc;
  }

  // Grid view
  &.grid {
    display: flex;
    flex-direction: column;
    height: 100%;

    .card-content {
      flex: 1;
    }
  }

  // List view
  &.list {
    display: flex;
    align-items: center;
    padding: 1rem 1.5rem;
    min-height: auto;

    .card-header {
      flex: 1;
      padding: 0;
      border-bottom: none;
    }

    .card-content {
      flex: 2;
      padding: 0 1rem;
    }

    .card-footer {
      flex: 1;
      padding: 0;
      border-top: none;
      justify-content: flex-end;

      .footer-info {
        display: none;
      }
    }

    .business-name-section {
      flex-direction: row;
      align-items: center;
      gap: 0.75rem;
    }

    .business-description {
      display: -webkit-box;
      line-clamp: 2;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .contact-grid {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .contact-item {
      .contact-text {
        max-width: 120px;
      }
    }
  }
}

// Card Header
.card-header {
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
}

.business-info {
  flex: 1;
  min-width: 0;
}

.business-name-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.business-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  line-height: 1.3;
  word-break: break-word;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;

  &.success {
    background: #dcfce7;
    color: #166534;
  }

  &.warning {
    background: #fef3c7;
    color: #92400e;
  }
}

.business-industry {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
  font-weight: 500;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }

  &.edit:hover {
    background: #eff6ff;
    border-color: #3b82f6;
  }

  &.danger:hover {
    background: #fef2f2;
    border-color: #ef4444;
  }
}

// Card Content
.card-content {
  padding: 0 1.5rem 1rem 1.5rem;

  @media (max-width: 768px) {
    padding: 0 1rem 1rem 1rem;
  }
}

.business-description {
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0 0 1rem 0;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.contact-info {
  margin-bottom: 1rem;
}

.contact-grid {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: 1fr;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-size: 0.75rem;

  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }

  &.email:hover {
    background: #eff6ff;
    border-color: #3b82f6;
  }

  &.phone:hover {
    background: #f0fdf4;
    border-color: #22c55e;
  }

  &.website:hover {
    background: #fefbef;
    border-color: #f59e0b;
  }
}

.contact-icon {
  font-size: 0.875rem;
  flex-shrink: 0;
}

.contact-text {
  color: #374151;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.address-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.address-icon {
  font-size: 0.875rem;
  flex-shrink: 0;
}

.address-text {
  font-weight: 500;
}

// Card Footer
.card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  background: #fafbfc;

  @media (max-width: 768px) {
    padding: 1rem;
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #64748b;

  @media (max-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
  }
}

.created-date,
.employee-count {
  font-weight: 500;
}

.footer-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;

  @media (max-width: 768px) {
    justify-content: center;
  }
}

// Buttons
.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.75rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 70px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.6875rem;
  min-width: 60px;
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

.btn-danger {
  background: #ef4444;
  color: white;
  border: 1px solid #ef4444;

  &:hover:not(:disabled) {
    background: #dc2626;
    border-color: #dc2626;
  }
}

// Integrations wrapper
.integrations-wrapper {
  margin-top: 1.5rem;
  border-top: 1px solid #f1f5f9;
  padding-top: 1.5rem;
}
</style>