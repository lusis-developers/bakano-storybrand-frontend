<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { chatStore } from '@/stores/chat.store'
import { useBusinessStore } from '@/stores/business.store'

interface Props {
  canStartChat: boolean
}
interface Emits {
  (e: 'start-chat'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const chat = chatStore()
const business = useBusinessStore()

const chats = computed(() => chat.chats)
const currentChatId = computed(() => chat.currentChatId)
const isLoading = computed(() => chat.loading.listing)

onMounted(async () => {
  await chat.listUserChats(
    business.currentBusiness?.id ? { businessId: business.currentBusiness.id, limit: 20 } : undefined,
  )
})

function selectChat(id: string) {
  if (!id) return
  chat.fetchChatById(id)
}

function newChat() {
  if (!props.canStartChat) return
  emit('start-chat')
}

function refresh() {
  chat.listUserChats(
    business.currentBusiness?.id ? { businessId: business.currentBusiness.id, limit: 20 } : undefined,
  )
}

function lastMessagePreview(item: any): string {
  const txt = item?.lastMessage?.content || ''
  return txt.length > 80 ? txt.slice(0, 80) + '…' : txt
}

function formatDate(value?: string): string {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return '—'
  }
}
</script>

<template>
  <aside class="chat-sidebar">
    <div class="sidebar-header">
      <h2>Historial</h2>
      <div class="actions">
        <button class="btn btn-sm" @click="refresh" :disabled="isLoading">
          <i class="fas fa-rotate"></i>
          Actualizar
        </button>
        <button class="btn btn-primary btn-sm" @click="newChat" :disabled="!canStartChat">
          <i class="fas fa-plus"></i>
          Nuevo
        </button>
      </div>
    </div>

    <div class="sidebar-content" v-if="chats.length > 0">
      <ul class="chat-list">
        <li
          v-for="item in chats"
          :key="item.id"
          class="chat-item"
          :class="{ active: item.id === currentChatId }"
          @click="selectChat(item.id)"
        >
          <div class="line-1">
            <span class="source">{{ item.source }}</span>
            <span class="purpose">• {{ item.purpose }}</span>
          </div>
          <div class="line-2">{{ lastMessagePreview(item) || 'Sin mensajes aún' }}</div>
          <div class="line-3">{{ formatDate(item.lastMessageAt) }}</div>
        </li>
      </ul>
    </div>

    <div class="empty" v-else>
      <i class="fas fa-comments"></i>
      <p>No existen conversaciones todavía.</p>
      <button class="btn btn-primary" @click="newChat" :disabled="!canStartChat">
        Crear conversación
      </button>
    </div>
  </aside>
  
</template>

<style lang="scss" scoped>
.chat-sidebar {
  background: white;
  border: 1px solid lighten($BAKANO-DARK, 78%);
  border-radius: 16px;
  padding: 0.75rem 0.75rem;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  h2 { font-size: 0.95rem; margin: 0; color: $BAKANO-DARK; }
  .actions { display: inline-flex; align-items: center; gap: 0.5rem; }
}

.sidebar-content { max-height: 520px; overflow: auto; border-top: 1px solid lighten($BAKANO-DARK, 85%); padding-top: 0.5rem; }

.chat-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.375rem; }
.chat-item {
  border: 1px solid lighten($BAKANO-DARK, 83%);
  border-radius: 12px;
  padding: 0.5rem 0.625rem;
  cursor: pointer;
  background: lighten($BAKANO-DARK, 98%);
}
.chat-item:hover { background: lighten($BAKANO-DARK, 97%); }
.chat-item.active { border-color: $BAKANO-PINK; box-shadow: 0 0 0 2px lighten($BAKANO-PINK, 45%); }

.line-1 {
  font-size: 0.8125rem;
  color: lighten($BAKANO-DARK, 10%);
  font-weight: 700;
}
.line-2 {
  font-size: 0.8125rem;
  color: lighten($BAKANO-DARK, 40%);
  margin-top: 2px;
}
.line-3 {
  font-size: 0.75rem;
  color: lighten($BAKANO-DARK, 45%);
  margin-top: 2px;
}

.empty {
  display: grid;
  place-items: center;
  gap: 0.5rem;
  color: lighten($BAKANO-DARK, 35%);
  padding: 1rem 0.5rem;
  i { font-size: 1.25rem; }
}

.btn { padding: 0.375rem 0.625rem; border-radius: 10px; font-size: 0.8125rem; border: 1px solid lighten($BAKANO-DARK, 80%); background: white; color: $BAKANO-DARK; cursor: pointer; }
.btn-sm { padding: 0.375rem 0.5rem; font-size: 0.75rem; }
.btn-primary { background: $BAKANO-PINK; color: white; border: none; }
.btn:disabled { opacity: 0.7; cursor: not-allowed; }

@media (max-width: 640px) {
  .sidebar-content { max-height: 360px; }
}
</style>

