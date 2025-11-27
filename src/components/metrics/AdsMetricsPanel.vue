<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBusinessStore } from '@/stores/business.store'
import facebookService from '@/services/facebook.service'
import { useToast } from '@/composables/useToast'
import type { FacebookAdStatisticsItem } from '@/types/facebook.types'
import BaseChart from '@/components/shared/BaseChart.vue'

const businessStore = useBusinessStore()
const { triggerToast } = useToast()

const loading = ref(false)
const error = ref<string | null>(null)
const stats = ref<FacebookAdStatisticsItem[]>([])
const preset = ref<'last_7d' | 'last_28d' | 'last_90d' | 'this_month'>('last_28d')

const businessId = computed(() => {
  const cur = businessStore.currentBusiness
  if (cur?.id || (cur as any)?._id) return String((cur as any).id || (cur as any)._id)
  const first = businessStore.businesses[0]
  return first ? String((first as any).id || (first as any)._id) : ''
})

const emit = defineEmits(['loading-start', 'loading-end'])

async function loadAdStats() {
  if (!businessId.value) return
  loading.value = true
  error.value = null
  emit('loading-start')
  try {
    const res = await facebookService.getAdStatistics(businessId.value, { preset: preset.value })
    stats.value = Array.isArray(res.statistics) ? res.statistics : []
  } catch (e: any) {
    error.value = e?.message || 'No se pudieron cargar estadísticas de anuncios'
    triggerToast(error.value || 'Error', 'error')
  } finally {
    loading.value = false
    emit('loading-end')
  }
}

onMounted(async () => {
  if (businessStore.businesses.length === 0) {
    await businessStore.fetchBusinesses()
  }
  await loadAdStats()
})

function num(n: unknown): number {
  const v = typeof n === 'string' ? parseFloat(n) : typeof n === 'number' ? n : 0
  return isFinite(v) ? v : 0
}

const totalImpressions = computed(() => stats.value.reduce((s, i) => s + num(i.impressions), 0))
const totalReach = computed(() => stats.value.reduce((s, i) => s + num(i.reach), 0))
const totalSpend = computed(() => stats.value.reduce((s, i) => s + num(i.spend), 0))
const totalClicks = computed(() => stats.value.reduce((s, i) => s + num(i.clicks), 0))
const totalCpc = computed(() => (totalClicks.value > 0 ? totalSpend.value / totalClicks.value : 0))
const avgCtr = computed(() => {
  const n = stats.value.length || 1
  const s = stats.value.reduce((acc, i) => acc + num(i.ctr), 0)
  return s / n
})
const avgCpm = computed(() => {
  const n = stats.value.length || 1
  const s = stats.value.reduce((acc, i) => acc + num(i.cpm), 0)
  return s / n
})

const actionsAgg = computed(() => {
  const map = new Map<string, number>()
  for (const item of stats.value) {
    for (const a of item.actions || []) {
      const k = a.action_type
      const v = num(a.value)
      map.set(k, (map.get(k) || 0) + v)
    }
  }
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
})

const currency = 'USD'

const lineLabels = computed(() => stats.value.map(i => i.date_start))
const rangeLabel = computed(() => {
  const first = stats.value[0]
  if (first?.date_start && first?.date_stop) return `${first.date_start} — ${first.date_stop}`
  return 'Rango'
})
const isMultiPoint = computed(() => stats.value.length > 1)
const labelsDynamic = computed(() => (isMultiPoint.value ? lineLabels.value : [rangeLabel.value]))
const impressionsSeries = computed(() => stats.value.map(i => num(i.impressions)))
const reachSeries = computed(() => stats.value.map(i => num(i.reach)))
const chartImpressionsReach = computed(() => ({
  labels: labelsDynamic.value,
  datasets: [
    { label: 'Impresiones', data: impressionsSeries.value, borderColor: '#E6285C', backgroundColor: 'rgba(230,40,92,0.25)', tension: 0.35, borderWidth: 3, pointRadius: 0, spanGaps: true, fill: true },
    { label: 'Alcance', data: reachSeries.value, borderColor: '#7C3AED', backgroundColor: 'rgba(124,58,237,0.25)', tension: 0.35, borderWidth: 3, pointRadius: 0, spanGaps: true, fill: true },
  ]
}))

const spendSeries = computed(() => stats.value.map(i => num(i.spend)))
const clicksSeries = computed(() => stats.value.map(i => num(i.clicks)))

