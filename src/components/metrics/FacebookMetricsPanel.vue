<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBusinessStore } from '@/stores/business.store'
import facebookService from '@/services/facebook.service'
import { useToast } from '@/composables/useToast'
import type { FacebookPageMetricsResponse, FacebookMetric } from '@/types/facebook.types'
import FacebookMetricCard from '@/components/metrics/FacebookMetricCard.vue'

const businessStore = useBusinessStore()
const { triggerToast } = useToast()

const loading = ref(false)
const error = ref<string | null>(null)
const response = ref<FacebookPageMetricsResponse | null>(null)

// Filtros
const view = ref<'week' | 'month' | 'custom'>('month')
const months = ref<number>(3)
const since = ref<string>('')
const until = ref<string>('')
const tz = ref<string>(Intl.DateTimeFormat().resolvedOptions().timeZone)
const offsetMinutes = ref<number | undefined>(undefined)

const businessId = computed(() => {
  const cur = businessStore.currentBusiness
  if (cur?.id || (cur as any)?._id) return String((cur as any).id || (cur as any)._id)
  const first = businessStore.businesses[0]
  return first ? String((first as any).id || (first as any)._id) : ''
})

async function loadMetrics() {
  if (!businessId.value) return
  loading.value = true
  error.value = null
  try {
    const query: any = { view: view.value, tz: tz.value }
    if (view.value === 'month') query.months = months.value
    if (view.value === 'custom') {
      if (since.value) query.since = new Date(since.value).toISOString()
      if (until.value) query.until = new Date(until.value).toISOString()
    }
    if (typeof offsetMinutes.value !== 'undefined') query.offsetMinutes = offsetMinutes.value
    response.value = await facebookService.getPageMetrics(businessId.value, query)
  } catch (e: any) {
    error.value = e?.message || 'No se pudieron cargar las métricas'
    triggerToast(error.value || 'No se pudieron cargar las métricas', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (businessStore.businesses.length === 0) {
    await businessStore.fetchBusinesses()
  }
  await loadMetrics()
})

// Utilidades
const metricsEntries = computed(() => {
  const m = response.value?.data?.insights?.metrics || {}
  return Object.entries(m) as Array<[string, FacebookMetric]>
})

function labelOf(key: string): string {
  const map: Record<string, string> = {
    page_impressions: 'Impresiones',
    page_impressions_unique: 'Usuarios únicos',
    page_impressions_paid: 'Impresiones de pago',
    page_post_engagements: 'Engagement',
    page_total_actions: 'Acciones totales',
  }
  return map[key] || key
}

function maxOfSeries(metric: FacebookMetric): number {
  return metric.series.reduce((max, p) => (p.value > max ? p.value : max), 0)
}
</script>

<template>
  <section class="fb-metrics">
    <header class="fb-metrics__header">
      <div class="title-row">
        <h2>Métricas de Facebook</h2>
        <p class="subtitle">Panel tipo Metricool con insights diarios</p>
      </div>
      <div class="page-id" v-if="response?.data?.page">
        <i class="fab fa-facebook"></i>
        <span>{{ response?.data?.page?.name || 'Página' }}</span>
        <span class="muted">ID: {{ response?.data?.page?.id }}</span>
      </div>
    </header>

    <div class="filters">
      <div class="filters__row">
        <label class="filters__item">
          <span>Vista</span>
          <select v-model="view" @change="loadMetrics">
            <option value="week">Semana</option>
            <option value="month">Meses</option>
            <option value="custom">Personalizada</option>
          </select>
        </label>
        <label v-if="view === 'month'" class="filters__item">
          <span>Meses</span>
          <input type="number" min="1" max="6" v-model.number="months" @change="loadMetrics" />
        </label>
        <label v-if="view === 'custom'" class="filters__item">
          <span>Desde</span>
          <input type="date" v-model="since" />
        </label>
        <label v-if="view === 'custom'" class="filters__item">
          <span>Hasta</span>
          <input type="date" v-model="until" />
        </label>
        <label class="filters__item">
          <span>Zona horaria</span>
          <input type="text" v-model="tz" @change="loadMetrics" />
        </label>
        <label class="filters__item">
          <span>Offset (min)</span>
          <input type="number" v-model.number="offsetMinutes" @change="loadMetrics" />
        </label>
        <button class="btn btn-primary" @click="loadMetrics" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          Aplicar
        </button>
      </div>
      <div class="filters__info" v-if="response?.filters">
        <span class="badge">Plan: {{ response?.filters?.plan }}</span>
        <span class="badge">Máx. días: {{ response?.filters?.maxDaysByPlan }}</span>
        <span class="badge" v-if="response?.filters?.monthsApplied">Meses: {{ response?.filters?.monthsApplied }}</span>
        <span class="badge" :class="{ warn: response?.filters?.adjusted }">Ajustado: {{ response?.filters?.adjusted ? 'Sí' : 'No' }}</span>
      </div>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-else class="metrics-grid">
      <FacebookMetricCard v-for="[key, metric] in metricsEntries" :key="key" :title="labelOf(key)" :metric="metric" />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.fb-metrics {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.fb-metrics__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.title-row h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: $BAKANO-DARK;
}

.title-row .subtitle {
  margin: 2px 0 0;
  color: lighten($BAKANO-DARK, 35%);
  font-size: 13px;
}

.page-id {
  display: flex;
  align-items: center;
  gap: 8px;
  color: $BAKANO-DARK;
}

.page-id .muted {
  color: lighten($BAKANO-DARK, 35%);
  font-size: 12px;
}

.filters {
  background: #fff;
  border: 1px solid lighten($BAKANO-DARK, 85%);
  border-radius: 12px;
  padding: 10px;
}

.filters__row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, auto));
  gap: 10px;
  align-items: end;
}

.filters__item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filters__item span {
  font-size: 12px;
  font-weight: 700;
  color: $BAKANO-DARK;
}

.filters__item input,
.filters__item select {
  padding: 8px 10px;
  border: 1px solid lighten($BAKANO-DARK, 80%);
  border-radius: 10px;
  font-size: 14px;
}

.filters__info {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border: 1px solid lighten($BAKANO-DARK, 80%);
  border-radius: 999px;
  font-size: 12px;
  color: $BAKANO-DARK;
}

.badge.warn {
  color: #b45309;
  border-color: #fed7aa;
  background: #fffbeb;
}

.btn {
  padding: 8px 12px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: $BAKANO-PINK;
  color: #fff;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-top-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: inline-block;
  animation: spin 1s linear infinite;
  margin-right: 6px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

/* Las tarjetas individuales se estilizan en FacebookMetricCard.vue */

@media (max-width: 768px) {
  .filters__row {
    grid-template-columns: 1fr 1fr;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
