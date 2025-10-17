<script setup lang="ts">
import type { IIntegrationPage } from '@/types/integration.types'

interface Props {
  open: boolean
  pages: IIntegrationPage[]
  selectedPageId?: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:selectedPageId', value: string | null): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const selectPage = (id: string) => {
  emit('update:selectedPageId', id)
}

const close = () => emit('cancel')
const confirm = () => emit('confirm')
</script>

<template>
  <Teleport to="body">
    <div v-if="props.open" class="modal-backdrop" @click.self="close">
      <div class="modal" role="dialog" aria-modal="true" aria-label="Selecciona una página de Facebook">
        <h5 class="modal-title">Selecciona una página de Facebook</h5>
        <p v-if="!props.pages || props.pages.length === 0" class="empty-state">
          No se encontraron páginas en tu cuenta.
        </p>
        <div v-else class="pages-list">
          <button
            v-for="page in props.pages"
            :key="page.id"
            :class="['page-item', { selected: props.selectedPageId === page.id }]"
            @click="selectPage(page.id)"
            type="button"
          >
            <img v-if="page.pictureUrl" :src="page.pictureUrl" alt="Imagen de página" class="page-avatar" />
            <div class="page-info">
              <strong class="page-name">{{ page.name }}</strong>
              <small v-if="page.category" class="page-category">{{ page.category }}</small>
            </div>
            <i v-if="props.selectedPageId === page.id" class="fas fa-check-circle selected-icon" aria-hidden="true"></i>
          </button>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" type="button" @click="close">Cancelar</button>
          <button class="btn btn-primary" type="button" :disabled="!props.selectedPageId" @click="confirm">Confirmar</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
@use '@/styles/colorVariables.module.scss' as colors;

// Botones (base)
.btn {
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 90px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid colors.$overlay-purple;
    outline-offset: 2px;
  }
}

// Cancelar (outline)
.btn-outline {
  background: transparent;
  color: colors.$BAKANO-PURPLE;
  border-color: colors.$BAKANO-PURPLE;

  &:hover:not(:disabled) {
    background: colors.$overlay-purple;
    border-color: lighten(colors.$BAKANO-PURPLE, 10%);
  }
}

// Confirmar (primary)
.btn-primary {
  background: colors.$BAKANO-GREEN;
  color: colors.$white;
  border-color: colors.$BAKANO-GREEN;

  &:hover:not(:disabled) {
    background: darken(colors.$BAKANO-GREEN, 8%);
    border-color: darken(colors.$BAKANO-GREEN, 8%);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 92vw;
  max-width: 640px;
  padding: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.modal-title {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
}

.pages-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  max-height: 50vh;
  overflow: auto;
  padding-right: 0.25rem;
}

.page-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-item:hover {
  background: #f1f5f9;
}

.page-item.selected {
  border-color: #667eea;
  background: #eef2ff;
}

.page-avatar {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  object-fit: cover;
}

.page-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.page-name {
  font-size: 0.9rem;
}

.page-category {
  color: #64748b;
}

.selected-icon {
  color: #22c55e;
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.empty-state {
  color: #64748b;
}
</style>