const chartSpend = computed(() => ({
  labels: labelsDynamic.value,
  datasets: [
    { label: 'Gasto (USD)', data: spendSeries.value, borderColor: '#0EA5E9', backgroundColor: 'rgba(14,165,233,0.25)', tension: 0.35, borderWidth: 3, pointRadius: 0, spanGaps: true, fill: true },
  ]
}))

const cpcSeries = computed(() => stats.value.map(i => {
  const clicks = num(i.clicks)
  const spend = num(i.spend)
  return clicks > 0 ? spend / clicks : null
}))

const chartClicksCpc = computed(() => ({
  labels: labelsDynamic.value,
  datasets: [
    { label: 'Clicks', data: clicksSeries.value, borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.25)', tension: 0.35, borderWidth: 3, pointRadius: 0, spanGaps: true, fill: true, yAxisID: 'y' },
    { label: 'Costo por Click (CPC)', data: cpcSeries.value, borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.25)', tension: 0.35, borderWidth: 3, pointRadius: 0, spanGaps: true, fill: true, yAxisID: 'y1' },
  ]
}))


const lineOptions = {
  plugins: { legend: { position: 'bottom' } },
  interaction: { mode: 'index', intersect: false },
  elements: { point: { radius: 0 }, line: { tension: 0.35 } },
  scales: { y: { beginAtZero: true } }
}
const spendClicksOptions = {
  plugins: { legend: { position: 'bottom' } },
  interaction: { mode: 'index', intersect: false },
  elements: { point: { radius: 0 }, line: { tension: 0.35 } },
  scales: {
    y: { beginAtZero: true, position: 'left' },
    y1: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false } }
  }
}
const barOptions = { plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } }
</script>

