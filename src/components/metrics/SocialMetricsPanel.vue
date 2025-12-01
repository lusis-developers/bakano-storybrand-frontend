<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useBusinessStore } from '@/stores/business.store'
import facebookService from '@/services/facebook.service'
import instagramService from '@/services/instagram.service'
import { useToast } from '@/composables/useToast'
import type { FacebookMetric } from '@/types/facebook.types'
import FacebookMetricCard from '@/components/metrics/FacebookMetricCard.vue'
import InstagramPostsPanel from '@/components/metrics/InstagramPostsPanel.vue'

const businessStore = useBusinessStore()
const { triggerToast } = useToast()

const loading = ref(false)
const error = ref<string | null>(null)
const response = ref<any | null>(null)

const props = defineProps({
  platform: { type: String, required: false },
})
const platform = computed(() => (props.platform || 'facebook').toLowerCase())
const isInstagram = computed(() => platform.value === 'instagram')

// Filtros
const view = ref<'week' | 'month' | 'custom'>('month')
const months = ref<number>(1)
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

const emit = defineEmits(['loading-start', 'loading-end'])

async function loadMetrics() {
  if (!businessId.value) return
  loading.value = true
  error.value = null
  emit('loading-start')
  try {
    const query: any = { view: view.value, tz: tz.value }
    if (view.value === 'month') query.months = months.value
    if (view.value === 'custom') {
      if (since.value) query.since = new Date(since.value).toISOString()
      if (until.value) query.until = new Date(until.value).toISOString()
    }
    if (typeof offsetMinutes.value !== 'undefined') query.offsetMinutes = offsetMinutes.value
    if (isInstagram.value) {
      response.value = await instagramService.getPageMetrics(businessId.value, query)
    } else {
      response.value = await facebookService.getPageMetrics(businessId.value, query)
    }
  } catch (e: any) {
    error.value = e?.message || 'No se pudieron cargar las métricas'
    triggerToast(error.value || 'No se pudieron cargar las métricas', 'error')
  } finally {
    loading.value = false
    emit('loading-end')
  }
}

onMounted(async () => {
  if (businessStore.businesses.length === 0) {
    await businessStore.fetchBusinesses()
  }
  await loadMetrics()
})

watch(platform, async () => {
  await loadMetrics()
})

// Utilidades
const metricsEntries = computed(() => {
  const m = response.value?.data?.insights?.metrics || {}
  const entries = Object.entries(m) as Array<[string, FacebookMetric]>
  return entries.filter(([key]) => key !== 'follower_count' && key !== 'page_total_actions')
})

const appliedPreset = computed(() => (response.value?.data?.insights?.date_preset as string | undefined))
const appliedRange = computed(() => (response.value?.data?.insights?.range as { since?: string; until?: string } | undefined))
const appliedTz = computed(() => (response.value?.data?.insights?.timezone as string | undefined))
const rangeSummary = computed(() => {
  if (appliedPreset.value === 'last_28d') return 'Últimos 28 días'
  if (appliedPreset.value === 'last_90d') return 'Últimos 90 días'
  if (appliedPreset.value === 'this_month') return 'Este mes'
  if (view.value === 'week') return 'Últimos 7 días'
  if (view.value === 'month' && months.value) return `Meses: ${months.value}`
  if (appliedRange.value?.since && appliedRange.value?.until) return `Desde ${appliedRange.value.since.slice(0, 10)} hasta ${appliedRange.value.until.slice(0, 10)}`
  if (since.value && until.value) return `Desde ${since.value} hasta ${until.value}`
  return 'Rango aplicado'
})
const rangeSummaryText = computed(() => (loading.value ? `Cargando: ${rangeSummary.value}` : rangeSummary.value))

