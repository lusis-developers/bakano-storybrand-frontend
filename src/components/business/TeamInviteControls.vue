<script setup lang="ts">
import { ref, computed } from 'vue'
import TeamInviteModal from './TeamInviteModal.vue'
import type { IBusiness } from '@/types/business.types'

interface Props {
  business: IBusiness
}

const props = defineProps<Props>()
const open = ref(false)

const businessId = computed(() => String((props.business as any)._id || (props.business as any).id))

const openModal = () => {
  open.value = true
}
const closeModal = () => {
  open.value = false
}
</script>

<template>
  <div class="team-controls">
    <button class="invite-btn" type="button" @click="openModal">
      <i class="fas fa-user-plus"></i>
      Invitar al equipo
    </button>
    <TeamInviteModal :visible="open" :business-id="businessId" @close="closeModal" @invited="closeModal" />
  </div>
</template>

<style lang="scss" scoped>
.team-controls {
  margin-top: 0.75rem;
}

.invite-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #fff;
  background: $BAKANO-PINK;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.invite-btn:hover { filter: brightness(0.95); }

@media (max-width: 480px) {
  .invite-btn { width: 100%; justify-content: center; }
}
</style>