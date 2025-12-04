<script setup lang="ts">
import type { FacebookAdItem } from '@/types/facebook.types'
import TopCampaignItem from './TopCampaignItem.vue'

const props = defineProps<{ ads: FacebookAdItem[] }>()
const emit = defineEmits<{ (e: 'open-details', ad: FacebookAdItem): void }>()
</script>

<template>
  <ul class="campaign-list">
    <TopCampaignItem v-for="(ad, i) in props.ads" :key="ad.id" :ad="ad" :index="i" @open-details="a => emit('open-details', a)" />
  </ul>
</template>

<style lang="scss" scoped>
.campaign-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0;

  @media (min-width: 768px) {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
}
</style>
