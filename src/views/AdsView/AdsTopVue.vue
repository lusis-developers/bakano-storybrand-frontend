<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useBusinessStore } from '@/stores/business.store'
import facebookService from '@/services/facebook.service'
import type { FacebookAdItem } from '@/types/facebook.types'
import BaseChart from '@/components/shared/BaseChart.vue'
import Modal from '@/components/shared/Modal.vue'

const business = useBusinessStore()
const loading = ref(false)
const error = ref<string | null>(null)
const ads = ref<FacebookAdItem[]>([])
const showModal = ref(false)
const selected = ref<FacebookAdItem | null>(null)

const businessId = computed(() => String((business.currentBusiness as any)?.id || (business.currentBusiness as any)?._id || ''))

const loadTopAds = async () => {
  if (!businessId.value) {
    try {
      const ensured = await (business as any).ensureCurrentBusiness?.()
      if (!ensured) {
        error.value = 'Selecciona o carga un negocio para ver Top Ads'
        return
      }
    } catch (e) {
      error.value = 'Selecciona o carga un negocio para ver Top Ads'
      return
    }
  }
  loading.value = true
  error.value = null
  try {
    const res = await facebookService.getTopAds(businessId.value, 4)
    ads.value = (res.ads || []).slice(0, 4)
  } catch (e: any) {
    error.value = e?.message || 'No se pudieron cargar los Top Ads'
  } finally {
    loading.value = false
  }
}

onMounted(loadTopAds)

const viewportW = ref<number>(typeof window !== 'undefined' ? window.innerWidth : 1024)
const onResize = () => { viewportW.value = typeof window !== 'undefined' ? window.innerWidth : 1024 }
onMounted(() => { if (typeof window !== 'undefined') window.addEventListener('resize', onResize) })
onBeforeUnmount(() => { if (typeof window !== 'undefined') window.removeEventListener('resize', onResize) })
const isMobile = computed(() => viewportW.value <= 480)

const openModal = (ad: FacebookAdItem) => {
  selected.value = ad
  showModal.value = true
}
const closeModal = () => {
  showModal.value = false
  selected.value = null
}

const num = (n: unknown): number => {
  const v = typeof n === 'string' ? parseFloat(n) : typeof n === 'number' ? n : 0
  return isFinite(v) ? v : 0
}

const selMetrics = computed(() => selected.value?.metrics)
const platformBreakdown = computed(() => selected.value?.platformBreakdown || [])
const platformLabel = (p?: string) => (p === 'facebook' ? 'Facebook' : p === 'instagram' ? 'Instagram' : (p || 'Plataforma'))
const platformLabels = computed(() => platformBreakdown.value.map(p => platformLabel(p.publisher_platform)))
const fbPlatform = computed(() => platformBreakdown.value.find(p => p.publisher_platform === 'facebook'))
const igPlatform = computed(() => platformBreakdown.value.find(p => p.publisher_platform === 'instagram'))
const chartPlatformImpressionsReach = computed(() => ({
  labels: platformLabels.value,
  datasets: [
    { label: 'Impresiones', data: platformBreakdown.value.map(p => num(p.impressions)), borderColor: '#E6285C', backgroundColor: 'rgba(230,40,92,0.25)', borderWidth: 3 },
    { label: 'Alcance', data: platformBreakdown.value.map(p => num(p.reach)), borderColor: '#7C3AED', backgroundColor: 'rgba(124,58,237,0.25)', borderWidth: 3 },
  ],
}))
const chartPlatformClicks = computed(() => ({
  labels: platformLabels.value,
  datasets: [
    { label: 'Clicks', data: platformBreakdown.value.map(p => num(p.clicks)), borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.25)', borderWidth: 3 },
  ],
}))
const chartPlatformSpend = computed(() => ({
  labels: platformLabels.value,
  datasets: [
    { label: 'Gasto (USD)', data: platformBreakdown.value.map(p => num(p.spend)), borderColor: '#0EA5E9', backgroundColor: 'rgba(14,165,233,0.25)', borderWidth: 3 },
  ],
}))
const chartPlatformCtr = computed(() => ({
  labels: platformLabels.value,
  datasets: [
    { label: 'CTR (%)', data: platformBreakdown.value.map(p => num(p.ctr)), borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.25)', borderWidth: 3 },
  ],
}))
const periodLabel = computed(() => {
  const m = selMetrics.value
  if (m?.date_start && m?.date_stop) return [`${m.date_start} — ${m.date_stop}`]
  return ['Periodo']
})

