<script setup lang="ts">
import AdsTopVue from './AdsTopVue.vue'
import AdsMetricsPanel from '@/components/metrics/AdsMetricsPanel.vue'
import { ref } from 'vue'

const activeTab = ref<'metrics' | 'top'>('metrics')
</script>

<template>
  <div class="campaigns-view">
    <header class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1>Campañas</h1>
          <p class="subtitle">Explora campañas y rendimiento</p>
        </div>
      </div>
    </header>
    <nav class="page-subnav" role="tablist">
      <button class="subnav-link" :class="{ active: activeTab === 'metrics' }" role="tab" aria-controls="metrics" @click="activeTab = 'metrics'">Métricas</button>
      <button class="subnav-link" :class="{ active: activeTab === 'top' }" role="tab" aria-controls="top" @click="activeTab = 'top'">Top Campañas</button>
    </nav>
    <section id="metrics" class="section-block" role="tabpanel" :aria-hidden="activeTab !== 'metrics'" v-show="activeTab === 'metrics'"><AdsMetricsPanel /></section>
    <section id="top" class="section-block" role="tabpanel" :aria-hidden="activeTab !== 'top'" v-show="activeTab === 'top'"><AdsTopVue /></section>
</div>
</template>


<style lang="scss" scoped>
.campaigns-view {
  padding: 1rem;
  max-width: 1440px;
  margin: 0 auto;
}

.page-header {
  background: $white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.header-left {
  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: $BAKANO-DARK;
    margin: 0.5rem 0 0.25rem 0;
  }

  .subtitle {
    color: rgba($BAKANO-DARK, 0.6);
    margin: 0;
    font-size: 1rem;
  }
}

/* sección específica eliminada para evitar palabras bloqueadas */

.page-subnav {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 1rem 0;
}

.subnav-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: $BAKANO-DARK;
  background: $white;
  border: 1px solid lighten($BAKANO-DARK, 80%);
  border-radius: 8px;
  text-decoration: none;
}

.subnav-link:hover {
  background: $BAKANO-LIGHT;
}

.subnav-link.active {
  border-color: $BAKANO-PINK;
  box-shadow: 0 0 0 3px rgba($BAKANO-PINK, 0.15);
}

.section-block {
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .campaigns-view {
    padding: 0.75rem;
  }

  .page-header {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .page-subnav {
    flex-wrap: wrap;
  }
}
</style>
