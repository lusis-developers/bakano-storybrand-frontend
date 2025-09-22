<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { IContent } from '../../../types/content.types'

interface Props {
  currentContent: IContent | null
  hasActiveFilters: boolean
  activeFiltersCount: number
  canGenerateNewScript: boolean
}

interface Emits {
  (e: 'toggle-filters'): void
  (e: 'open-generate-modal'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const router = useRouter()

const pageTitle = computed(() => {
  if (props.currentContent && props.currentContent.questions) {
    return `Scripts - ${props.currentContent.questions.companyName}`
  }
  return 'Scripts'
})

const handleBack = () => {
  router.back()
}

const handleToggleFilters = () => {
  emit('toggle-filters')
}

const handleOpenGenerateModal = () => {
  emit('open-generate-modal')
}
</script>

<template>
  <div class="scripts-header">
    <div class="header-content">
      <div class="header-info">
        <button 
          @click="handleBack" 
          class="back-button"
          aria-label="Volver"
        >
          <i class="fas fa-arrow-left"></i>
        </button>
        <div class="title-section">
          <h1 class="page-title">{{ pageTitle }}</h1>
          <p class="page-subtitle" v-if="currentContent">
            Gestiona todos los scripts generados para tu proyecto
          </p>
        </div>
      </div>
      
      <div class="header-actions">
        <button 
          @click="handleToggleFilters"
          class="filter-button"
          :class="{ active: hasActiveFilters }"
        >
          <i class="fas fa-filter"></i>
          Filtros
          <span v-if="hasActiveFilters" class="filter-count">{{ activeFiltersCount }}</span>
        </button>
        
        <button 
          @click="handleOpenGenerateModal"
          class="generate-button"
          :disabled="!canGenerateNewScript"
        >
          <i class="fas fa-plus"></i>
          Generar Script
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.scripts-header {
  background: var(--color-white);
  border-bottom: 1px solid var(--color-border-light);
  padding: var(--spacing-lg) 0;
  position: sticky;
  top: 0;
  z-index: 10;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--spacing-lg);
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-lg);

    @media (max-width: 768px) {
      flex-direction: column;
      gap: var(--spacing-md);
      padding: 0 var(--spacing-md);
    }
  }

  .header-info {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    flex: 1;

    .back-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-md);
      background: var(--color-white);
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--color-background-light);
        color: var(--color-primary);
        border-color: var(--color-primary);
      }

      i {
        font-size: 16px;
      }
    }

    .title-section {
      flex: 1;

      .page-title {
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-text-primary);
        margin: 0 0 var(--spacing-xs) 0;
        line-height: 1.2;

        @media (max-width: 768px) {
          font-size: var(--font-size-xl);
        }
      }

      .page-subtitle {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        margin: 0;
        line-height: 1.4;
      }
    }
  }

  .header-actions {
    display: flex;
    gap: var(--spacing-sm);
    align-items: center;

    @media (max-width: 768px) {
      width: 100%;
      justify-content: space-between;
    }

    .filter-button,
    .generate-button {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-sm) var(--spacing-md);
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
        flex: 1;
        justify-content: center;
        padding: var(--spacing-sm);
      }
    }

    .filter-button {
      border: 1px solid var(--color-border);
      background: var(--color-white);
      color: var(--color-text-secondary);
      position: relative;

      &:hover {
        background: var(--color-background-light);
        border-color: var(--color-primary);
        color: var(--color-primary);
      }

      &.active {
        background: var(--color-primary);
        border-color: var(--color-primary);
        color: var(--color-white);
      }

      .filter-count {
        background: var(--color-white);
        color: var(--color-primary);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-bold);
        padding: 2px 6px;
        border-radius: var(--border-radius-full);
        min-width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      &.active .filter-count {
        background: var(--color-white);
        color: var(--color-primary);
      }
    }

    .generate-button {
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
        background: var(--color-background-light);
        border-color: var(--color-border);
        color: var(--color-text-disabled);
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }
    }
  }
}
</style>