<script setup lang="ts">
import type { FacebookAdItem } from '@/types/facebook.types'

const props = defineProps<{ ad: FacebookAdItem; index: number }>()
const emit = defineEmits<{ (e: 'open-details', ad: FacebookAdItem): void }>()
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
        <div class="metric-square dark">
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
      <a v-if="props.ad.links?.permalinkUrl" class="campaign-link" :href="props.ad.links.permalinkUrl" target="_blank" rel="noopener noreferrer">Ver en Meta</a>
      <button class="details-btn" type="button" @click="emit('open-details', props.ad)">Ver métricas a profundidad</button>
    </div>
  </li>
</template>

<style lang="scss" scoped>
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
</style>
