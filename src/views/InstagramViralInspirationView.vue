<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useIntegrationStore } from '@/stores/integration.store'
import ViralSearchForm from '@/components/instagram/ViralSearchForm.vue'
import InstagramViralCard from '@/components/instagram/InstagramViralCard.vue'
import InstagramEmbedModal from '@/components/instagram/InstagramEmbedModal.vue'
import InstagramSkeletonGrid from '@/components/instagram/InstagramSkeletonGrid.vue'

const store = useIntegrationStore()
const router = useRouter()
const open = ref(false)
const currentUrl = ref<string | undefined>(undefined)
const docked = ref(false)

const handleSearch = async (payload: { hashtags: string[]; resultsType: 'posts' | 'stories'; resultsLimit: number; keywordSearch?: boolean }) => {
  if (!payload.hashtags.length) return
  docked.value = true
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

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="viral-page">
    <div class="viral-toolbar">
      <button type="button" class="viral-back" @click="goBack" aria-label="Volver">
        <i class="fa-solid fa-arrow-left"></i>
        <span>Volver</span>
      </button>
    </div>
    <div class="viral-intro">
      <div class="viral-intro__icon" aria-hidden="true"><i class="fa-solid fa-fire"></i></div>
      <div class="viral-intro__content">
        <h2 class="viral-intro__title">Inspiración Viral</h2>
        <p class="viral-intro__desc">Descubre contenido popular en Instagram para inspirar tus guiones y campañas.</p>
      </div>
    </div>

    <div class="viral-search-zone" :class="{ 'is-docked': docked }">
      <div class="viral-search" :class="{ 'viral-search--docked': docked }">
        <ViralSearchForm @search="handleSearch" />
      </div>
    </div>

    <div v-if="store.igViralLoading" class="viral-status viral-status--loading">
      <i class="fa-solid fa-spinner fa-spin"></i>
      <span>Cargando resultados…</span>
    </div>
    <div v-if="store.igViralLoading" class="viral-loading">
      <InstagramSkeletonGrid :count="6" />
    </div>

    <div class="viral-status viral-status--error" v-else-if="store.igViralError">
      <i class="fa-solid fa-triangle-exclamation"></i>
      <span>{{ store.igViralError }}</span>
      <small>Intenta nuevamente con otras palabras o ajusta los filtros.</small>
    </div>

    <div v-else class="viral-grid">
      <InstagramViralCard
        v-for="it in store.instagramViralItems"
        :key="(it as any).url || (it as any).caption"
        :item="it"
        @open="openModal"
      />
      <div v-if="!store.instagramViralItems.length" class="viral-empty">
        <i class="fa-regular fa-compass"></i>
        <span>Escribe palabras clave para buscar contenido viral.</span>
      </div>
    </div>

    <InstagramEmbedModal :open="open" :permalink="currentUrl" @close="closeModal" />
  </div>
  </template>

<style lang="scss" scoped>
.viral-page {
  display: grid;
  gap: 1rem;
  padding: 1rem;
}

.viral-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.viral-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  border: 1px solid rgba($BAKANO-DARK, 0.12);
  border-radius: 10px;
  background: $white;
  color: $BAKANO-DARK;
  font-weight: 600;
  cursor: pointer;
}

.viral-back:hover {
  background: rgba($BAKANO-PURPLE, 0.08);
  color: $BAKANO-PURPLE;
}

.viral-intro {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.viral-intro__icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba($BAKANO-PURPLE, 0.1);
  color: $BAKANO-PURPLE;
}

.viral-intro__title {
  margin: 0;
  color: $BAKANO-DARK;
  font-weight: 700;
}

.viral-intro__desc {
  margin: 0;
  color: lighten($BAKANO-DARK, 35%);
}

.viral-search-zone {
  display: grid;
  place-items: center;
  min-height: 40vh;
  transition: all 0.4s ease;
}

.viral-search-zone.is-docked {
  min-height: 0;
  place-items: start;
}

.viral-search {
  background: $white;
  border: 1px solid rgba($BAKANO-DARK, 0.12);
  border-radius: 16px;
  padding: 1rem;
  width: 100%;
  max-width: 760px;
  transition: transform 0.4s ease, box-shadow 0.2s ease;
  transform: translateY(10vh);
}

.viral-search--docked {
  transform: translateY(0);
  box-shadow: none;
}

.viral-status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  font-weight: 600;
}

.viral-status--loading {
  color: $BAKANO-PURPLE;
  background: rgba($BAKANO-PURPLE, 0.08);
}

.viral-status--error {
  color: $BAKANO-PINK;
  background: rgba($BAKANO-PINK, 0.08);
  border: 1px solid rgba($BAKANO-PINK, 0.15);
}

.viral-status--error small {
  font-weight: 500;
  color: rgba($BAKANO-DARK, 0.6);
}

.viral-loading {
  padding: 0.5rem 0;
}

.viral-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.viral-empty {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: lighten($BAKANO-DARK, 40%);
  font-size: 0.9rem;
}

@media (min-width: 640px) {
  .viral-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 1024px) {
  .viral-grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
</style>
