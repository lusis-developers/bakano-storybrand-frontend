<script setup lang="ts">
const props = defineProps<{ loading: boolean }>()
const emit = defineEmits<{ (e: 'refresh'): void }>()
</script>

<template>
  <div class="campaign-top__header">
    <h2>Top 4 Campañas</h2>
    <button class="refresh-btn" type="button" @click="emit('refresh')" :disabled="props.loading">{{ props.loading ? 'Cargando…' : 'Actualizar' }}</button>
  </div>
</template>

<style lang="scss" scoped>
.campaign-top__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.refresh-btn {
  padding: 0.4rem 0.8rem;
  border: 1px solid rgba($BAKANO-DARK, 0.15);
  border-radius: 8px;
  background: $white;
  color: $BAKANO-DARK;
  font-weight: 600;
  cursor: pointer;
}
</style>
