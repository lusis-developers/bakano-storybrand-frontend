<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ labels: string[]; series: Array<{ label: string; data: number[]; color: string }> }>()

const width = 720
const height = 200
const padding = { left: 16, right: 16, top: 20, bottom: 28 }

const maxY = computed(() => {
  let m = 1
  for (const s of props.series) {
    for (const v of s.data) m = Math.max(m, v)
  }
  return m
})

function pointsFor(data: number[]) {
  const w = width - padding.left - padding.right
  const h = height - padding.top - padding.bottom
  const n = Math.max(1, data.length)
  return data.map((v, i) => {
    const x = padding.left + (n === 1 ? w / 2 : (i * w) / (n - 1))
    const y = padding.top + (h - (v / maxY.value) * h)
    return { x, y }
  })
}

function pathFor(data: number[]) {
  const pts = pointsFor(data)
  if (!pts.length) return ''
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ')
}

const firstLabel = computed(() => props.labels[0] || '')
const lastLabel = computed(() => props.labels[props.labels.length - 1] || '')
</script>

<template>
  <div class="chart-wrap">
    <svg width="100%" :height="height" :viewBox="`0 0 ${width} ${height}`" role="img">
      <defs>
        <linearGradient id="ads-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#E6285C" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#E6285C" stop-opacity="0" />
        </linearGradient>
      </defs>
      <template v-for="s in series" :key="s.label">
        <path :d="pathFor(s.data)" :stroke="s.color" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" />
      </template>
      <text :x="padding.left" :y="height - 6" class="axis">{{ firstLabel }}</text>
      <text :x="width - padding.right" :y="height - 6" class="axis" text-anchor="end">{{ lastLabel }}</text>
    </svg>
  </div>
  </template>

<style lang="scss" scoped>
.chart-wrap {
  width: 100%;
}

.chart-wrap svg {
  width: 100%;
  display: block;
}

.axis {
  font-size: 12px;
  fill: lighten($BAKANO-DARK, 35%);
}
</style>
