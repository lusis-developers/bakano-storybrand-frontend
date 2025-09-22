<script setup lang="ts">
import { ref } from 'vue'
import CustomSelect from '../../../components/shared/CustomSelect.vue'

interface Props {
  showFiltersPanel: boolean
  hasActiveFilters: boolean
}

interface Emits {
  (e: 'apply-filters', filters: {
    filterType: string
    filterPlatform: string
    filterCompleted: string
    filterDateFrom: string
    filterDateTo: string
  }): void
  (e: 'clear-filters'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// Filtros locales
const filterType = ref<'all' | 'content' | 'ad'>('all')
const filterPlatform = ref<'all' | 'youtube' | 'instagram' | 'tiktok' | 'social' | 'email' | 'website'>('all')
const filterCompleted = ref<'all' | 'completed' | 'pending'>('all')
const filterDateFrom = ref('')
const filterDateTo = ref('')

// Options for CustomSelect components
const filterTypeOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'content', label: 'Contenido' },
  { value: 'ad', label: 'Anuncio' }
]

const filterPlatformOptions = [
  { value: 'all', label: 'Todas' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'social', label: 'Redes Sociales' },
  { value: 'email', label: 'Email' },
  { value: 'website', label: 'Sitio Web' }
]

const filterCompletedOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'completed', label: 'Completados' },
  { value: 'pending', label: 'Pendientes' }
]

const handleApplyFilters = () => {
  emit('apply-filters', {
    filterType: filterType.value,
    filterPlatform: filterPlatform.value,
    filterCompleted: filterCompleted.value,
    filterDateFrom: filterDateFrom.value,
    filterDateTo: filterDateTo.value
  })
}

const handleClearFilters = () => {
  filterType.value = 'all'
  filterPlatform.value = 'all'
  filterCompleted.value = 'all'
  filterDateFrom.value = ''
  filterDateTo.value = ''
  emit('clear-filters')
}
</script>

<template>
  <div class="filters-panel" v-if="showFiltersPanel">
    <div class="filters-content">
      <div class="filters-grid">
        <div class="filter-group">
          <label>Tipo</label>
          <CustomSelect
            v-model="filterType"
            :options="filterTypeOptions"
            placeholder="Seleccionar tipo"
            class="custom-select"
          />
        </div>
        
        <div class="filter-group">
          <label>Plataforma</label>
          <CustomSelect
            v-model="filterPlatform"
            :options="filterPlatformOptions"
            placeholder="Seleccionar plataforma"
            class="custom-select"
          />
        </div>
        
        <div class="filter-group">
          <label>Estado</label>
          <CustomSelect
            v-model="filterCompleted"
            :options="filterCompletedOptions"
            placeholder="Seleccionar estado"
            class="custom-select"
          />
        </div>
        
        <div class="filter-group">
          <label>Desde</label>
          <input 
            type="date" 
            v-model="filterDateFrom"
            class="date-input"
          >
        </div>
        
        <div class="filter-group">
          <label>Hasta</label>
          <input 
            type="date" 
            v-model="filterDateTo"
            class="date-input"
          >
        </div>
      </div>
      
      <div class="filters-actions">
        <button @click="handleApplyFilters" class="apply-filters-button">
          <i class="fas fa-search"></i>
          Aplicar Filtros
        </button>
        
        <button 
          @click="handleClearFilters" 
          class="clear-filters-button"
          v-if="hasActiveFilters"
        >
          <i class="fas fa-times"></i>
          Limpiar
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.filters-panel {
  background: var(--color-background-light);
  border-bottom: 1px solid var(--color-border-light);
  padding: var(--spacing-lg) 0;

  .filters-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-lg);

    @media (max-width: 768px) {
      padding: 0 var(--spacing-md);
    }
  }

  .filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-md);
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);

      label {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        color: var(--color-text-primary);
        margin-bottom: var(--spacing-xs);
      }

      .date-input {
        padding: var(--spacing-sm) var(--spacing-md);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-md);
        font-size: var(--font-size-sm);
        background: var(--color-white);
        color: var(--color-text-primary);
        transition: all 0.2s ease;

        &:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
        }

        &:hover {
          border-color: var(--color-primary-light);
        }
      }
    }
  }

  .filters-actions {
    display: flex;
    gap: var(--spacing-sm);
    justify-content: flex-start;

    @media (max-width: 768px) {
      flex-direction: column;
    }

    .apply-filters-button,
    .clear-filters-button {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-sm) var(--spacing-lg);
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;

      i {
        font-size: 14px;
      }

      @media (max-width: 768px) {
        justify-content: center;
        padding: var(--spacing-md);
      }
    }

    .apply-filters-button {
      background: var(--color-primary);
      border: 1px solid var(--color-primary);
      color: var(--color-white);

      &:hover {
        background: var(--color-primary-dark);
        border-color: var(--color-primary-dark);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.3);
      }
    }

    .clear-filters-button {
      background: var(--color-white);
      border: 1px solid var(--color-border);
      color: var(--color-text-secondary);

      &:hover {
        background: var(--color-background-light);
        border-color: var(--color-danger);
        color: var(--color-danger);
      }
    }
  }
}
</style>