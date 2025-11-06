<script setup lang="ts">
const props = defineProps<{
  avatarUrl?: string
  displayName?: string
  postText?: string
  firstVideoUrl?: string
  firstImageUrl?: string
  pageImageUrl?: string
  postLocation?: string
}>()
</script>

<template>
  <div class="preview-card">
    <div class="preview-header">
      <div class="avatar">
        <img v-if="props.avatarUrl" :src="props.avatarUrl" alt="Avatar" class="avatar-img" />
        <div v-else class="avatar-img placeholder"></div>
      </div>
      <div class="preview-title">
        <div class="name">{{ props.displayName || 'Usuario' }}</div>
        <div class="time">Ahora</div>
      </div>
    </div>
    <div class="preview-body">
      <p>{{ props.postText }}</p>
      <div v-if="props.firstVideoUrl || props.firstImageUrl || props.pageImageUrl" class="media-box">
        <video v-if="props.firstVideoUrl" :src="props.firstVideoUrl" controls class="media-content"></video>
        <img v-else-if="props.firstImageUrl" :src="props.firstImageUrl" alt="Imagen de la publicación" class="media-content" />
        <img v-else :src="props.pageImageUrl" alt="Imagen de la página" class="media-content" />
      </div>
    </div>
    <div class="preview-actions">
      <button class="action">
        <i class="fa-regular fa-heart"></i>
        Me gusta
      </button>
      <button class="action">
        <i class="fa-regular fa-comment"></i>
        Comentar
      </button>
      <button class="action">
        <i class="fa-regular fa-share-from-square"></i>
        Compartir
      </button>
    </div>
    <div v-if="props.postLocation" class="preview-location">
      <i class="fa-solid fa-location-dot"></i>
      {{ props.postLocation }}
    </div>
    <div class="preview-note">Vista previa</div>
  </div>
</template>

<style scoped lang="scss">
.preview-card {
  margin-top: 12px;
  border: 1px solid $text-light;
  border-radius: 10px;
  padding: 12px;
  background: $white;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: $BAKANO-LIGHT;
}

.preview-title .name {
  font-weight: 700;
  color: $BAKANO-DARK;
}

.preview-title .time {
  font-size: 12px;
  color: $BAKANO-DARK;
}

.preview-body {
  margin-top: 10px;
}

.media-box {
  margin-top: 10px;
  width: 100%;
  border-radius: 10px;
  border: 1px solid $text-light;
  background: $white;
  ;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.media-content {
  max-width: 100%;
  max-height: 420px;
  width: auto;
  height: auto;
  object-fit: contain;
  background: transparent;
}

.preview-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid $text-light;
  border-radius: 10px;
  background: $white;
  color: $BAKANO-DARK;
  cursor: pointer;
}

.action:hover {
  background: $BAKANO-LIGHT;
}

.preview-note {
  margin-top: 10px;
  font-size: 12px;
  color: $BAKANO-DARK;
}

.preview-location {
  margin-top: 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: $BAKANO-DARK;
}
</style>