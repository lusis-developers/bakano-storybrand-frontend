<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { chatStore } from '@/stores/chat.store'
import { useBusinessStore } from '@/stores/business.store'
import AdvisorHeader from './components/AdvisorHeader.vue'
import ChatPanel from './components/ChatPanel.vue'
// MetricsPanel eliminado
import ChatSidebar from './components/ChatSidebar.vue'

const router = useRouter()
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

onMounted(() => {
  // Si no hay negocio cargado, intentamos obtenerlo desde el store (opcional)
  // En caso de que la app ya maneje la carga del negocio en otra vista, esto no hace nada.
  if (!business.currentBusiness) {
    // No forzamos carga aquí; la vista de negocio/flujo de onboarding se encarga.
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
