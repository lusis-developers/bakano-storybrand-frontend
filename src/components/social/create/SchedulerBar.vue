<script setup lang="ts">
const props = defineProps<{
  formattedSchedule: string
  hasSchedule: boolean
  publishing: boolean
}>()
const emit = defineEmits<{
  (e: 'open-picker'): void
  (e: 'publish-now'): void
  (e: 'schedule-now'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <div class="scheduler">
    <div class="schedule-info">
      <i class="fa-regular fa-calendar"></i>
      <span v-if="props.hasSchedule">{{ props.formattedSchedule }}</span>
      <span v-else>Sin programación</span>
    </div>
    <div class="scheduler-actions">
      <button class="btn" @click="emit('open-picker')">
        <i class="fa-regular fa-calendar"></i>
        Programar
      </button>
      <button class="btn" @click="emit('schedule-now')" v-if="props.hasSchedule">
        <i class="fa-solid fa-calendar-check"></i>
        Confirmar programación
      </button>
      <button class="btn btn-primary" @click="emit('publish-now')" :disabled="props.publishing">
        <span v-if="props.publishing" class="spinner" aria-hidden="true"></span>
        <span>{{ props.publishing ? 'Publicando…' : 'Publicar ahora' }}</span>
      </button>
      <button class="btn" @click="emit('cancel')">Cancelar</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.scheduler {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.schedule-info {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: $BAKANO-DARK;
}

.scheduler-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid $text-light;
  border-radius: 10px;
  background: $white;
  color: $BAKANO-DARK;
  cursor: pointer;
}

.btn:hover {
  background: $BAKANO-LIGHT;
}

.btn-primary {
  background: $BAKANO-PURPLE;
  color: $white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>