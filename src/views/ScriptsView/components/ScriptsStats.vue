<script setup lang="ts">
interface ScriptStats {
  total: number
  completed: number
  pending: number
  byType: {
    content: number
    ad: number
  }
}

interface Props {
  scriptStats: ScriptStats
  hasScripts: boolean
}

defineProps<Props>()
</script>

<template>
  <div class="stats-section" v-if="hasScripts">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-file-alt"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ scriptStats.total }}</div>
          <div class="stat-label">Total Scripts</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon completed">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ scriptStats.completed }}</div>
          <div class="stat-label">Completados</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon pending">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ scriptStats.pending }}</div>
          <div class="stat-label">Pendientes</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon content">
          <i class="fas fa-video"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ scriptStats.byType.content }}</div>
          <div class="stat-label">Contenido</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.stats-section {
  padding: var(--spacing-lg) 0;

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-md);
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-lg);

    @media (max-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-sm);
      padding: 0 var(--spacing-md);
    }

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  }

  .stat-card {
    background: var(--color-white);
    border: 1px solid var(--color-border-light);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-lg);
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      border-color: var(--color-primary-light);
    }

    @media (max-width: 768px) {
      padding: var(--spacing-md);
      gap: var(--spacing-sm);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--border-radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-background-light);
      color: var(--color-text-secondary);
      flex-shrink: 0;

      @media (max-width: 768px) {
        width: 40px;
        height: 40px;
      }

      i {
        font-size: 20px;

        @media (max-width: 768px) {
          font-size: 18px;
        }
      }

      &.completed {
        background: rgba(34, 197, 94, 0.1);
        color: #22c55e;
      }

      &.pending {
        background: rgba(251, 191, 36, 0.1);
        color: #fbbf24;
      }

      &.content {
        background: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
      }
    }

    .stat-content {
      flex: 1;
      min-width: 0;

      .stat-number {
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-text-primary);
        line-height: 1.2;
        margin-bottom: var(--spacing-xs);

        @media (max-width: 768px) {
          font-size: var(--font-size-xl);
        }
      }

      .stat-label {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        font-weight: var(--font-weight-medium);
        line-height: 1.3;
      }
    }
  }
}
</style>