const chartImpressionsReach = computed(() => ({
  labels: periodLabel.value,
  datasets: [
    { label: 'Impresiones', data: [num(selMetrics.value?.impressions)], borderColor: '#E6285C', backgroundColor: 'rgba(230,40,92,0.25)', borderWidth: 3 },
    { label: 'Alcance', data: [num(selMetrics.value?.reach)], borderColor: '#7C3AED', backgroundColor: 'rgba(124,58,237,0.25)', borderWidth: 3 },
  ],
}))

const chartSpend = computed(() => ({
  labels: periodLabel.value,
  datasets: [
    { label: 'Gasto (USD)', data: [num(selMetrics.value?.spend)], borderColor: '#0EA5E9', backgroundColor: 'rgba(14,165,233,0.25)', borderWidth: 3 },
  ],
}))

const chartClicksCpc = computed(() => {
  const clicks = num(selMetrics.value?.clicks)
  const spend = num(selMetrics.value?.spend)
  const cpc = clicks > 0 ? spend / clicks : 0
  return {
    labels: periodLabel.value,
    datasets: [
      { label: 'Clicks', data: [clicks], borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.25)', borderWidth: 3 },
      { label: 'CPC (USD)', data: [cpc], borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.25)', borderWidth: 3 },
    ],
  }
})

const topActions = computed(() => {
  const actions = selMetrics.value?.actions || []
  const sorted = [...actions].map(a => ({ type: a.action_type, value: num(a.value) })).sort((a, b) => b.value - a.value)
  return sorted.slice(0, 8)
})

