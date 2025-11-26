<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ labels: string[]; values: number[]; color?: string }>()

const width = 720
const height = 220
const padding = { left: 16, right: 16, top: 20, bottom: 40 }
const barW = 28

const maxV = computed(() => props.values.reduce((m, v) => Math.max(m, v || 0), 1))

function bars() {
  const w = width - padding.left - padding.right
  const h = height - padding.top - padding.bottom
  const n = Math.max(1, props.values.length)
  return props.values.map((v, i) => {
    const x = padding.left + (n === 1 ? w / 2 : (i * w) / (n - 1))
    const barH = (v / maxV.value) * h
    const y = padding.top + (h - barH)
    return { x, y, barH, label: props.labels[i] || '', value: v }
  })
}

const color = computed(() => props.color || '#E6285C')
</script>

<template>
  <div class="chart-wrap">
    <svg width="100%" :height="height" :viewBox="`0 0 ${width} ${height}`" role="img">
      <g v-for="b in bars()" :key="b.label">
        <rect :x="b.x - barW / 2" :y="b.y" :width="barW" :height="b.barH" :fill="color" rx="8" />
        <text :x="b.x" :y="height - padding.bottom + 14" class="axis" text-anchor="middle">{{ b.label }}</text>
        <text :x="b.x" :y="height - padding.bottom + 28" class="axis" text-anchor="middle">{{ b.value }}</text>
      </g>
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
