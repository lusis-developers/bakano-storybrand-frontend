<script setup lang="ts">
const props = defineProps({
  item: { type: Object, required: true },
})
const emit = defineEmits<{ open: [url?: string] }>()
</script>

<template>
  <div class="card">
    <div class="header">
      <div class="owner">
        <i class="fab fa-instagram"></i>
        <span class="name">{{ (props.item as any).ownerFullName || (props.item as any).ownerUsername || 'Instagram' }}</span>
      </div>
      <span class="timestamp" v-if="(props.item as any).timestamp">{{ new Date((props.item as any).timestamp).toLocaleString() }}</span>
    </div>
    <div class="caption" v-if="(props.item as any).caption">{{ (props.item as any).caption }}</div>
    <div class="metrics">
      <span v-if="typeof (props.item as any).likesCount === 'number'"><i class="far fa-heart"></i> {{ (props.item as any).likesCount }}</span>
      <span v-if="typeof (props.item as any).commentsCount === 'number'"><i class="far fa-comment"></i> {{ (props.item as any).commentsCount }}</span>
    </div>
    <div class="hashtags" v-if="Array.isArray((props.item as any).hashtags)">
      <span class="tag" v-for="tag in (props.item as any).hashtags" :key="tag">#{{ tag }}</span>
    </div>
    <div class="actions">
      <button class="btn" @click="emit('open', (props.item as any).url)">
        <i class="fas fa-play"></i>
        Reproducir
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.card {
  display: grid;
  gap: 0.5rem;
  padding: 1rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.owner {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.owner i {
  color: $BAKANO-PURPLE;
}

.name {
  font-weight: 600;
  color: #1e293b;
}

.timestamp {
  font-size: 0.75rem;
  color: #64748b;
}

.caption {
  font-size: 0.9rem;
  color: #1f2937;
}

.metrics {
  display: flex;
  gap: 1rem;
  color: #64748b;
}

.metrics i {
  margin-right: 0.25rem;
}

.hashtags {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.tag {
  background: #f1f5f9;
  color: #334155;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn {
  background: $BAKANO-PINK;
  color: #fff;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.link {
  color: #1e293b;
  font-size: 0.875rem;
}
</style>