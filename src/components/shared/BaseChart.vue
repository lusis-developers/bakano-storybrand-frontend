<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  type: { type: String, required: true },
  labels: { type: Array as () => string[], required: true },
  datasets: { type: Array as () => Array<{ label: string; data: (number | null)[]; borderColor?: string; backgroundColor?: string; tension?: number; borderWidth?: number; pointRadius?: number; spanGaps?: boolean; fill?: boolean; yAxisID?: string }>, required: true },
  options: { type: Object as () => Record<string, any>, required: false, default: () => ({}) },
  height: { type: Number, required: false, default: 240 },
  ariaLabel: { type: String, required: false, default: 'Gráfico' },
  minPixelPerLabel: { type: Number, required: false, default: 48 }
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

const minWidth = computed(() => Math.max((props.labels?.length || 0) * props.minPixelPerLabel, 320))

function buildConfig() {
  return {
    type: props.type as any,
    data: { labels: props.labels, datasets: props.datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 0 },
      plugins: { legend: { display: true }, tooltip: { enabled: true } },
      scales: { x: { ticks: { maxRotation: 0, autoSkip: true } }, y: { beginAtZero: true } },
      ...props.options,
    },
  }
}

onMounted(() => {
  const ctx = canvasRef.value?.getContext('2d')
  if (!ctx) return
  chart = new Chart(ctx, buildConfig())
})

watch(() => [props.labels, props.datasets, props.options, props.type], () => {
  const ctx = canvasRef.value?.getContext('2d')
  if (!ctx) return
  chart?.destroy()
  chart = new Chart(ctx, buildConfig())
}, { deep: true })

onBeforeUnmount(() => {
  chart?.destroy()
  chart = null
})
</script>

<template>
  <div class="chart-container" role="img" :aria-label="ariaLabel" :style="{ height: `${height}px` }">
    <canvas ref="canvasRef" :style="{ minWidth: `${minWidth}px` }"></canvas>
  </div>
</template>

<style lang="scss" scoped>
.chart-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}

.chart-container canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
