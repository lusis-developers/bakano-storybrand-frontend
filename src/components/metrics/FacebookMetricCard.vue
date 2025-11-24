<script setup lang="ts">
import { computed } from 'vue'
import type { FacebookMetric } from '@/types/facebook.types'

const props = defineProps<{ title: string; metric: FacebookMetric }>()

const width = 720
const height = 180
const padding = { left: 12, right: 12, top: 16, bottom: 28 }
const pink = '#E6285C'

const maxY = computed(() => {
  const m = props.metric
  return m.series.reduce((max, p) => (p.value > max ? p.value : max), 0) || 1
})

const points = computed(() => {
  const m = props.metric.series
  const w = width - padding.left - padding.right
  const h = height - padding.top - padding.bottom
  const n = Math.max(1, m.length)
  return m.map((p, i) => {
    const x = padding.left + (n === 1 ? w / 2 : (i * w) / (n - 1))
    const y = padding.top + (h - (p.value / maxY.value) * h)
    return { x, y, value: p.value, date: p.date, time: p.time }
  })
})

const pathD = computed(() => {
  const pts = points.value
  if (!pts.length) return ''
  return pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ')
})

const areaD = computed(() => {
  const pts = points.value
  if (!pts.length) return ''
  const baseY = height - padding.bottom
  return `${pathD.value} L ${pts[pts.length - 1].x},${baseY} L ${pts[0].x},${baseY} Z`
})

const firstLabel = computed(() => props.metric.series[0]?.date || '')
const lastLabel = computed(() => props.metric.series[props.metric.series.length - 1]?.date || '')
</script>

<template>
  <div class="metric-card">
    <div class="metric-header">
      <h3>{{ title }}</h3>
      <div class="values">
        <span class="total">{{ props.metric.total }}</span>
        <span class="avg">prom/día: {{ props.metric.averagePerDay }}</span>
      </div>
    </div>
    <div class="chart-wrap">
      <svg :width="width" :height="height" role="img" aria-label="Gráfico de {{ title }}">
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" :stop-color="pink" stop-opacity="0.35" />
            <stop offset="100%" :stop-color="pink" stop-opacity="0" />
          </linearGradient>
        </defs>

        <path :d="areaD" fill="url(#grad)" />
        <path :d="pathD" :stroke="pink" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" />

        <g v-for="p in points" :key="p.date + p.time">
          <circle :cx="p.x" :cy="p.y" r="3" :fill="pink" />
        </g>

        <text :x="padding.left" :y="height - 4" class="axis-label">{{ firstLabel }}</text>
        <text :x="width - padding.right - 40" :y="height - 4" class="axis-label" text-anchor="end">{{ lastLabel }}</text>
      </svg>
    </div>
  </div>
  
</template>

<style lang="scss" scoped>
.metric-card {
  background: #fff;
  border: 1px solid lighten($BAKANO-DARK, 85%);
  border-radius: 16px;
  padding: 16px;
}

.metric-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.metric-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: $BAKANO-DARK;
}

.values {
  display: flex;
  gap: 8px;
  align-items: baseline;
}

.total {
  font-size: 22px;
  font-weight: 800;
  color: $BAKANO-DARK;
}

.avg {
  font-size: 13px;
  color: lighten($BAKANO-DARK, 35%);
}

.chart-wrap {
  overflow-x: auto;
}

.axis-label {
  font-size: 12px;
  fill: lighten($BAKANO-DARK, 35%);
}
</style>