const costPerActions = computed(() => {
  const list = selMetrics.value?.cost_per_action_type || []
  return [...list]
    .map((i: any) => ({ type: String(i.action_type), value: num(i.value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
})

const metricDesc: Record<string, string> = {
  impressions: 'Veces que se mostró el anuncio',
  reach: 'Personas únicas que vieron el anuncio',
  clicks: 'Total de clicks registrados',
  spend: 'Monto total gastado (USD)',
  ctr: 'Porcentaje de clicks respecto a impresiones',
  cpc: 'Costo promedio pagado por cada click (USD)'
}

const humanize = (raw: string) => raw
  .replace(/offsite_conversion\./g, '')
  .replace(/onsite_conversion\./g, '')
  .replace(/fb_pixel\./g, '')
  .replace(/[._]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

const explainAction = (key: string): string => {
  if (metricDesc[key]) return metricDesc[key]
  const k = key.toLowerCase()
  if (k === 'link_click') return 'Clicks en enlaces del anuncio'
  if (k === 'video_view') return 'Reproducciones del video del anuncio'
  if (k === 'page_engagement') return 'Interacciones con la página (reacciones, comentarios, compartidos)'
  if (k === 'post_engagement' || k === 'post_interaction_gross') return 'Interacciones con publicaciones (reacciones, comentarios, compartidos)'
  if (k.includes('landing_page_view')) return 'Vistas de la página de destino del sitio'
  if (k.includes('view_content') || k.includes('omni_view_content')) return 'Vistas de contenido en el sitio'
  if (k.includes('add_to_cart')) return 'Añadidos al carrito en el sitio'
  if (k.includes('initiate_checkout')) return 'Inicios del proceso de compra en el sitio'
  if (k === 'like' || k === 'post_reaction') return 'Reacciones a la publicación (me gusta, etc.)'
  if (k === 'comment') return 'Comentarios en la publicación'
  if (k.includes('lead')) return 'Leads/Registros generados'
  if (k === 'post') return 'Publicaciones realizadas'
  if (k === 'onsite_web_view_content') return 'Vistas de contenido (evento onsite)'
  if (k === 'onsite_web_add_to_cart' || k === 'onsite_web_app_add_to_cart') return 'Añadidos al carrito (evento onsite)'
  if (k === 'onsite_web_initiate_checkout') return 'Inicio de compra (evento onsite)'
  if (k === 'onsite_web_lead') return 'Lead generado en el sitio (evento onsite)'
  if (k.includes('messaging_conversation_started')) return 'Conversaciones de mensajes iniciadas'
  if (k.includes('messaging_conversation_replied')) return 'Conversaciones de mensajes con respuesta en el período'
  if (k.includes('messaging_first_reply')) return 'Primeras respuestas del usuario en mensajes'
  if (k.includes('messaging_user_depth_')) return 'Interacciones por mensajes (niveles de profundidad)'
  if (k.includes('post_save')) return 'Guardados de la publicación por usuarios'
  if (k.includes('post_net_save')) return 'Guardados netos de la publicación'
  if (k.includes('post_unsave')) return 'Publicaciones desguardadas por usuarios'
  const pretty = humanize(key)
  return `Evento de Meta: ${pretty.charAt(0).toUpperCase() + pretty.slice(1)}`
}

const tip = (key: string) => explainAction(key)

const hoveredTip = ref<{ text: string; x: number; y: number } | null>(null)
const onTipEnter = (text: string, e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const x = rect.left + rect.width / 2
  const y = rect.top - 10
  hoveredTip.value = { text, x, y }
}
const onTipLeave = () => { hoveredTip.value = null }
</script>

<template>
  <div class="campaign-top">
    <div class="campaign-top__header">
      <h2>Top 4 Campañas</h2>
      <button class="refresh-btn" type="button" @click="loadTopAds" :disabled="loading">{{ loading ? 'Cargando…' : 'Actualizar' }}</button>
    </div>
    <p class="list-subtitle">Aquí verás las mejores publicaciones destacadas</p>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-else-if="!loading && ads.length === 0" class="empty">No hay campañas destacadas disponibles.</p>

    <ul v-else class="campaign-list">
      <li v-for="(ad, i) in ads" :key="ad.id" :class="['campaign-item', 'is-top' + (i + 1)]">
        <div class="campaign-rank">#{{ i + 1 }}</div>
        <div v-if="i === 0" class="best-badge"><i class="fas fa-trophy" aria-hidden="true"></i> Mejor desempeño</div>
        <div class="campaign-thumb" v-if="ad.preview?.thumbnailUrl">
          <img :src="ad.preview.thumbnailUrl" alt="Preview" />
        </div>
        <div class="campaign-info">
          <div class="campaign-title">{{ ad.name || ad.metrics?.ad_name || 'Campaña' }}</div>
          <div class="campaign-metrics-squares">
            <div class="metric-square pink">
              <div class="metric-icon"><i class="fas fa-eye" aria-hidden="true"></i></div>
              <div class="metric-label">Impresiones</div>
              <div class="metric-value">{{ (ad.metrics?.impressions ?? 0).toLocaleString() }}</div>
            </div>
            <div class="metric-square purple">
              <div class="metric-icon"><i class="fas fa-users" aria-hidden="true"></i></div>
              <div class="metric-label">Alcance</div>
              <div class="metric-value">{{ (ad.metrics?.reach ?? 0).toLocaleString() }}</div>
            </div>
            <div class="metric-square dark">
              <div class="metric-icon"><i class="fas fa-hand-pointer" aria-hidden="true"></i></div>
              <div class="metric-label">Clicks</div>
              <div class="metric-value">{{ (ad.metrics?.clicks ?? 0).toLocaleString() }}</div>
            </div>
            <div class="metric-square pink">
              <div class="metric-icon"><i class="fas fa-dollar-sign" aria-hidden="true"></i></div>
              <div class="metric-label">Gasto</div>
              <div class="metric-value">${{ Number(ad.metrics?.spend ?? 0).toFixed(2) }}</div>
            </div>
            <div class="metric-square purple">
              <div class="metric-icon"><i class="fas fa-percent" aria-hidden="true"></i></div>
              <div class="metric-label">CTR</div>
              <div class="metric-value">{{ Number(ad.metrics?.ctr ?? 0).toFixed(2) }}%</div>
            </div>
          </div>
          <a v-if="ad.links?.permalinkUrl" class="campaign-link" :href="ad.links.permalinkUrl" target="_blank" rel="noopener noreferrer">Ver en Meta</a>
          <button class="details-btn" type="button" @click="openModal(ad)">Ver métricas a profundidad</button>
        </div>
      </li>
    </ul>
    <Modal :visible="showModal && !!selected" :title="selected?.name || selected?.metrics?.ad_name" width="960px" @close="closeModal">
      <div class="insights-content">
          <div class="modal-summary">
          <div class="summary-card"><div class="label">Impresiones <span class="tip" @mouseenter="onTipEnter(tip('impressions'), $event)" @mouseleave="onTipLeave">i</span></div><div class="value">{{ num(selMetrics?.impressions).toLocaleString() }}</div></div>
          <div class="summary-card"><div class="label">Alcance <span class="tip" @mouseenter="onTipEnter(tip('reach'), $event)" @mouseleave="onTipLeave">i</span></div><div class="value">{{ num(selMetrics?.reach).toLocaleString() }}</div></div>
          <div class="summary-card"><div class="label">Clicks <span class="tip" @mouseenter="onTipEnter(tip('clicks'), $event)" @mouseleave="onTipLeave">i</span></div><div class="value">{{ num(selMetrics?.clicks).toLocaleString() }}</div></div>
          <div class="summary-card"><div class="label">Gasto (USD) <span class="tip" @mouseenter="onTipEnter(tip('spend'), $event)" @mouseleave="onTipLeave">i</span></div><div class="value">{{ num(selMetrics?.spend).toFixed(2) }}</div></div>
          <div class="summary-card"><div class="label">CTR <span class="tip" @mouseenter="onTipEnter(tip('ctr'), $event)" @mouseleave="onTipLeave">i</span></div><div class="value">{{ num(selMetrics?.ctr).toFixed(2) }}%</div></div>
          <div class="summary-card"><div class="label">CPC <span class="tip" @mouseenter="onTipEnter(tip('cpc'), $event)" @mouseleave="onTipLeave">i</span></div><div class="value">{{ (num(selMetrics?.spend) / Math.max(1, num(selMetrics?.clicks))).toFixed(2) }}</div></div>
        </div>
        <div class="modal-charts">
          <div class="chart-card">
            <div class="heading"><h3>Impresiones vs Alcance</h3></div>
            <BaseChart :type="'bar'" :labels="chartImpressionsReach.labels" :datasets="chartImpressionsReach.datasets" :height="isMobile ? 180 : 240" />
          </div>
          <div class="chart-card">
            <div class="heading"><h3>Gasto (USD)</h3></div>
            <BaseChart :type="'bar'" :labels="chartSpend.labels" :datasets="chartSpend.datasets" :height="isMobile ? 180 : 240" />
          </div>
          <div class="chart-card">
            <div class="heading"><h3>Clicks y CPC</h3></div>
            <BaseChart :type="'bar'" :labels="chartClicksCpc.labels" :datasets="chartClicksCpc.datasets" :height="isMobile ? 180 : 240" />
          </div>
        </div>
        <div class="modal-actions">
          <h4>Acciones más relevantes</h4>
          <ul class="actions-list">
            <li v-for="a in topActions" :key="a.type"><span class="type">{{ a.type }} <span class="tip" @mouseenter="onTipEnter(tip(a.type), $event)" @mouseleave="onTipLeave">i</span></span><span class="val">{{ a.value.toLocaleString() }}</span></li>
          </ul>
        </div>
        <div class="modal-actions">
          <h4>Comparación por plataforma</h4>
          <div class="platform-compare">
            <div class="platform-card" v-for="p in platformBreakdown" :key="p.publisher_platform">
              <div class="platform-header">
                <span class="platform-name">{{ platformLabel(p.publisher_platform) }}</span>
              </div>
              <div class="platform-metrics">
                <div class="metric"><span class="label">Impresiones</span><span class="value">{{ num(p.impressions).toLocaleString() }}</span></div>
                <div class="metric"><span class="label">Alcance</span><span class="value">{{ num(p.reach).toLocaleString() }}</span></div>
                <div class="metric"><span class="label">Clicks</span><span class="value">{{ num(p.clicks).toLocaleString() }}</span></div>
                <div class="metric"><span class="label">CTR</span><span class="value">{{ num(p.ctr).toFixed(2) }}%</span></div>
                <div class="metric"><span class="label">Gasto</span><span class="value">${{ num(p.spend).toFixed(2) }}</span></div>
                <div class="metric"><span class="label">CPM</span><span class="value">${{ num(p.cpm).toFixed(2) }}</span></div>
              </div>
            </div>
          </div>
          <div class="platform-charts">
            <div class="chart-card">
              <div class="heading"><h3>Impresiones vs Alcance (Plataformas)</h3></div>
              <div class="chart-values">
                <div class="value-badge fb"><span class="label">Facebook</span><span class="val">{{ num(fbPlatform?.impressions).toLocaleString() }} · {{ num(fbPlatform?.reach).toLocaleString() }}</span></div>
                <div class="value-badge ig"><span class="label">Instagram</span><span class="val">{{ num(igPlatform?.impressions).toLocaleString() }} · {{ num(igPlatform?.reach).toLocaleString() }}</span></div>
              </div>
              <BaseChart :type="'bar'" :labels="chartPlatformImpressionsReach.labels" :datasets="chartPlatformImpressionsReach.datasets" :height="isMobile ? 160 : 220" />
            </div>
            <div class="chart-card">
              <div class="heading"><h3>Clicks (Plataformas)</h3></div>
              <div class="chart-values">
                <div class="value-badge fb"><span class="label">Facebook</span><span class="val">{{ num(fbPlatform?.clicks).toLocaleString() }}</span></div>
                <div class="value-badge ig"><span class="label">Instagram</span><span class="val">{{ num(igPlatform?.clicks).toLocaleString() }}</span></div>
              </div>
              <BaseChart :type="'bar'" :labels="chartPlatformClicks.labels" :datasets="chartPlatformClicks.datasets" :height="isMobile ? 160 : 220" />
            </div>
            <div class="chart-card">
              <div class="heading"><h3>Gasto (USD) (Plataformas)</h3></div>
              <div class="chart-values">
                <div class="value-badge fb"><span class="label">Facebook</span><span class="val">${{ num(fbPlatform?.spend).toFixed(2) }}</span></div>
                <div class="value-badge ig"><span class="label">Instagram</span><span class="val">${{ num(igPlatform?.spend).toFixed(2) }}</span></div>
              </div>
              <BaseChart :type="'bar'" :labels="chartPlatformSpend.labels" :datasets="chartPlatformSpend.datasets" :height="isMobile ? 160 : 220" />
            </div>
            <div class="chart-card">
              <div class="heading"><h3>CTR (%) (Plataformas)</h3></div>
              <div class="chart-values">
                <div class="value-badge fb"><span class="label">Facebook</span><span class="val">{{ num(fbPlatform?.ctr).toFixed(2) }}%</span></div>
                <div class="value-badge ig"><span class="label">Instagram</span><span class="val">{{ num(igPlatform?.ctr).toFixed(2) }}%</span></div>
              </div>
              <BaseChart :type="'bar'" :labels="chartPlatformCtr.labels" :datasets="chartPlatformCtr.datasets" :height="isMobile ? 160 : 220" />
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <h4>Costo por acción (USD) <span class="tip" @mouseenter="onTipEnter('Costo promedio pagado por cada acción', $event)" @mouseleave="onTipLeave">i</span></h4>
          <ul class="cpa-list">
            <li v-for="c in costPerActions" :key="c.type"><span class="type">{{ c.type }} <span class="tip" @mouseenter="onTipEnter(tip(c.type), $event)" @mouseleave="onTipLeave">i</span></span><span class="val">{{ c.value.toFixed(2) }}</span></li>
          </ul>
        </div>
      </div>
      <template #footer>
        <a v-if="selected?.links?.permalinkUrl" class="modal-link" :href="selected.links.permalinkUrl" target="_blank" rel="noopener noreferrer">Abrir en Meta</a>
        <button class="btn-secondary" type="button" @click="closeModal">Cerrar</button>
      </template>
    </Modal>
    <teleport to="body">
      <div v-if="hoveredTip" class="tooltip-float" :style="{ left: hoveredTip.x + 'px', top: hoveredTip.y + 'px' }">{{ hoveredTip.text }}</div>
    </teleport>
  </div>
  
</template>

<style lang="scss" scoped>
.campaign-top {
  margin-bottom: 12px;
}

.campaign-top__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.refresh-btn {
  padding: 0.4rem 0.8rem;
  border: 1px solid rgba($BAKANO-DARK, 0.15);
  border-radius: 8px;
  background: $white;
  color: $BAKANO-DARK;
  font-weight: 600;
  cursor: pointer;
}

.error {
  color: #dc2626;
  font-size: 0.95rem;
}

.empty {
  color: rgba($BAKANO-DARK, 0.6);
}

.campaign-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
}

.campaign-item {
  display: flex;
  gap: 0.75rem;
  background: $white;
  border: 1px solid rgba($BAKANO-DARK, 0.06);
  border-radius: 10px;
  padding: 0.75rem;
  position: relative;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.campaign-thumb {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.campaign-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba($BAKANO-DARK, 0.08);
}

.campaign-rank {
  position: absolute;
  top: -8px;
  left: -8px;
  background: linear-gradient(135deg, $BAKANO-PINK 0%, darken($BAKANO-PINK, 8%) 100%);
  color: #fff;
  font-weight: 800;
  font-size: 0.875rem;
  padding: 6px 10px;
  border-radius: 10px;
  box-shadow: 0 6px 16px rgba($BAKANO-DARK, 0.15);
}

.campaign-item.is-top1 {
  border-color: rgba($BAKANO-PINK, 0.35);
  box-shadow: 0 10px 24px rgba($BAKANO-PINK, 0.15);
}

.campaign-item.is-top2 {
  border-color: rgba($BAKANO-DARK, 0.12);
}

.campaign-item.is-top3,
.campaign-item.is-top4 {
  border-color: rgba($BAKANO-DARK, 0.08);
}

.best-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: linear-gradient(135deg, $BAKANO-PURPLE 0%, $BAKANO-PINK 100%);
  color: #fff;
  font-weight: 800;
  font-size: 0.8125rem;
  padding: 6px 10px;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba($BAKANO-DARK, 0.2);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.campaign-info {
  flex: 1;
}

.campaign-title {
  font-weight: 700;
  color: $BAKANO-DARK;
  margin-bottom: 0.25rem;
}

.campaign-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  color: rgba($BAKANO-DARK, 0.8);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.campaign-metrics span {
  background: rgba($BAKANO-DARK, 0.04);
  border: 1px solid lighten($BAKANO-DARK, 85%);
  border-radius: 999px;
  padding: 6px 10px;
}

.campaign-metrics-squares {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

@media (min-width: 768px) {
  .campaign-metrics-squares {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

.metric-square {
  background: #fff;
  border: 1px solid lighten($BAKANO-DARK, 85%);
  border-radius: 12px;
  padding: 0.75rem;
  display: grid;
  grid-template-rows: auto auto 1fr;
  align-items: start;
  justify-items: start;
  aspect-ratio: 1;
  box-shadow: 0 4px 12px rgba($BAKANO-DARK, 0.06);
}

.list-subtitle {
  color: lighten($BAKANO-DARK, 35%);
  font-size: 0.95rem;
  margin: -0.25rem 0 0.5rem;
}

.metric-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: $BAKANO-LIGHT;
  color: $BAKANO-DARK;
  box-shadow: inset 0 0 0 1px lighten($BAKANO-DARK, 85%);
}

.metric-label {
  font-size: 0.75rem;
  color: lighten($BAKANO-DARK, 35%);
}

.metric-value {
  font-weight: 800;
  color: $BAKANO-DARK;
  font-size: 1rem;
  align-self: center;
}

.metric-square.pink .metric-icon {
  color: $BAKANO-PINK;
  box-shadow: inset 0 0 0 1px rgba($BAKANO-PINK, 0.6);
}

.metric-square.purple .metric-icon {
  color: $BAKANO-PURPLE;
  box-shadow: inset 0 0 0 1px rgba($BAKANO-PURPLE, 0.6);
}

.metric-square.dark .metric-icon {
  color: $BAKANO-DARK;
}

.campaign-link {
  color: $BAKANO-PINK;
  font-weight: 600;
  text-decoration: none;
}

.details-btn {
  margin-top: 0.5rem;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, $BAKANO-PINK 0%, darken($BAKANO-PINK, 8%) 100%);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.insights-content {
  max-height: 70vh;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.summary-card {
  background: #fff;
  border: 1px solid lighten($BAKANO-DARK, 85%);
  border-radius: 10px;
  padding: 0.75rem;
}

.summary-card .label {
  font-size: 0.8125rem;
  color: lighten($BAKANO-DARK, 35%);
}

.summary-card .value {
  font-weight: 800;
  color: $BAKANO-DARK;
  font-size: 1.125rem;
}


.modal-charts {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.chart-card {
  background: #fff;
  border: 1px solid lighten($BAKANO-DARK, 85%);
  border-radius: 10px;
  padding: 0.75rem;
  width: 100%;
  max-height: 260px;
  overflow: hidden;
}

.heading h3 {
  margin: 0;
  font-weight: 800;
  color: $BAKANO-DARK;
}

.chart-values {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  margin: 0.25rem 0 0.5rem;
}

@media (min-width: 768px) {
  .chart-values {
    grid-template-columns: 1fr 1fr;
  }
}

.value-badge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid lighten($BAKANO-DARK, 85%);
  background: rgba($BAKANO-DARK, 0.03);
}

.value-badge .label {
  font-weight: 700;
  color: $BAKANO-DARK;
}

.value-badge .val {
  font-weight: 800;
  color: $BAKANO-DARK;
}

.value-badge.fb {
  border-color: rgba($BAKANO-PINK, 0.35);
  box-shadow: 0 3px 10px rgba($BAKANO-PINK, 0.08);
}

.value-badge.ig {
  border-color: rgba($BAKANO-PURPLE, 0.35);
  box-shadow: 0 3px 10px rgba($BAKANO-PURPLE, 0.08);
}

.modal-actions h4 {
  margin: 0 0 0.5rem;
  font-weight: 800;
  color: $BAKANO-DARK;
}

.platform-compare {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
}

@media (min-width: 768px) {
  .platform-compare {
    grid-template-columns: 1fr 1fr;
  }
}

.platform-card {
  background: #fff;
  border: 1px solid lighten($BAKANO-DARK, 85%);
  border-radius: 8px;
  padding: 0.75rem;
}

.platform-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.platform-name {
  font-weight: 800;
  color: $BAKANO-DARK;
}

.platform-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem 0.75rem;
}

.platform-metrics .metric {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.platform-metrics .label {
  color: lighten($BAKANO-DARK, 35%);
  font-size: 0.8125rem;
}

.platform-metrics .value {
  font-weight: 700;
  color: $BAKANO-DARK;
}

.platform-charts {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  max-height: 480px;
  overflow-y: auto;
}

@media (min-width: 768px) {
  .platform-charts {
    grid-template-columns: 1fr 1fr;
  }
}

.actions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.actions-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border: 1px solid lighten($BAKANO-DARK, 85%);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
}

.actions-list .type {
  color: lighten($BAKANO-DARK, 35%);
  font-size: 0.8125rem;
}

.actions-list .val {
  font-weight: 700;
  color: $BAKANO-DARK;
}

.modal-link {
  color: $BAKANO-PINK;
  text-decoration: none;
  font-weight: 700;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
}

.btn-secondary {
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid lighten($BAKANO-DARK, 85%);
  background: #fff;
  color: $BAKANO-DARK;
  font-weight: 700;
}

.cpa-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.cpa-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border: 1px solid lighten($BAKANO-DARK, 85%);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
}

.cpa-list .type {
  color: lighten($BAKANO-DARK, 35%);
  font-size: 0.8125rem;
}

.cpa-list .val {
  font-weight: 700;
  color: $BAKANO-DARK;
}

.tip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: lighten($BAKANO-DARK, 75%);
  color: $BAKANO-DARK;
  font-size: 11px;
  margin-left: 6px;
  position: relative;
  cursor: help;
}

.tip::after {
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
}

.tip::before {
  content: '';
  position: absolute;
  bottom: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: $BAKANO-DARK;
  opacity: 0;
}

.tip:hover::after,
.tip:hover::before {
  opacity: 1;
}
</style>

<style lang="scss">
.tooltip-float {
  position: fixed;
  transform: translate(-50%, -100%);
  z-index: 5000;
  background: $BAKANO-DARK;
  color: #fff;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.3;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  min-width: 180px;
  max-width: 280px;
  pointer-events: none;
}
</style>
