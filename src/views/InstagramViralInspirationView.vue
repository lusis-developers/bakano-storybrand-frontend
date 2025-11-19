<script setup lang="ts">
import { ref } from 'vue'
import { useIntegrationStore } from '@/stores/integration.store'
import ViralSearchForm from '@/components/instagram/ViralSearchForm.vue'
import InstagramViralCard from '@/components/instagram/InstagramViralCard.vue'
import InstagramEmbedModal from '@/components/instagram/InstagramEmbedModal.vue'
import InstagramSkeletonGrid from '@/components/instagram/InstagramSkeletonGrid.vue'

const store = useIntegrationStore()
const open = ref(false)
const currentUrl = ref<string | undefined>(undefined)

const handleSearch = async (payload: { hashtags: string[]; resultsType: 'posts' | 'stories'; resultsLimit: number; keywordSearch?: boolean }) => {
  if (!payload.hashtags.length) return
  await store.fetchInstagramViralPosts(payload)
}

const openModal = (url?: string) => {
  if (!url) return
  currentUrl.value = url
  open.value = true
}

const closeModal = () => {
  open.value = false
  currentUrl.value = undefined
}
</script>

<template>
  <div class="page">
    <div class="intro">
      <h2>Inspiración Viral</h2>
      <p>Descubre contenido popular en Instagram para inspirar tus guiones y campañas.</p>
    </div>
    <ViralSearchForm @search="handleSearch" />

    <div v-if="store.igViralLoading" class="loading">
      <InstagramSkeletonGrid :count="6" />
    </div>
    <div class="status error" v-else-if="store.igViralError">{{ store.igViralError }}</div>

    <div v-else class="grid">
      <InstagramViralCard
        v-for="it in store.instagramViralItems"
        :key="(it as any).url || (it as any).caption"
        :item="it"
        @open="openModal"
      />
      <div v-if="!store.instagramViralItems.length" class="empty">Escribe palabras clave para buscar contenido viral.</div>
    </div>

    <InstagramEmbedModal :open="open" :permalink="currentUrl" @close="closeModal" />
  </div>
  </template>

<style lang="scss" scoped>
.page { display: grid; gap: 1rem; padding: 1rem; }
.intro h2 { margin: 0; color: #1e293b; }
.intro p { margin: 0; color: #64748b; }
.loading { padding: 0.5rem 0; }
.status.error { color: #ef4444; }
.grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
.empty { color: #64748b; font-size: 0.9rem; }
@media (min-width: 640px) { .grid { grid-template-columns: 1fr 1fr; } }
@media (min-width: 1024px) { .grid { grid-template-columns: 1fr 1fr 1fr; } }
</style>