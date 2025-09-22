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
  padding: 2rem 0;
  background: linear-gradient(135deg, rgba($BAKANO-LIGHT, 0.1) 0%, rgba($white, 0.8) 100%);

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;

    @media (max-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      padding: 0 1rem;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    }

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }

  .stat-card {
    background: $white;
    border: 1px solid rgba($BAKANO-PURPLE, 0.08);
    border-radius: 16px;
    padding: 2rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 20px rgba($BAKANO-PURPLE, 0.08);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, $BAKANO-PURPLE, $BAKANO-PINK);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba($BAKANO-PURPLE, 0.15);
      border-color: rgba($BAKANO-PURPLE, 0.2);

      &::before {
        transform: scaleX(1);
      }

      .stat-icon {
        transform: scale(1.1) rotate(5deg);
      }

      .stat-number {
        color: $BAKANO-PURPLE;
      }
    }

    @media (max-width: 768px) {
      padding: 1.5rem;
      gap: 1rem;
      flex-direction: column;
      text-align: center;
    }

    @media (max-width: 480px) {
      flex-direction: row;
      text-align: left;
    }

    .stat-icon {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba($BAKANO-PURPLE, 0.08);
      color: $BAKANO-PURPLE;
      flex-shrink: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;

      @media (max-width: 768px) {
        width: 56px;
        height: 56px;
      }

      i {
        font-size: 24px;
        position: relative;
        z-index: 2;

        @media (max-width: 768px) {
          font-size: 20px;
        }
      }

      &::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 16px;
        background: linear-gradient(135deg, rgba($BAKANO-PURPLE, 0.1), rgba($BAKANO-PINK, 0.1));
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      &:hover::after {
        opacity: 1;
      }

      &.completed {
        background: linear-gradient(135deg, rgba($BAKANO-GREEN, 0.1), rgba($BAKANO-GREEN, 0.05));
        color: $BAKANO-GREEN;
        
        &::after {
          background: linear-gradient(135deg, rgba($BAKANO-GREEN, 0.2), rgba($BAKANO-GREEN, 0.1));
        }
      }

      &.pending {
        background: linear-gradient(135deg, rgba($alert-warning, 0.1), rgba($alert-warning, 0.05));
        color: $alert-warning;
        
        &::after {
          background: linear-gradient(135deg, rgba($alert-warning, 0.2), rgba($alert-warning, 0.1));
        }
      }

      &.content {
        background: linear-gradient(135deg, rgba($BAKANO-PURPLE, 0.1), rgba($BAKANO-PINK, 0.05));
        color: $BAKANO-PURPLE;
        
        &::after {
          background: linear-gradient(135deg, rgba($BAKANO-PURPLE, 0.2), rgba($BAKANO-PINK, 0.1));
        }
      }
    }

    .stat-content {
      flex: 1;
      min-width: 0;

      .stat-number {
        font-size: 2.5rem;
        font-weight: 800;
        color: $BAKANO-DARK;
        line-height: 1;
        margin-bottom: 0.5rem;
        font-family: $font-principal;
        transition: color 0.3s ease;

        @media (max-width: 768px) {
          font-size: 2rem;
        }

        @media (max-width: 480px) {
          font-size: 1.75rem;
        }
      }

      .stat-label {
        font-size: 0.875rem;
        color: rgba($BAKANO-DARK, 0.6);
        font-weight: 600;
        line-height: 1.3;
        font-family: $font-secondary;
        text-transform: uppercase;
        letter-spacing: 0.5px;

        @media (max-width: 768px) {
          font-size: 0.8rem;
        }
      }
    }
  }
}
</style>