function labelOf(key: string): string {
  const fbMap: Record<string, string> = {
    page_impressions: 'Impresiones',
    page_impressions_unique: 'Usuarios únicos',
    page_impressions_paid: 'Impresiones de pago',
    page_post_engagements: 'Engagement',
    page_total_actions: 'Acciones totales',
  }
  const igMap: Record<string, string> = {
    reach: 'Alcance',
    profile_views: 'Vistas de perfil',
    accounts_engaged: 'Cuentas con interacción',
    total_interactions: 'Interacciones totales',
    likes: 'Me gusta',
    comments: 'Comentarios',
    shares: 'Compartidos',
    saves: 'Guardados',
    follows_and_unfollows: 'Seguimientos/Desfollows',
    views: 'Vistas',
    follower_count: 'Seguidores',
  }
  const map = isInstagram.value ? igMap : fbMap
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
        <h2>Métricas de Redes</h2>
        <p class="subtitle">Panel tipo Metricool con insights diarios</p>
        <p class="range-summary" aria-live="polite">{{ rangeSummaryText }} · {{ appliedTz || tz }}</p>
      </div>
      <div class="page-id" v-if="!isInstagram && response?.data?.page">
        <i class="fab fa-facebook"></i>
        <span>{{ response?.data?.page?.name || 'Página' }}</span>
        <span class="muted">ID: {{ response?.data?.page?.id }}</span>
      </div>
      <div class="page-id" v-else-if="isInstagram && response?.data?.instagram">
        <i class="fab fa-instagram"></i>
        <span>{{ response?.data?.instagram?.username || 'Cuenta' }}</span>
        <span class="muted">ID: {{ response?.data?.instagram?.id }}</span>
      </div>
    </header>

    <div class="filters">
      <div class="filters__row">
        <div class="filters__item">
          <span>Vista</span>
          <div class="segmented">
            <button type="button" class="seg-btn" :class="{ active: view === 'week' }" @click="view = 'week'; loadMetrics()" :disabled="loading">Semana</button>
            <button type="button" class="seg-btn" :class="{ active: view === 'month' }" @click="view = 'month'; loadMetrics()" :disabled="loading">Meses</button>
            <button type="button" class="seg-btn" :class="{ active: view === 'custom' }" @click="view = 'custom'" :disabled="loading">Personalizada</button>
          </div>
        </div>
        <label v-if="view === 'month'" class="filters__item">
          <span>Meses</span>
          <input type="number" min="1" :max="response?.filters?.maxMonthsByPlan || 6" v-model.number="months" @change="loadMetrics" :disabled="loading" />
        </label>
        <label v-if="view === 'custom'" class="filters__item">
          <span>Desde</span>
          <input type="date" v-model="since" :disabled="loading" />
        </label>
        <label v-if="view === 'custom'" class="filters__item">
          <span>Hasta</span>
          <input type="date" v-model="until" :disabled="loading" />
        </label>
        <label class="filters__item">
          <span>Zona horaria</span>
          <input type="text" v-model="tz" placeholder="p.ej. America/Guayaquil" @change="loadMetrics" :disabled="loading" />
        </label>
        <label class="filters__item">
          <span>Offset (min)</span>
          <input type="number" v-model.number="offsetMinutes" @change="loadMetrics" :disabled="loading" />
        </label>
        <div class="filters__actions">
          <button class="btn btn-primary" @click="loadMetrics" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            Aplicar
          </button>
        </div>
      </div>
      <div class="filters__info" v-if="response?.filters">
        <span class="badge">Plataforma: {{ isInstagram ? 'Instagram' : 'Facebook' }}</span>
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

    <InstagramPostsPanel v-if="isInstagram" />
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

.title-row .range-summary {
  margin: 2px 0 0;
  color: lighten($BAKANO-DARK, 35%);
  font-size: 12px;
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
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
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

.filters__item input:disabled,
.filters__item select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
    grid-template-columns: 1fr;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }
}

.segmented {
  display: inline-flex;
  background: #f8fafc;
  border: 1px solid lighten($BAKANO-DARK, 85%);
  border-radius: 999px;
  overflow: hidden;
}

.seg-btn {
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: $BAKANO-DARK;
  cursor: pointer;
}

.seg-btn.active {
  background: #fff;
}

.filters__actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
</style>
