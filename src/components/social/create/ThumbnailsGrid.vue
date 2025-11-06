<script setup lang="ts">
const props = defineProps<{
  files: Array<{ url: string; type: 'image' | 'video' }>
}>()
</script>

<template>
  <div v-if="props.files?.length" class="thumb-grid">
    <div v-for="(file, i) in props.files" :key="file.url" class="thumb">
      <img v-if="file.type === 'image'" :src="file.url" alt="Imagen seleccionada" class="thumb-img" />
      <video v-else controls :src="file.url" class="thumb-video"></video>
      <div class="thumb-badge">
        <i class="fa-solid fa-video"></i>
        <span>{{ i + 1 }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.thumb-grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.thumb {
  position: relative;
  border: 1px solid $text-light;
  border-radius: 10px;
  overflow: hidden;
  background: $white;
}

.thumb-img {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

.thumb-video {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

.thumb-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: $BAKANO-PURPLE;
  color: $white;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
}
</style>