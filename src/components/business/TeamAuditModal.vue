<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import Modal from '@/components/shared/Modal.vue'
import { useBusinessStore } from '@/stores/business.store'
import type { ITeamAuditEvent, TeamAuditResponse } from '@/types/business.types'
import { useToast } from '@/composables/useToast'

interface Props { visible: boolean; businessId: string }
interface Emits { (e: 'close'): void }

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { triggerToast } = useToast()
const store = useBusinessStore()

const events = ref<ITeamAuditEvent[]>([])
const page = ref(1)
const limit = ref(10)
const isLoading = ref(false)
const pagination = ref<TeamAuditResponse['data']['pagination'] | null>(null)
const canPrev = computed(() => !!(pagination.value && pagination.value.hasPrevPage))
const canNext = computed(() => !!(pagination.value && pagination.value.hasNextPage))

const icons: Record<string, string> = {
  invited: 'fa-user-plus',
  accepted: 'fa-check-circle',
  role_updated: 'fa-user-tag',
  revoked: 'fa-user-slash',
}

const loadAudit = async () => {
  if (!props.visible) return
  isLoading.value = true
  try {
    const data = await store.fetchTeamAudit(props.businessId, page.value, limit.value)
    events.value = data?.events || []
    pagination.value = data?.pagination || null
  } catch (e: any) {
    triggerToast(e?.message || 'Error al cargar auditoría', 'error')
  } finally {
    isLoading.value = false
  }
}

const prevPage = async () => {
  if (pagination.value && pagination.value.hasPrevPage) {
    page.value -= 1
    await loadAudit()
  }
}

const nextPage = async () => {
  if (pagination.value && pagination.value.hasNextPage) {
    page.value += 1
    await loadAudit()
  }
}

watch(() => props.visible, () => { loadAudit() }, { immediate: true })
</script>

<template>
  <Modal :visible="visible" title="Auditoría de equipo" width="960px" @close="emit('close')">
    <div class="content">
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <span>Cargando auditoría...</span>
      </div>

      <div v-else-if="events.length === 0" class="empty">
        <i class="fas fa-clipboard-list"></i>
        <p>No hay eventos de auditoría</p>
      </div>

      <ul v-else class="list">
        <li v-for="ev in events" :key="ev._id" class="item">
          <div class="icon"><i class="fas" :class="icons[ev.action]"></i></div>
          <div class="info">
            <div class="line">
              <span class="action">{{ ev.action.replace('_', ' ') }}</span>
              <span v-if="ev.role" class="role">{{ ev.role }}</span>
            </div>
            <div class="sub">
              <span class="actor"><i class="fas fa-user"></i> {{ typeof ev.actor === 'string' ? ev.actor : (ev.actor.firstName + ' ' + ev.actor.lastName).trim() }}</span>
              <span class="target"><i class="fas fa-user"></i> {{ typeof ev.targetUser === 'string' ? ev.targetUser : (ev.targetUser.firstName + ' ' + ev.targetUser.lastName).trim() }}</span>
              <span class="date"><i class="fas fa-clock"></i> {{ new Date(ev.createdAt).toLocaleString() }}</span>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <template #footer>
      <div class="footer">
        <button class="btn btn-outline" type="button" @click="emit('close')">Cerrar</button>
        <div class="pager">
          <button class="btn btn-outline" type="button" @click="prevPage" :disabled="!canPrev">
            <i class="fas fa-chevron-left"></i> Anterior
          </button>
          <button class="btn btn-primary" type="button" @click="nextPage" :disabled="!canNext">
            Siguiente <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
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
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 0.5rem;
  border: 1px solid lighten($BAKANO-DARK, 90%);
  border-radius: 8px;
  overflow-x: auto;
}

.icon {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: $BAKANO-LIGHT;
  color: $BAKANO-PINK;
  display: grid;
  place-items: center;
}

.info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  overflow-x: auto;
}

.line {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.action {
  font-weight: 700;
  color: $BAKANO-DARK;
  text-transform: capitalize;
}

.role {
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: rgba($BAKANO-PINK, 0.1);
  color: $BAKANO-DARK;
  border: 1px solid lighten($BAKANO-PINK, 24%);
}

.sub {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  color: lighten($BAKANO-DARK, 30%);
  font-size: 0.8125rem;
}

.date {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.btn {
  padding: 0.625rem 1rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.8125rem;
  border: 1px solid lighten($BAKANO-DARK, 80%);
  background: transparent;
}

.btn-primary {
  background: $BAKANO-PINK;
  color: #fff;
  border-color: lighten($BAKANO-PINK, 10%);
}

.btn[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.pager {
  display: flex;
  gap: 0.5rem;
}
</style>