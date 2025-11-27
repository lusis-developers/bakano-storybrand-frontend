<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useBusinessStore } from '@/stores/business.store'
import facebookService from '@/services/facebook.service'
import type { FacebookAdItem } from '@/types/facebook.types'

const business = useBusinessStore()
const loading = ref(false)
const error = ref<string | null>(null)
const ads = ref<FacebookAdItem[]>([])

const businessId = computed(() => String((business.currentBusiness as any)?.id || (business.currentBusiness as any)?._id || ''))

const loadTopAds = async () => {
  if (!businessId.value) {
    try {
      const ensured = await (business as any).ensureCurrentBusiness?.()
      if (!ensured) {
        error.value = 'Selecciona o carga un negocio para ver Top Ads'
        return
      }
    } catch (e) {
      error.value = 'Selecciona o carga un negocio para ver Top Ads'
      return
    }
  }
  loading.value = true
  error.value = null
  try {
    const res = await facebookService.getTopAds(businessId.value, 5)
    ads.value = res.ads || []
  } catch (e: any) {
    error.value = e?.message || 'No se pudieron cargar los Top Ads'
  } finally {
    loading.value = false
  }
}

onMounted(loadTopAds)
</script>

<template>
  <div class="ads-top">
    <div class="ads-top__header">
      <h2>Top Ads</h2>
      <button class="refresh-btn" type="button" @click="loadTopAds" :disabled="loading">{{ loading ? 'Cargando…' : 'Actualizar' }}</button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-else-if="!loading && ads.length === 0" class="empty">No hay anuncios destacados disponibles.</p>

    <ul v-else class="ads-list">
      <li v-for="ad in ads" :key="ad.id" class="ad-item">
        <div class="ad-thumb" v-if="ad.preview?.thumbnailUrl">
          <img :src="ad.preview.thumbnailUrl" alt="Preview" />
        </div>
        <div class="ad-info">
          <div class="ad-title">{{ ad.name || ad.metrics?.ad_name || 'Anuncio' }}</div>
          <div class="ad-metrics">
            <span>Impresiones: {{ ad.metrics?.impressions ?? '-' }}</span>
            <span>Alcance: {{ ad.metrics?.reach ?? '-' }}</span>
            <span>Clicks: {{ ad.metrics?.clicks ?? '-' }}</span>
            <span>Gasto: {{ ad.metrics?.spend ?? '-' }}</span>
            <span>CTR: {{ ad.metrics?.ctr ?? '-' }}</span>
          </div>
          <a v-if="ad.links?.permalinkUrl" class="ad-link" :href="ad.links.permalinkUrl" target="_blank" rel="noopener noreferrer">Ver en Meta</a>
        </div>
      </li>
    </ul>
  </div>
  
</template>

<style lang="scss" scoped>
.ads-top {
  margin-bottom: 12px;
}

.ads-top__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.refresh-btn {
  padding: 0.4rem 0.8rem;
  border: 1px solid rgba($BAKANO-DARK, 0.15);
  border-radius: 8px;
  background: $white;
  color: $BAKANO-DARK;
  font-weight: 600;
  cursor: pointer;
}

.error {
  color: #dc2626;
  font-size: 0.95rem;
}

.empty {
  color: rgba($BAKANO-DARK, 0.6);
}

.ads-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
}

.ad-item {
  display: flex;
  gap: 0.75rem;
  background: $white;
  border: 1px solid rgba($BAKANO-DARK, 0.06);
  border-radius: 10px;
  padding: 0.75rem;
}

.ad-thumb {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.ad-info {
  flex: 1;
}

.ad-title {
  font-weight: 700;
  color: $BAKANO-DARK;
  margin-bottom: 0.25rem;
}

.ad-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  color: rgba($BAKANO-DARK, 0.8);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.ad-link {
  color: $BAKANO-PINK;
  font-weight: 600;
  text-decoration: none;
}
</style>
