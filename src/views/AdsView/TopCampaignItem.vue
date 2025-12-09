<script setup lang="ts">
import type { FacebookAdItem } from '@/types/facebook.types'
import { useRouter } from 'vue-router'

const props = defineProps<{ ad: FacebookAdItem; index: number }>()
const emit = defineEmits<{ (e: 'open-details', ad: FacebookAdItem): void }>()

const router = useRouter()

function openChatWithMetrics() {
  const name = props.ad.name || props.ad.metrics?.ad_name || 'Campaña'
  const impressions = (props.ad.metrics?.impressions ?? 0).toLocaleString()
  const reach = (props.ad.metrics?.reach ?? 0).toLocaleString()
  const clicks = (props.ad.metrics?.clicks ?? 0).toLocaleString()
  const spend = Number(props.ad.metrics?.spend ?? 0).toFixed(2)
  const ctr = Number(props.ad.metrics?.ctr ?? 0).toFixed(2)
  const seed = `Quiero analizar el desempeño del anuncio "${name}". Impresiones: ${impressions}, Alcance: ${reach}, Clicks: ${clicks}, Gasto: $${spend}, CTR: ${ctr}%. ¿Qué insights y recomendaciones puedes darme?`
  router.push({ path: '/advisor', query: { source: 'facebook', seed } })
}
</script>

<template>
  <li :class="['campaign-item', 'is-top' + (props.index + 1)]">
    <div class="campaign-rank">#{{ props.index + 1 }}</div>
    <div v-if="props.index === 0" class="best-badge"><i class="fas fa-trophy" aria-hidden="true"></i> Mejor desempeño</div>
    <div class="campaign-thumb" v-if="props.ad.preview?.thumbnailUrl">
      <img :src="props.ad.preview.thumbnailUrl" alt="Preview" />
    </div>
    <div class="campaign-info">
      <div class="campaign-title">{{ props.ad.name || props.ad.metrics?.ad_name || 'Campaña' }}</div>
      <div class="campaign-metrics-squares">
        <div class="metric-square pink">
          <div class="metric-icon"><i class="fas fa-eye" aria-hidden="true"></i></div>
          <div class="metric-label">Impresiones</div>
          <div class="metric-value">{{ (props.ad.metrics?.impressions ?? 0).toLocaleString() }}</div>
        </div>
        <div class="metric-square purple">
          <div class="metric-icon"><i class="fas fa-users" aria-hidden="true"></i></div>
          <div class="metric-label">Alcance</div>
          <div class="metric-value">{{ (props.ad.metrics?.reach ?? 0).toLocaleString() }}</div>
        </div>
        <div class="metric-square neutral">
          <div class="metric-icon"><i class="fas fa-hand-pointer" aria-hidden="true"></i></div>
          <div class="metric-label">Clicks</div>
          <div class="metric-value">{{ (props.ad.metrics?.clicks ?? 0).toLocaleString() }}</div>
        </div>
        <div class="metric-square pink">
          <div class="metric-icon"><i class="fas fa-dollar-sign" aria-hidden="true"></i></div>
          <div class="metric-label">Gasto</div>
          <div class="metric-value">${{ Number(props.ad.metrics?.spend ?? 0).toFixed(2) }}</div>
        </div>
        <div class="metric-square purple">
          <div class="metric-icon"><i class="fas fa-percent" aria-hidden="true"></i></div>
          <div class="metric-label">CTR</div>
          <div class="metric-value">{{ Number(props.ad.metrics?.ctr ?? 0).toFixed(2) }}%</div>
        </div>
      </div>
      <div class="campaign-actions">
        <a v-if="props.ad.links?.permalinkUrl" class="campaign-link" :href="props.ad.links.permalinkUrl" target="_blank" rel="noopener noreferrer">Ver en Meta</a>
        <button class="details-btn" type="button" @click="emit('open-details', props.ad)">Ver métricas a profundidad</button>
        <button class="chat-btn" type="button" @click="openChatWithMetrics">
          Conversar sobre estas métricas
        </button>
      </div>
    </div>
  </li>
</template>

<style lang="scss" scoped>
.campaign-item {
  width: 100%;
  display: flex;
  gap: 0.75rem;
  background: linear-gradient(180deg, lighten($BAKANO-LIGHT, 2%) 0%, $white 100%);
  border: 1px solid lighten($BAKANO-DARK, 90%);
  border-radius: 16px;
  padding: 1rem;
  position: relative;
  transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
  padding: 8px;

  @media (min-width: 764px) {
    padding: 24px;
  }

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
  box-shadow: 0 10px 24px rgba($BAKANO-DARK, 0.08);
  border-color: lighten($BAKANO-DARK, 85%);
}

.campaign-rank {
  position: absolute;
  top: -8px;
  left: -8px;
  background: linear-gradient(135deg, $BAKANO-PINK 0%, darken($BAKANO-PINK, 8%) 100%);
  color: #fff;
  font-weight: 800;
  font-size: 0.8125rem;
  padding: 6px 10px;
  border-radius: 999px;
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
  border-radius: 999px;
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
  margin-bottom: 0.75rem;
  font-size: 1.0625rem;
}

.campaign-metrics-squares {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.campaign-metrics-squares .metric-square {
  flex: 1 1 160px;
}

@media (min-width: 768px) {
  .campaign-metrics-squares .metric-square {
    flex: 1 1 180px;
  }
}

.metric-square {
  border: none;
  border-radius: 16px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-height: auto;
  box-shadow: 0 6px 14px rgba($BAKANO-DARK, 0.06);
}

.metric-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: #fff;
  color: $BAKANO-DARK;
  box-shadow: 0 2px 6px rgba($BAKANO-DARK, 0.08);
}

.metric-label {
  font-size: 0.8125rem;
  color: lighten($BAKANO-DARK, 35%);
}

.metric-value {
  font-weight: 800;
  color: $BAKANO-DARK;
  font-size: 1.125rem;
}

.metric-square.pink {
  background: lighten($BAKANO-PINK, 42%);
}

.metric-square.purple {
  background: lighten($BAKANO-PURPLE, 42%);
}

.metric-square.neutral {
  background: lighten($BAKANO-LIGHT, 2%);
}

.metric-square.pink .metric-icon {
  color: $BAKANO-PINK;
}

.metric-square.purple .metric-icon {
  color: $BAKANO-PURPLE;
}

.metric-square.neutral .metric-icon {
  color: $BAKANO-DARK;
}

.campaign-link {
  color: $BAKANO-PINK;
  font-weight: 600;
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border: 1px solid lighten($BAKANO-PURPLE, 40%);
  border-radius: 999px;
}

.details-btn {
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, $BAKANO-PINK 0%, darken($BAKANO-PINK, 8%) 100%);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  border-radius: 999px;
}

.chat-btn {
  padding: 0.6rem 1rem;
  border-radius: 999px;
  border: 1px solid lighten($BAKANO-PURPLE, 40%);
  background: #fff;
  color: $BAKANO-PURPLE;
  font-weight: 700;
  cursor: pointer;
}

.campaign-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

@media (min-width: 768px) {
  .campaign-actions {
    flex-direction: row;
    align-items: center;
  }

  .campaign-link {
    display: inline-flex;
    align-items: center;
  }
}
</style>
