<script setup lang="ts">
import { computed } from 'vue'
import { chatStore } from '@/stores/chat.store'

const chat = chatStore()

const messagesCount = computed(() => chat.messages.length)
const lastMessageAt = computed(() => chat.lastMessageAt)
const sessionsToday = computed(() => Math.max(messagesCount.value, 0))
const satisfactionScore = 4.6 // Simulado por ahora
const responseTimeMs = computed(() => (chat.loading.replying ? 1200 : 900))
</script>

<template>
  <section class="metrics-panel">
    <h2>Métricas</h2>
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-icon"><i class="fas fa-bolt"></i></div>
        <div class="metric-content">
          <h3>{{ (responseTimeMs / 1000).toFixed(1) }}s</h3>
          <p>Tiempo de respuesta promedio</p>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon"><i class="fas fa-chart-line"></i></div>
        <div class="metric-content">
          <h3>{{ sessionsToday }}</h3>
          <p>Mensajes hoy</p>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon"><i class="fas fa-smile"></i></div>
        <div class="metric-content">
          <h3>{{ satisfactionScore.toFixed(1) }}/5</h3>
          <p>Satisfacción del usuario</p>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon"><i class="fas fa-clock"></i></div>
        <div class="metric-content">
          <h3>{{ lastMessageAt ? new Date(lastMessageAt).toLocaleString() : '—' }}</h3>
          <p>Último mensaje</p>
        </div>
      </div>
    </div>
    <p class="footnote">Datos de demostración con algunos indicadores reales del chat.</p>
  </section>
</template>

<style lang="scss" scoped>
.metrics-panel {
  background: white;
  border: 1px solid lighten($BAKANO-DARK, 75%);
  border-radius: 12px;
  padding: 1rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: lighten($BAKANO-DARK, 96%);
  border-radius: 10px;
  padding: 0.75rem;
}
.metric-icon {
  font-size: 1.25rem;
  color: $BAKANO-PINK;
}

.footnote {
  color: lighten($BAKANO-DARK, 40%);
  font-size: 0.8125rem;
  margin-top: 0.5rem;
}
</style>