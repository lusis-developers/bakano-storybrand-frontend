<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import facebookService from '@/services/facebook.service'

const props = defineProps<{ businessId: string }>()

const loading = ref(false)
const error = ref<string | null>(null)
const posts = ref<Array<{ id: string; created_time: string; message?: string; full_picture?: string; permalink_url: string; insights?: Record<string, any> }>>([])

async function loadPosts() {
  if (!props.businessId) return
  loading.value = true
  error.value = null
  try {
    const { posts: result } = await facebookService.getPagePosts(props.businessId)
    posts.value = Array.isArray(result) ? result : []
  } catch (e: any) {
    error.value = e?.message || 'No se pudieron cargar los posts de Facebook'
  } finally {
    loading.value = false
  }
}

onMounted(loadPosts)
watch(() => props.businessId, loadPosts)
</script>

<template>
  <section class="fb-posts">
    <header class="fb-posts__header">
      <h3>Últimos posts de Facebook</h3>
      <span class="muted" v-if="loading">Cargando…</span>
      <span class="muted" v-else>Posts: {{ posts.length }}</span>
    </header>
    <div v-if="error" class="error">{{ error }}</div>
    <div class="posts-grid">
      <article v-for="post in posts" :key="post.id" class="post-card">
        <a :href="post.permalink_url" target="_blank" rel="noopener" class="media" aria-label="Abrir post en Facebook">
          <img v-if="post.full_picture" :src="post.full_picture" alt="Imagen del post" />
          <div v-else class="media--placeholder"></div>
        </a>
        <div class="content">
          <div class="meta">
            <span class="date">{{ new Date(post.created_time).toLocaleDateString() }}</span>
          </div>
          <p class="message">{{ (post.message || '').slice(0, 160) }}</p>
          <div class="chips">
            <span v-if="post.insights?.post_impressions" class="chip">Imp: {{ post.insights.post_impressions }}</span>
            <span v-if="post.insights?.post_engaged_users" class="chip">Eng: {{ post.insights.post_engaged_users }}</span>
            <span v-if="post.insights?.post_video_views" class="chip">Views: {{ post.insights.post_video_views }}</span>
            <span v-if="post.insights?.post_impressions_unique" class="chip">Unique: {{ post.insights.post_impressions_unique }}</span>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.fb-posts__header { display: flex; align-items: baseline; justify-content: space-between; }
.posts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
.post-card { background: #fff; border: 1px solid lighten($BAKANO-DARK, 85%); border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; }
.post-card .media { display: block; aspect-ratio: 1 / 1; background: #f8fafc; }
.post-card .media img { width: 100%; height: 100%; object-fit: cover; display: block; }
.post-card .media--placeholder { width: 100%; height: 100%; background: #f3f4f6; }
.post-card .content { padding: 10px; display: flex; flex-direction: column; gap: 6px; }
.post-card .meta { display: flex; justify-content: space-between; color: lighten($BAKANO-DARK, 35%); font-size: 12px; }
.post-card .message { margin: 0; font-size: 13px; color: $BAKANO-DARK; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { padding: 3px 6px; border: 1px solid lighten($BAKANO-DARK, 80%); border-radius: 999px; font-size: 12px; color: $BAKANO-DARK; }
</style>
