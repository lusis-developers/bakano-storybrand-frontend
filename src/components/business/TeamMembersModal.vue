<script setup lang="ts">
import { ref, watch } from 'vue'
import Modal from '@/components/shared/Modal.vue'
import { useBusinessStore } from '@/stores/business.store'
import type { ITeamMember, IUserLite } from '@/types/business.types'
import { useToast } from '@/composables/useToast'

interface Props {
  visible: boolean
  businessId: string
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const businessStore = useBusinessStore()
const { triggerToast } = useToast()

const members = ref<ITeamMember[]>([])
const isLoading = ref(false)
const revoking = ref<string | null>(null)

const loadMembers = async () => {
  if (!props.visible) return
  isLoading.value = true
  try {
    members.value = await businessStore.fetchTeamMembers(props.businessId)
  } catch (e: any) {
    triggerToast(e?.message || 'Error al cargar miembros', 'error')
  } finally {
    isLoading.value = false
  }
}

watch(() => props.visible, () => { loadMembers() }, { immediate: true })
watch(() => props.businessId, () => { if (props.visible) loadMembers() })

const nameOf = (u: string | IUserLite): string => {
  if (typeof u === 'string') return u
  const full = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()
  return full || u.email || u._id
}

const emailOf = (u: string | IUserLite): string | undefined => {
  if (typeof u === 'string') return undefined
  return u.email
}

const userIdOf = (u: string | IUserLite): string => {
  return typeof u === 'string' ? u : (u._id || (u as any).id)
}

const revokeInvite = async (member: ITeamMember) => {
  const uid = userIdOf(member.user)
  revoking.value = uid
  try {
    const updated = await businessStore.revokeTeamMember(props.businessId, uid)
    if (updated) {
      triggerToast('Invitación revocada', 'success')
      await loadMembers()
    } else {
      triggerToast('No fue posible revocar la invitación', 'error')
    }
  } catch (e: any) {
    triggerToast(e?.message || 'Error al revocar invitación', 'error')
  } finally {
    revoking.value = null
  }
}
</script>

<template>
  <Modal :visible="visible" title="Miembros del equipo" width="600px" @close="emit('close')">
    <div class="content">
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <span>Cargando miembros...</span>
      </div>

      <div v-else-if="members.length === 0" class="empty">
        <i class="fas fa-users"></i>
        <p>No hay vendedores disponibles por ahora</p>
      </div>

      <ul v-else class="list">
        <li v-for="m in members" :key="(typeof m.user === 'string' ? m.user : m.user._id)" class="item">
          <div class="avatar">
            <i class="fas fa-user"></i>
          </div>
          <div class="info">
            <div class="line">
              <span class="name">{{ nameOf(m.user) }}</span>
              <div class="right">
                <span class="role">{{ m.role }}</span>
              </div>
            </div>
            <div class="sub">
              <span v-if="emailOf(m.user)" class="email">
                <i class="fas fa-envelope"></i> {{ emailOf(m.user) }}
              </span>
              <span class="status" :class="m.status">{{ m.status }}</span>
            </div>
          </div>
          <button
            v-if="m.status !== 'removed'"
            class="overlay-revoke"
            type="button"
            :disabled="revoking === userIdOf(m.user)"
            @click="revokeInvite(m)"
          >
            <i class="fas fa-user-slash"></i>
            {{ m.status === 'active' ? 'Revocar permisos' : 'Revocar invitación' }}
          </button>
        </li>
      </ul>
    </div>
    <template #footer>
      <button class="btn btn-outline" type="button" @click="emit('close')">Cerrar</button>
    </template>
  </Modal>
</template>

<style lang="scss" scoped>
.content {
  display: grid;
  gap: 0.75rem;
}

.loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 3px solid rgba($BAKANO-DARK, 0.12);
  border-top: 3px solid $BAKANO-PINK;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.empty {
  display: grid;
  place-items: center;
  color: lighten($BAKANO-DARK, 40%);
  gap: 0.25rem;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;
}

.item {
  position: relative;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 0.5rem;
  border: 1px solid lighten($BAKANO-DARK, 90%);
  border-radius: 8px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: $BAKANO-LIGHT;
  color: $BAKANO-DARK;
  display: grid;
  place-items: center;
}

.info {
  display: grid;
  gap: 0.25rem;
  flex: 1;
}

.line {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.right {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.name {
  font-weight: 700;
  color: $BAKANO-DARK;
}

.role {
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: rgba($BAKANO-PINK, 0.1);
  color: $BAKANO-DARK;
  border: 1px solid lighten($BAKANO-PINK, 24%);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.5rem;
  font-weight: 700;
  font-size: 0.75rem;
  border-radius: 8px;
  border: 1px solid lighten($BAKANO-DARK, 80%);
  background: transparent;
  color: $BAKANO-DARK;
}

.action-btn:hover {
  background: $BAKANO-LIGHT;
}

.action-btn.danger {
  color: $BAKANO-PINK;
  border-color: lighten($BAKANO-PINK, 24%);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.sub {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: lighten($BAKANO-DARK, 30%);
  font-size: 0.8125rem;
}

.email {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.status {
  text-transform: capitalize;
}

.status.invited {
  color: lighten($BAKANO-DARK, 20%);
}

.status.active {
  color: $BAKANO-PINK;
}

.status.removed {
  color: lighten($BAKANO-DARK, 50%);
}

.btn {
  padding: 0.625rem 1rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.8125rem;
  border: 1px solid lighten($BAKANO-DARK, 80%);
  background: transparent;
}

.overlay-revoke {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.65rem;
  font-weight: 700;
  font-size: 0.75rem;
  border-radius: 999px;
  border: 1px solid lighten($BAKANO-PINK, 10%);
  background: $BAKANO-PINK;
  color: #fff;
  box-shadow: 0 4px 10px rgba($BAKANO-PINK, 0.25);
  transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.05s ease;
}

.overlay-revoke:hover {
  background: darken($BAKANO-PINK, 4%);
  box-shadow: 0 6px 14px rgba($BAKANO-PINK, 0.3);
}

.overlay-revoke:active {
  transform: translateY(1px);
}

.overlay-revoke:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}
</style>