<script setup lang="ts">
const props = defineProps<{
  showEmojiPicker: boolean
  showLocationPicker: boolean
  postLocation: string
}>()
const emit = defineEmits<{
  (e: 'toggle-emoji'): void
  (e: 'toggle-location'): void
  (e: 'update:postLocation', value: string): void
  (e: 'apply-location'): void
  (e: 'images-selected', files: FileList): void
  (e: 'videos-selected', files: FileList): void
}>()

function onImagesChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target?.files) emit('images-selected', target.files)
}
function onVideosChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target?.files) emit('videos-selected', target.files)
}
</script>

<template>
  <div class="media-uploader">
    <div class="toolbar">
      <button class="toolbar-btn" @click="emit('toggle-emoji')">
        <i class="fa-regular fa-face-smile"></i>
        Emoji
      </button>
      <button class="toolbar-btn" @click="emit('toggle-location')">
        <i class="fa-solid fa-location-dot"></i>
        Ubicación
      </button>

      <div class="dropdown">
        <label class="dropdown-item">
          <i class="fa-regular fa-image"></i>
          Agregar imágenes
          <input class="sr-only" type="file" accept="image/*" multiple @change="onImagesChange" />
        </label>
        <label class="dropdown-item">
          <i class="fa-solid fa-photo-film"></i>
          Agregar videos
          <input class="sr-only" type="file" accept="video/*" multiple @change="onVideosChange" />
        </label>
      </div>
    </div>

    <div class="toolbar-panels">
      <div v-if="props.showEmojiPicker" class="emoji-panel">
        <div class="emoji-grid">
          <button class="emoji-btn">😀</button>
          <button class="emoji-btn">🎉</button>
          <button class="emoji-btn">🔥</button>
          <button class="emoji-btn">💜</button>
          <button class="emoji-btn">👍</button>
          <button class="emoji-btn">🚀</button>
        </div>
      </div>

      <div v-if="props.showLocationPicker" class="location-panel">
        <input
          type="text"
          class="location-input"
          :value="props.postLocation"
          @input="emit('update:postLocation', ($event.target as HTMLInputElement).value)"
          placeholder="Escribe una ubicación"
        />
        <div class="panel-actions">
          <button class="btn" @click="emit('apply-location')">
            <i class="fa-solid fa-location-dot"></i>
            Usar esta ubicación
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.media-uploader {
  margin-top: 8px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-btn {
  padding: 8px 12px;
  border: 1px solid $text-light;
  border-radius: 10px;
  background: $white;
  color: $BAKANO-DARK;
  cursor: pointer;
}

.toolbar-btn:hover {
  background: $BAKANO-LIGHT;
}

.dropdown {
  margin-top: 8px;
  width: 220px;
  border: 1px solid $text-light;
  border-radius: 10px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  cursor: pointer;
}

.dropdown-item:hover {
  background: $BAKANO-LIGHT;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.toolbar-panels {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.emoji-panel {
  border: 1px solid $text-light;
  border-radius: 10px;
  padding: 10px;
  background: $white;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.emoji-btn {
  padding: 6px 8px;
  border: 1px solid $text-light;
  border-radius: 8px;
  background: $white;
  cursor: pointer;
}

.emoji-btn:hover {
  background: $BAKANO-LIGHT;
}

.location-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid $text-light;
  border-radius: 10px;
  padding: 10px;
  background: $white;
}

.location-input {
  border: 1px solid $text-light;
  border-radius: 8px;
  padding: 8px 10px;
}

.panel-actions {
  display: flex;
  justify-content: flex-end;
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
</style>