<script setup lang="ts">
const props = defineProps<{ isScheduling: boolean }>()
</script>

<template>
  <div class="publishing-overlay" aria-busy="true" role="alert" aria-live="assertive">
    <div class="publishing-overlay-content">
      <div class="spinner lg" aria-hidden="true"></div>
      <div class="publishing-text">
        {{ props.isScheduling ? 'Programando publicación…' : 'Publicando…' }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.publishing-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.publishing-overlay-content {
  background: $white;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.publishing-text {
  color: $BAKANO-DARK;
  font-weight: 600;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-top-color: $BAKANO-PURPLE;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner.lg {
  width: 24px;
  height: 24px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>