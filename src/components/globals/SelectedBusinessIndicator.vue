<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useBusinessStore } from '@/stores/business.store'
import { useRouter } from 'vue-router'

const business = useBusinessStore()
const isOpen = ref(false)
const router = useRouter()
const emit = defineEmits(['requestCloseHeader'])

const current = computed(() => business.currentBusiness)
const list = computed(() => business.businesses)
const isLoading = computed(() => business.loading.fetching)

async function init() {
  await business.ensureCurrentBusiness()
}
onMounted(init)

function toggleOpen() {
  if (list.value.length === 0) return
  isOpen.value = !isOpen.value
}

function select(item: any) {
  business.setCurrentBusiness(item)
  isOpen.value = false
}

function goManage() {
  // Close local dropdown and request header menus to close
  isOpen.value = false
  emit('requestCloseHeader')
  router.push('/business')
}
</script>

<template>
  <div class="biz-indicator" :class="{ 'biz-indicator--disabled': list.length === 0 }">
    <button class="biz-current" @click="toggleOpen" :disabled="list.length === 0">
      <span class="biz-label">Negocio</span>
      <span class="biz-name">{{ current?.name ?? (isLoading ? 'Cargando…' : 'Sin negocios') }}</span>
      <svg class="biz-chevron" :class="{ 'biz-chevron--open': isOpen }" width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <div class="biz-dropdown" v-if="isOpen">
      <ul class="biz-list">
        <li v-for="b in list" :key="b.id" class="biz-item">
          <button class="biz-option" @click="select(b)">
            <span class="biz-option-name">{{ b.name }}</span>
            <span v-if="b.isActive" class="biz-badge">Activo</span>
          </button>
        </li>
      </ul>
      <div class="biz-actions">
        <button class="biz-manage" @click="goManage">Administrar negocios</button>
      </div>
    </div>
  </div>
  
</template>

<style scoped lang="scss">
.biz-indicator {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.biz-indicator--disabled {
  opacity: 0.7;
}

.biz-current {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  border: 1px solid lighten($BAKANO-DARK, 85%);
  background: rgba($BAKANO-DARK, 0.02);
  color: $BAKANO-DARK;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  max-width: 240px;
  &:hover {
    background: rgba($BAKANO-DARK, 0.06);
  }
}

.biz-label {
  font-size: 0.75rem;
  color: lighten($BAKANO-DARK, 20%);
}

.biz-name {
  font-weight: 600;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.biz-chevron {
  color: lighten($BAKANO-DARK, 35%);
  transition: transform 0.15s ease-in-out;
}
.biz-chevron--open {
  transform: rotate(180deg);
}

.biz-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 260px;
  background: white;
  border: 1px solid lighten($BAKANO-DARK, 78%);
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  z-index: 1100;
}

.biz-list {
  list-style: none;
  margin: 0;
  padding: 0.25rem;
  max-height: 300px;
  overflow: auto;
}

.biz-item { }

.biz-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.5rem 0.5rem;
  border-radius: 6px;
  background: transparent;
  border: none;
  color: $BAKANO-DARK;
  cursor: pointer;
  text-align: left;
  &:hover {
    background: lighten($BAKANO-DARK, 96%);
  }
}

.biz-option-name {
  font-size: 0.875rem;
}

.biz-badge {
  font-size: 0.7rem;
  color: white;
  background: $BAKANO-PINK;
  padding: 0.125rem 0.375rem;
  border-radius: 999px;
}

.biz-actions {
  padding: 0.5rem;
  border-top: 1px solid lighten($BAKANO-DARK, 90%);
}

.biz-manage {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  background: lighten($BAKANO-DARK, 96%);
  color: $BAKANO-DARK;
  border: 1px solid lighten($BAKANO-DARK, 85%);
  cursor: pointer;
  font-weight: 600;
  &:hover {
    background: lighten($BAKANO-DARK, 94%);
  }
}
</style>