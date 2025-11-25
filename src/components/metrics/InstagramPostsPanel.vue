<script setup lang="ts">
import { onMounted, computed, watch } from 'vue'
import { useBusinessStore } from '@/stores/business.store'
import { useIntegrationStore } from '@/stores/integration.store'

const businessStore = useBusinessStore()
const integrationStore = useIntegrationStore()

const businessId = computed(() => {
  const cur = businessStore.currentBusiness
  if (cur?.id || (cur as any)?._id) return String((cur as any).id || (cur as any)._id)
  const first = businessStore.businesses[0]
  return first ? String((first as any).id || (first as any)._id) : ''
})

async function ensurePosts(limit = 10) {
  if (!businessId.value) return
  if (!integrationStore.instagramPosts || integrationStore.instagramPosts.length === 0) {
    await integrationStore.loadInstagramPosts(businessId.value, limit)
  }
}

onMounted(async () => {
  await ensurePosts(10)
})

watch(businessId, async () => {
  await ensurePosts(10)
})

const posts = computed(() => integrationStore.instagramPosts || [])
const loading = computed(() => integrationStore.igPostsLoading)
const error = computed(() => integrationStore.igPostsError)
const missing = computed(() => integrationStore.igIntegrationMissing)

function isVideo(p: any): boolean {
  return String(p?.media_type || '').toUpperCase() === 'VIDEO'
}

function displaySrc(p: any): string {
  return p?.media_url || p?.thumbnail_url || ''
}
</script>

<template>
  <section class="ig-posts">
    <header class="ig-posts__header">
      <h3>Últimos posts de Instagram</h3>
      <span class="count" v-if="!loading && posts.length">{{ posts.length }}</span>
    </header>

    <div v-if="missing" class="ig-missing">Conecta tu cuenta de Instagram para ver actividad reciente</div>
    <div v-else-if="error" class="ig-error">{{ error }}</div>
    <div v-else class="ig-grid" :aria-busy="loading">
      <div v-for="p in posts" :key="p.id || p.permalink || p.media_url" class="ig-card">
        <div class="media" :class="{ video: isVideo(p) }">
          <video v-if="isVideo(p) && p.media_url" :src="p.media_url" :poster="p.thumbnail_url" controls preload="none"></video>
          <img v-else :src="displaySrc(p)" alt="Post" />
          <div v-if="isVideo(p)" class="play-badge"><i class="fas fa-play"></i></div>
        </div>
        <div class="content">
          <p class="caption">{{ (p.caption || '').slice(0, 140) }}</p>
          <div class="meta">
            <span>{{ (p.timestamp || '').toString().slice(0, 10) }}</span>
            <a v-if="p.permalink" :href="p.permalink" target="_blank" rel="noopener" class="link">Ver en Instagram</a>
          </div>
          <div class="chips">
            <span class="chip">Alcance: {{ p?.insights?.reach || 0 }}</span>
            <span class="chip">Engagement: {{ p?.insights?.engagement || 0 }}</span>
            <span v-if="p?.insights?.impressions !== undefined" class="chip">Impresiones: {{ p.insights.impressions }}</span>
            <span v-if="p?.insights?.saved !== undefined" class="chip">Guardados: {{ p.insights.saved }}</span>
            <span v-if="p?.like_count !== undefined" class="chip">Me gusta: {{ p.like_count }}</span>
            <span v-if="p?.comments_count !== undefined" class="chip">Comentarios: {{ p.comments_count }}</span>
          </div>
        </div>
      </div>
      <div v-if="!loading && posts.length === 0" class="ig-empty">Sin actividad reciente</div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.ig-posts {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ig-posts__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.ig-posts__header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: $BAKANO-DARK;
}

.count {
  font-size: 12px;
  color: lighten($BAKANO-DARK, 35%);
}

.ig-missing,
.ig-error,
.ig-empty {
  background: #fff;
  border: 1px solid lighten($BAKANO-DARK, 85%);
  border-radius: 10px;
  padding: 10px;
  color: $BAKANO-DARK;
}

.ig-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
}

.ig-card {
  background: #fff;
  border: 1px solid lighten($BAKANO-DARK, 85%);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.media {
  width: 100%;
  aspect-ratio: 4 / 3;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.media img,
.media video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media.video {
  position: relative;
}

.play-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.caption {
  margin: 0;
  font-size: 14px;
  color: $BAKANO-DARK;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: lighten($BAKANO-DARK, 35%);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  display: inline-block;
  padding: 4px 8px;
  border: 1px solid lighten($BAKANO-DARK, 80%);
  border-radius: 999px;
  font-size: 12px;
  color: $BAKANO-DARK;
}

@media (max-width: 768px) {
  .ig-grid {
    grid-template-columns: 1fr;
  }
}
</style>
