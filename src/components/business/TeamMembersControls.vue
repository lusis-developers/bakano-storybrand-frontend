<script setup lang="ts">
import { ref, computed } from 'vue'
import TeamMembersModal from './TeamMembersModal.vue'
import type { IBusiness } from '@/types/business.types'

interface Props { business: IBusiness }
const props = defineProps<Props>()
const open = ref(false)
const businessId = computed(() => String((props.business as any)._id || (props.business as any).id))
const openModal = () => { open.value = true }
const closeModal = () => { open.value = false }
</script>

<template>
  <div class="team-controls">
    <button class="view-btn" type="button" @click="openModal">
      <i class="fas fa-users"></i>
      Ver equipo
    </button>
    <TeamMembersModal :visible="open" :business-id="businessId" @close="closeModal" />
  </div>
</template>

<style lang="scss" scoped>
.team-controls { margin-top: 0.5rem; }
.view-btn {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 0.75rem; font-size: 0.8125rem; font-weight: 700;
  color: $BAKANO-DARK; background: transparent; border: 1px solid lighten($BAKANO-DARK, 80%);
  border-radius: 8px; cursor: pointer;
}
.view-btn:hover { background: $BAKANO-LIGHT; }
@media (max-width: 480px) { .view-btn { width: 100%; justify-content: center; } }
</style>