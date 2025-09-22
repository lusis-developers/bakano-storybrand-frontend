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
  background: $white;
  border-bottom: 1px solid rgba($BAKANO-PURPLE, 0.08);
  padding: 2rem 0;
  box-shadow: 0 2px 20px rgba($BAKANO-PURPLE, 0.05);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, $BAKANO-PURPLE, transparent);
    opacity: 0.3;
  }

  .filters-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;

    @media (max-width: 768px) {
      padding: 0 1rem;
    }
  }

  .filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      label {
        font-size: 0.875rem;
        font-weight: 600;
        color: $BAKANO-DARK;
        margin-bottom: 0.5rem;
        font-family: $font-principal;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        position: relative;

        &::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 20px;
          height: 2px;
          background: linear-gradient(90deg, $BAKANO-PURPLE, $BAKANO-PINK);
          border-radius: 1px;
        }
      }

      .date-input {
        padding: 1rem 1.25rem;
        border: 1px solid rgba($BAKANO-PURPLE, 0.15);
        border-radius: 12px;
        font-size: 0.875rem;
        background: $white;
        color: $BAKANO-DARK;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: $font-secondary;
        box-shadow: 0 2px 8px rgba($BAKANO-PURPLE, 0.05);

        &:focus {
          outline: none;
          border-color: $BAKANO-PURPLE;
          box-shadow: 0 0 0 3px rgba($BAKANO-PURPLE, 0.1), 0 4px 20px rgba($BAKANO-PURPLE, 0.15);
          transform: translateY(-2px);
        }

        &:hover {
          border-color: rgba($BAKANO-PURPLE, 0.3);
          box-shadow: 0 4px 15px rgba($BAKANO-PURPLE, 0.1);
        }

        &::-webkit-calendar-picker-indicator {
          color: $BAKANO-PURPLE;
          cursor: pointer;
          filter: brightness(0) saturate(100%) invert(45%) sepia(100%) saturate(1000%) hue-rotate(260deg);
        }
      }
    }
  }

  .filters-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-start;
    align-items: center;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 0.75rem;
    }

    .apply-filters-button,
    .clear-filters-button {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      white-space: nowrap;
      font-family: $font-principal;
      position: relative;
      overflow: hidden;

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

      i {
        font-size: 16px;
        transition: transform 0.3s ease;
      }

      &:hover i {
        transform: scale(1.1);
      }

      @media (max-width: 768px) {
        justify-content: center;
        padding: 1.25rem;
        width: 100%;
      }
    }

    .apply-filters-button {
      background: linear-gradient(135deg, $BAKANO-PURPLE 0%, $BAKANO-PINK 100%);
      border: 1px solid transparent;
      color: $white;
      box-shadow: 0 4px 15px rgba($BAKANO-PURPLE, 0.3);

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 35px rgba($BAKANO-PURPLE, 0.4);
      }

      &:active {
        transform: translateY(-1px);
      }
    }

    .clear-filters-button {
      background: $white;
      border: 1px solid rgba($BAKANO-PURPLE, 0.2);
      color: $BAKANO-PURPLE;
      box-shadow: 0 2px 8px rgba($BAKANO-PURPLE, 0.08);

      &:hover {
        background: rgba($alert-error, 0.05);
        border-color: $alert-error;
        color: $alert-error;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba($alert-error, 0.15);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }
}

// Estilos globales para CustomSelect dentro de este componente
:deep(.custom-select) {
  .select-trigger {
    padding: 1rem 1.25rem;
    border: 1px solid rgba($BAKANO-PURPLE, 0.15);
    border-radius: 12px;
    background: $white;
    color: $BAKANO-DARK;
    font-family: $font-secondary;
    font-size: 0.875rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba($BAKANO-PURPLE, 0.05);

    &:hover {
      border-color: rgba($BAKANO-PURPLE, 0.3);
      box-shadow: 0 4px 15px rgba($BAKANO-PURPLE, 0.1);
    }

    &:focus,
    &.active {
      border-color: $BAKANO-PURPLE;
      box-shadow: 0 0 0 3px rgba($BAKANO-PURPLE, 0.1), 0 4px 20px rgba($BAKANO-PURPLE, 0.15);
      transform: translateY(-2px);
    }
  }

  .select-dropdown {
    border: 1px solid rgba($BAKANO-PURPLE, 0.15);
    border-radius: 12px;
    background: $white;
    box-shadow: 0 10px 40px rgba($BAKANO-PURPLE, 0.15);
    backdrop-filter: blur(10px);

    .select-option {
      padding: 0.875rem 1.25rem;
      color: $BAKANO-DARK;
      font-family: $font-secondary;
      transition: all 0.2s ease;

      &:hover {
        background: rgba($BAKANO-PURPLE, 0.05);
        color: $BAKANO-PURPLE;
      }

      &.selected {
        background: linear-gradient(135deg, $BAKANO-PURPLE, $BAKANO-PINK);
        color: $white;
      }
    }
  }
}
</style>