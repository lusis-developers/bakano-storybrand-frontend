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
  background: linear-gradient(135deg, $white 0%, rgba($BAKANO-LIGHT, 0.3) 100%);
  border-bottom: 1px solid rgba($BAKANO-PURPLE, 0.08);
  padding: 2rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 20px rgba($BAKANO-PURPLE, 0.05);

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 1.5rem;
      padding: 0 1rem;
    }
  }

  .header-info {
    display: flex;
    align-items: flex-start;
    gap: 1.5rem;
    flex: 1;

    .back-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border: 1px solid rgba($BAKANO-PURPLE, 0.15);
      border-radius: 12px;
      background: $white;
      color: $BAKANO-PURPLE;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 8px rgba($BAKANO-PURPLE, 0.08);

      &:hover {
        background: $BAKANO-PURPLE;
        color: $white;
        border-color: $BAKANO-PURPLE;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba($BAKANO-PURPLE, 0.2);
      }

      &:active {
        transform: translateY(0);
      }

      i {
        font-size: 18px;
      }
    }

    .title-section {
      flex: 1;

      .page-title {
        font-size: 2.25rem;
        font-weight: 700;
        color: $BAKANO-DARK;
        margin: 0 0 0.5rem 0;
        line-height: 1.1;
        font-family: $font-principal;
        background: linear-gradient(135deg, $BAKANO-DARK 0%, $BAKANO-PURPLE 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;

        @media (max-width: 768px) {
          font-size: 1.875rem;
        }
      }

      .page-subtitle {
        font-size: 1rem;
        color: rgba($BAKANO-DARK, 0.6);
        margin: 0;
        line-height: 1.5;
        font-family: $font-secondary;
        font-weight: 400;
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 1rem;
    align-items: center;

    @media (max-width: 768px) {
      width: 100%;
      justify-content: space-between;
    }

    .filter-button,
    .generate-button {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.5rem;
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
      }

      @media (max-width: 768px) {
        flex: 1;
        justify-content: center;
        padding: 1rem;
      }
    }

    .filter-button {
      border: 1px solid rgba($BAKANO-PURPLE, 0.2);
      background: $white;
      color: $BAKANO-PURPLE;
      position: relative;
      box-shadow: 0 2px 8px rgba($BAKANO-PURPLE, 0.08);

      &:hover {
        background: rgba($BAKANO-PURPLE, 0.05);
        border-color: $BAKANO-PURPLE;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba($BAKANO-PURPLE, 0.15);
      }

      &.active {
        background: $BAKANO-PURPLE;
        border-color: $BAKANO-PURPLE;
        color: $white;
        box-shadow: 0 8px 25px rgba($BAKANO-PURPLE, 0.3);
      }

      .filter-count {
        background: $BAKANO-PINK;
        color: $white;
        font-size: 0.75rem;
        font-weight: 700;
        padding: 0.25rem 0.5rem;
        border-radius: 20px;
        min-width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pulse 2s infinite;
      }

      &.active .filter-count {
        background: $white;
        color: $BAKANO-PURPLE;
      }
    }

    .generate-button {
      background: linear-gradient(135deg, $BAKANO-PURPLE 0%, $BAKANO-PINK 100%);
      border: 1px solid transparent;
      color: $white;
      box-shadow: 0 4px 15px rgba($BAKANO-PURPLE, 0.3);

      &:hover:not(:disabled) {
        transform: translateY(-3px);
        box-shadow: 0 12px 35px rgba($BAKANO-PURPLE, 0.4);
      }

      &:active:not(:disabled) {
        transform: translateY(-1px);
      }

      &:disabled {
        background: rgba($BAKANO-PURPLE, 0.2);
        border-color: rgba($BAKANO-PURPLE, 0.1);
        color: rgba($BAKANO-DARK, 0.4);
        cursor: not-allowed;
        transform: none;
        box-shadow: none;

        &::before {
          display: none;
        }
      }
    }
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
</style>