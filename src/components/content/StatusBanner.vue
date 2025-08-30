<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  isContentComplete: {
    type: Boolean,
    required: true,
  },
  shouldShowGenerateButton: {
    type: Boolean,
    required: true,
  }
})

const bannerClass = computed(() => {
  if (props.isContentComplete) return 'complete'
  if (props.shouldShowGenerateButton) return 'ready-to-generate'
  return 'incomplete'
})

const statusIcon = computed(() => {
  if (props.isContentComplete) return 'fas fa-check-circle'
  if (props.shouldShowGenerateButton) return 'fas fa-rocket'
  return 'fas fa-exclamation-triangle'
})

const statusTitle = computed(() => {
  if (props.isContentComplete) return 'Soundbites y Taglines Completos'
  if (props.shouldShowGenerateButton) return '¡Listo para Generar!'
  return 'Soundbites y Taglines Incompletos'
})

const statusDescription = computed(() => {
  if (props.isContentComplete) return 'Tus soundbites y taglines están listos para usar'
  if (props.shouldShowGenerateButton) return 'Tus preguntas están completas. ¡Genera tus soundbites y taglines StoryBrand ahora!'
  return 'Faltan soundbites y taglines por generar'
})
</script>

<template>
  <div class="status-banner" :class="bannerClass">
    <div class="status-icon">
      <i :class="statusIcon"></i>
    </div>
    <div class="status-text">
      <h3>{{ statusTitle }}</h3>
      <p>{{ statusDescription }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';

.status-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;

  &.complete {
    background: linear-gradient(135deg, $BAKANO-GREEN, darken($BAKANO-GREEN, 10%));
    color: $white;
  }

  &.incomplete {
    background: linear-gradient(135deg, $alert-warning, darken($alert-warning, 10%));
    color: $white;
  }

  &.ready-to-generate {
    background: linear-gradient(135deg, $BAKANO-PURPLE, darken($BAKANO-PURPLE, 15%));
    color: $white;
  }

  .status-icon {
    font-size: 2rem;
  }

  .status-text {
    h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    p {
      opacity: 0.9;
      margin: 0;
    }
  }
}
</style>