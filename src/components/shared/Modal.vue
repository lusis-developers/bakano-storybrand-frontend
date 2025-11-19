<script setup lang="ts">
import { defineProps, defineEmits, watchEffect } from 'vue'

interface Props {
  visible: boolean
  title?: string
  width?: string
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const onBackdrop = (e: MouseEvent) => {
  if (e.target === e.currentTarget) emit('close')
}

watchEffect(() => {
  document.body.style.overflow = props.visible ? 'hidden' : ''
})
</script>

<template>
  <teleport to="body">
    <div v-if="visible" class="modal-overlay" @click="onBackdrop">
      <div class="modal-container" :style="{ maxWidth: width || '520px' }">
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <button class="close-btn" type="button" @click="emit('close')" aria-label="Cerrar">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
        <div class="modal-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </teleport>
</template>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba($BAKANO-DARK, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 2000;
}

.modal-container {
  width: 100%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  border: 1px solid lighten($BAKANO-DARK, 88%);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid lighten($BAKANO-DARK, 90%);
}

.modal-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: $BAKANO-DARK;
}

.close-btn {
  border: none;
  background: transparent;
  color: $BAKANO-DARK;
  font-size: 1rem;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 8px;
}

.close-btn:hover {
  background: $BAKANO-LIGHT;
}

.modal-body {
  padding: 1rem 1.25rem;
}

.modal-footer {
  padding: 0.75rem 1.25rem 1.25rem 1.25rem;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

@media (max-width: 480px) {
  .modal-title {
    font-size: 1rem;
  }
}
</style>