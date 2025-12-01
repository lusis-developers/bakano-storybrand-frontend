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
    <div class="header-top">
      <button class="btn btn-ghost btn-sm" @click="goBack">
        <i class="fas fa-arrow-left" aria-hidden="true"></i>
        Volver al Dashboard
      </button>
    </div>

    <div class="header-bottom">
      <div class="title-block">
        <h1>Asesor IA 24/7</h1>
      </div>
      <div class="actions-row">
        <p class="subtitle">Interactúa con tu asistente y genera respuestas en tiempo real</p>
        <button class="btn btn-primary" @click="newChat">
          <i class="fas fa-comments" aria-hidden="true"></i>
          Nueva conversación
        </button>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.advisor-header {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.header-top {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-bottom {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.actions-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title-block {
  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: $BAKANO-DARK;
    margin: 0;
  }
}

.subtitle {
  margin: 0;
  color: lighten($BAKANO-DARK, 35%);
  font-size: 0.875rem;
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
  padding: 0.5rem 0.875rem;
  font-size: 0.8125rem;
}
</style>
