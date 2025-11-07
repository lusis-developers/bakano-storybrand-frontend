<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  type?: 'info' | 'warning' | 'success' | 'error'
  message: string
  icon?: string
  closable?: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'close'): void }>()

const iconClass = computed(() => {
  if (props.icon) return props.icon
  switch (props.type) {
    case 'success':
      return 'fa-solid fa-circle-check'
    case 'warning':
      return 'fa-solid fa-triangle-exclamation'
    case 'error':
      return 'fa-solid fa-circle-exclamation'
    case 'info':
    default:
      return 'fa-solid fa-circle-info'
  }
})
</script>

<template>
  <div class="info-banner" :class="props.type || 'info'" role="status">
    <i :class="iconClass" aria-hidden="true"></i>
    <span class="text">{{ props.message }}</span>
    <button v-if="props.closable" class="close" type="button" @click="emit('close')" aria-label="Cerrar">×</button>
  </div>
  
</template>

<style lang="scss" scoped>
.info-banner {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.625rem 0.85rem;
  border-radius: 10px;
  font-size: 0.95rem;
  line-height: 1.25rem;
  border: 1px solid lighten($BAKANO-DARK, 85%);
  background: lighten($BAKANO-DARK, 97%);
  color: $BAKANO-DARK;
}

.info-banner i {
  color: $BAKANO-PINK;
}

.info-banner.info {
  border-color: lighten($BAKANO-PINK, 30%);
  background: rgba($BAKANO-PINK, 0.06);
}

.info-banner.success {
  border-color: lighten(#12b886, 30%);
  background: rgba(#12b886, 0.08);
}

.info-banner.warning {
  border-color: lighten(#f59f00, 30%);
  background: rgba(#f59f00, 0.08);
}

.info-banner.error {
  border-color: lighten(#e03131, 30%);
  background: rgba(#e03131, 0.09);
}

.text {
  flex: 1;
}

.close {
  background: transparent;
  border: 0;
  color: inherit;
  font-size: 1.1rem;
  cursor: pointer;
  line-height: 1;
}
</style>