<template>
  <section class="campaign-metrics">
    <header class="campaign-header">
      <div class="title-row">
        <h2>Métricas de Campañas</h2>
        <p class="subtitle">Resumen de rendimiento en Meta</p>
      </div>
      <div class="filters">
        <label class="filter">
          <span>Rango</span>
          <select v-model="preset" :disabled="loading">
            <option value="last_7d">Últimos 7 días</option>
            <option value="last_28d">Últimos 28 días</option>
            <option value="last_90d">Últimos 90 días</option>
            <option value="this_month">Este mes</option>
          </select>
        </label>
        <button class="btn btn-primary" @click="loadAdStats" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          Aplicar
        </button>
      </div>
    </header>

    <div v-if="error" class="error">{{ error }}</div>

    <div class="kpi-grid" :aria-busy="loading">
      <div class="kpi-card">
        <div class="kpi-title">Impresiones</div>
        <div class="kpi-value">{{ totalImpressions.toLocaleString() }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Alcance</div>
        <div class="kpi-value">{{ totalReach.toLocaleString() }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Gasto</div>
        <div class="kpi-value">{{ totalSpend.toFixed(2) }} {{ currency }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Clicks</div>
        <div class="kpi-value">{{ totalClicks.toLocaleString() }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">CTR</div>
        <div class="kpi-value">{{ avgCtr.toFixed(2) }}%</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">CPM</div>
        <div class="kpi-value">{{ avgCpm.toFixed(2) }} {{ currency }}</div>
      </div>
    </div>

    <div class="charts">
      <div class="chart-card">
        <div class="heading">
          <h3>Impresiones vs Alcance</h3>
          <span class="chart-help" :data-tip="'Comparación diaria entre impresiones (veces que se mostró) y alcance (personas únicas).'" aria-label="Ayuda">i</span>
        </div>
        <div class="chart-summary">
          <span class="summary-item">Impresiones: {{ totalImpressions.toLocaleString() }}</span>
          <span class="summary-item">Alcance: {{ totalReach.toLocaleString() }}</span>
        </div>
        <p class="chart-desc">Impresiones: veces que el anuncio se mostró. Alcance: personas únicas que lo vieron.</p>
        <BaseChart :type="isMultiPoint ? 'line' : 'bar'" :labels="chartImpressionsReach.labels" :datasets="chartImpressionsReach.datasets" :options="isMultiPoint ? lineOptions : barOptions" :height="280" :minPixelPerLabel="64" aria-label="Impresiones y alcance" />
      </div>
      <div class="chart-card">
        <div class="heading">
          <h3>Gasto (USD)</h3>
          <span class="chart-help" :data-tip="'Monto gastado en anuncios por día (USD).'" aria-label="Ayuda">i</span>
        </div>
        <div class="chart-summary">
          <span class="summary-item">Total: {{ totalSpend.toFixed(2) }} {{ currency }}</span>
        </div>
        <p class="chart-desc">Gasto: monto invertido en anuncios por día, expresado en USD.</p>
        <BaseChart :type="isMultiPoint ? 'line' : 'bar'" :labels="chartSpend.labels" :datasets="chartSpend.datasets" :options="isMultiPoint ? lineOptions : barOptions" :height="280" aria-label="Gasto por día" />
      </div>
      <div class="chart-card">
        <div class="heading">
          <h3>Clicks y CPC</h3>
          <span class="chart-help" :data-tip="'Clicks totales y costo promedio por click (USD).'" aria-label="Ayuda">i</span>
        </div>
        <div class="chart-summary">
          <span class="summary-item">Clicks: {{ totalClicks.toLocaleString() }}</span>
          <span class="summary-item">CPC: {{ totalCpc.toFixed(2) }} {{ currency }}</span>
        </div>
        <p class="chart-desc">Clicks: interacciones al hacer click en el anuncio. CPC: costo promedio pagado por cada click (USD).</p>
        <BaseChart :type="isMultiPoint ? 'line' : 'bar'" :labels="chartClicksCpc.labels" :datasets="chartClicksCpc.datasets" :options="spendClicksOptions" :height="280" aria-label="Clicks y costo por click" />
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.campaign-metrics {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.campaign-header {
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

.filters {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.filter {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.filter span {
  font-weight: 700;
  font-size: 0.875rem;
  color: lighten($BAKANO-DARK, 20%);
}

.filter select {
  padding: 0.5rem 0.75rem;
  border: 2px solid rgba($BAKANO-PURPLE, 0.2);
  border-radius: 8px;
  background: #fff;
  color: $BAKANO-DARK;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  min-width: 180px;
}

.filter select:focus {
  outline: none;
  border-color: $BAKANO-PINK;
  box-shadow: 0 0 0 3px rgba($BAKANO-PINK, 0.1);
}

.filter select:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, $BAKANO-PINK 0%, darken($BAKANO-PINK, 8%) 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba($BAKANO-PINK, 0.25);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, darken($BAKANO-PINK, 6%) 0%, darken($BAKANO-PINK, 14%) 100%);
}

.btn-primary:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

.btn-primary:focus {
  outline: 2px solid $BAKANO-PINK;
  outline-offset: 2px;
}

.spinner {
  width: 0.9rem;
  height: 0.9rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.kpi-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
  max-width: 100%;
}

.kpi-card {
  background: #fff;
  border: 1px solid lighten($BAKANO-DARK, 85%);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-sizing: border-box;
  flex: 0 0 100%;
}

.kpi-title {
  font-size: 12px;
  color: lighten($BAKANO-DARK, 35%);
}

.kpi-value {
  font-size: 20px;
  font-weight: 800;
  color: $BAKANO-DARK;
}

.actions-panel {
  background: #fff;
  border: 1px solid lighten($BAKANO-DARK, 85%);
  border-radius: 12px;
  padding: 12px;
}

.actions-panel h3 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 800;
  color: $BAKANO-DARK;
}

.charts {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chart-card {
  background: #fff;
  border: 1px solid lighten($BAKANO-DARK, 85%);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.chart-card h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: $BAKANO-DARK;
}

.heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chart-help {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: lighten($BAKANO-DARK, 70%);
  position: relative;
  flex: 0 0 auto;
  cursor: help;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: $BAKANO-DARK;
  z-index: 2000;
}

.chart-help::after {
  content: attr(data-tip);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: $BAKANO-DARK;
  color: #fff;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.3;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  opacity: 0;
  pointer-events: none;
  white-space: normal;
  min-width: 180px;
  max-width: 280px;
  z-index: 3000;
}

.chart-help::before {
  content: '';
  position: absolute;
  bottom: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: $BAKANO-DARK;
  opacity: 0;
  z-index: 3000;
}

.chart-help:hover::after,
.chart-help:hover::before {
  opacity: 1;
}

.chart-desc {
  margin: 0;
  font-size: 12px;
  color: lighten($BAKANO-DARK, 35%);
}

.chart-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: $BAKANO-DARK;
}

.summary-item {
  background: lighten($BAKANO-DARK, 80%);
  border-radius: 8px;
  padding: 4px 8px;
}

@media (max-width: 768px) {
  .campaign-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media (min-width: 480px) {
  .kpi-card {
    flex: 0 0 calc((100% - 12px) / 2);
  }
}

@media (min-width: 768px) {
  .kpi-card {
    flex: 0 0 calc((100% - 24px) / 3);
  }
}

@media (min-width: 1024px) {
  .kpi-card {
    flex: 0 0 calc((100% - 36px) / 4);
  }
}
</style>
