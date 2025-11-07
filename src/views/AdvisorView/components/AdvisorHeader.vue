<script setup lang="ts">
import { defineEmits } from 'vue'

const emit = defineEmits<{
  (e: 'go-back'): void
  (e: 'new-chat'): void
}>()

function goBack() {
  emit('go-back')
}

function newChat() {
  emit('new-chat')
}
</script>

<template>
  <header class="advisor-header">
    <div class="header-left">
      <button class="btn btn-ghost btn-sm" @click="goBack">
        <i class="fas fa-arrow-left" aria-hidden="true"></i>
        Volver al Dashboard
      </button>
      <div class="title-block">
        <h1>Asesor IA 24/7</h1>
        <p class="subtitle">Interactúa con tu asistente y genera respuestas en tiempo real</p>
      </div>
    </div>
    <div class="header-actions">
      <button class="btn btn-primary" @click="newChat">
        <i class="fas fa-comments" aria-hidden="true"></i>
        Nueva conversación
      </button>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.advisor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title-block {
  h1 {
    font-size: 1.75rem;
    font-weight: 700;
    color: $BAKANO-DARK;
    margin: 0;
  }
  .subtitle {
    margin: 0.25rem 0 0;
    color: lighten($BAKANO-DARK, 35%);
    font-size: 0.875rem;
  }
}

.btn {
  padding: 0.5rem 0.875rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.btn-primary {
  background: $BAKANO-PINK;
  color: white;
  transition: background 0.2s ease-in-out;
  &:hover {
    background: darken($BAKANO-PINK, 5%);
  }
}
.btn-outline {
  background: transparent;
  color: $BAKANO-PINK;
  border: 1px solid $BAKANO-PINK;
  transition: all 0.2s ease-in-out;
  &:hover {
    background: lighten($BAKANO-PINK, 40%);
  }
}

.btn-ghost {
  background: transparent;
  color: rgba($BAKANO-DARK, 0.7);
  border: 1px solid transparent;

  &:hover:not(:disabled) {
    background: $BAKANO-LIGHT;
    color: $BAKANO-DARK;
  }
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
}
</style>