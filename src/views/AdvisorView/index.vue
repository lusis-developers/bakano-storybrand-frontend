<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { chatStore } from '@/stores/chat.store'
import { useBusinessStore } from '@/stores/business.store'
import AdvisorHeader from './components/AdvisorHeader.vue'
import ChatPanel from './components/ChatPanel.vue'
// MetricsPanel eliminado
import ChatSidebar from './components/ChatSidebar.vue'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const chat = chatStore()
const business = useBusinessStore()

const canStartChat = computed(() => !!business.currentBusiness?.id)

async function startNewConversation() {
  try {
    if (!business.currentBusiness?.id) {
      toast.triggerToast('Selecciona o carga un negocio antes de iniciar el chat', 'info')
      return
    }
    const created = await chat.createChat({ businessId: business.currentBusiness.id })
    if (!created) return
    await chat.fetchChatById(created.id)
    toast.triggerToast('Conversación iniciada', 'success')
  } catch (err: any) {
    console.error('Error iniciando conversación:', err)
    toast.triggerToast(err?.message || 'No se pudo iniciar la conversación', 'error')
  }
}

onMounted(async () => {
  // Si viene una semilla desde otra vista (e.g., Ads), crear conversación y enviar el mensaje inicial
  const seed = String(route.query.seed || '')
  const source = String(route.query.source || '')
  if (seed && canStartChat.value) {
    try {
      const src = source === 'facebook' || source === 'instagram' ? (source as 'facebook' | 'instagram') : 'internal'
      const created = await chat.createChat({ businessId: business.currentBusiness!.id, source: src, purpose: 'analytics' })
      if (created) {
        await chat.fetchChatById(created.id)
        await chat.addUserMessage(seed)
        await chat.generateAssistantReply()
        toast.triggerToast('Conversación creada con contexto de métricas', 'success')
      }
    } catch (err: any) {
      console.error('Seed chat error:', err)
      toast.triggerToast('No se pudo iniciar la conversación automáticamente', 'error')
    }
  }
})
</script>

<template>
  <div class="advisor-view">
    <AdvisorHeader @go-back="router.push('/dashboard')" @new-chat="startNewConversation" />

    <main class="advisor-main">
      <div class="grid">
        <aside class="grid-sidebar">
          <ChatSidebar :can-start-chat="canStartChat" @start-chat="startNewConversation" />
        </aside>
        <section class="grid-main">
          <ChatPanel :can-start-chat="canStartChat" @start-chat="startNewConversation" />
        </section>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.advisor-view {
  min-height: 100vh;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
}

.advisor-main {
  width: 100%;
  margin: 0;
  flex: 1;
  display: flex;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  width: 100%;
  height: 100%;
}

.grid-sidebar {
  order: 1;
}

.grid-main {
  order: 2;
  display: flex;
  min-height: 0;
}

.grid-main>* {
  flex: 1 1 auto;
  min-width: 0;
}

@media (min-width: 900px) {
  .grid {
    grid-template-columns: 300px 1fr;
    align-items: start;
  }

  .grid-sidebar {
    order: 1;
    position: sticky;
    top: 0;
    align-self: start;
  }

  .grid-main {
    order: 2;
    display: flex;
    min-height: 0;
  }
}
</style>
