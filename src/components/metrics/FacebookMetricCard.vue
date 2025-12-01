<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { FacebookMetric } from '@/types/facebook.types'
import Chart from 'chart.js/auto'

const props = defineProps<{ title: string; metric: FacebookMetric }>()

const canvasRef = ref<HTMLCanvasElement>()
let chart: Chart | undefined

const pink = '#E6285C'
const purple = '#85529c'

const series = computed(() => (Array.isArray(props.metric.series) ? props.metric.series : []))
const hasSeries = computed(() => series.value.length > 0)

function buildLineConfig() {
  const labels = series.value.map((p: any) => {
    const raw = String(p.date || '')
    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) return raw.slice(0, 10)
    return new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short' }).format(d)
  })
  const data = series.value.map((p: any) => Number(p.value || 0))
  return {
    type: 'line' as const,
    data: {
      labels,
      datasets: [
        {
          label: props.title,
          data,
          borderColor: pink,
          backgroundColor: 'rgba(230,40,92,0.20)',
          tension: 0.3,
          pointRadius: 2,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          callbacks: {
            label: (ctx: any) => `${ctx.dataset.label}: ${Number(ctx.parsed.y || 0).toLocaleString()}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            callback: (val: any, idx: number, ticks: any[]) => String(labels[idx])
          }
        },
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
      },
    },
  }
}

function buildBarFallbackConfig() {
  const total = Number(props.metric.total || 0)
  const avg = Number(props.metric.averagePerDay || 0)
  return {
    type: 'bar' as const,
    data: {
      labels: ['Total', 'Prom/día'],
      datasets: [
        {
          label: props.title,
          data: [total, avg],
          backgroundColor: [pink, purple].map((c) => c),
          borderColor: [pink, purple].map((c) => c),
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: any) => `${ctx.dataset.label}: ${Number(ctx.parsed.y || 0).toLocaleString()}`,
          },
        },
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
      },
    },
  }
}

function mountChart() {
  const el = canvasRef.value
  if (!el) return
  const cfg = hasSeries.value ? buildLineConfig() : buildBarFallbackConfig()
  chart = new Chart(el.getContext('2d') as CanvasRenderingContext2D, cfg)
}

function destroyChart() {
  if (chart) {
    chart.destroy()
    chart = undefined
  }
}

onMounted(() => {
  mountChart()
})

onUnmounted(() => {
  destroyChart()
})

watch(() => props.metric, () => {
  destroyChart()
  mountChart()
}, { deep: true })
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
      <canvas ref="canvasRef" aria-label="Gráfico de {{ title }}"></canvas>
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
  position: relative;
  height: 200px;
}
</style>
