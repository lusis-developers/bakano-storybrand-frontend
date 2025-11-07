<script setup lang="ts">
const props = defineProps<{
  selection?: { day?: string; hour?: string }
  postLocation?: string
}>()
const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <div class="post-modal-header">
    <div class="post-modal-header-left">
      <h3>Crear publicación</h3>
      <div v-if="props.selection?.day || props.selection?.hour || props.postLocation" class="post-modal-chips">
        <span v-if="props.selection?.day" class="chip">{{ props.selection?.day }}</span>
        <span v-if="props.selection?.hour" class="chip">{{ props.selection?.hour }}</span>
        <span v-if="props.postLocation" class="chip"><i class="fa-solid fa-location-dot"></i> {{ props.postLocation }}</span>
      </div>
    </div>
    <button class="icon-btn" @click="emit('close')">✕</button>
  </div>
</template>

<style scoped lang="scss">
.post-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid $text-light;
}

.post-modal-header h3 {
  margin: 0;
  color: $BAKANO-DARK;
}

.post-modal-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.post-modal-chips {
  display: flex;
  gap: 6px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: $BAKANO-LIGHT;
  color: $BAKANO-DARK;
  border: 1px solid $text-light;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
}

.icon-btn {
  border: none;
  background: none;
  color: $BAKANO-PURPLE;
  cursor: pointer;
  font-size: 18px;
}
</style>