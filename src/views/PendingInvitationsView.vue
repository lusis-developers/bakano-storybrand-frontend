<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useBusinessStore } from '@/stores/business.store'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'

const businessStore = useBusinessStore()
const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

const invites = computed(() => businessStore.pendingInvitations)
const count = computed(() => businessStore.pendingInvitationsCount)
const isLoading = computed(() => businessStore.loading.fetching)

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  await businessStore.fetchPendingInvitations()
})

async function accept(id: string) {
  const updated = await businessStore.acceptTeamInvite(id)
  if (updated) {
    toast.triggerToast('Invitación aceptada', 'success')
    await businessStore.fetchPendingInvitations()
    router.push('/business')
  }
}
</script>

<template>
  <section class="invites">
    <div class="container">
      <header class="header">
        <h1>Invitaciones pendientes</h1>
        <p v-if="count">Tienes {{ count }} invitación(es) pendiente(s)</p>
      </header>

      <div v-if="isLoading" class="loading">Cargando…</div>

      <div v-else>
        <div v-if="!invites.length" class="empty">
          <div class="icon"><i class="fas fa-inbox"></i></div>
          <h2>No tienes invitaciones pendientes</h2>
          <p>Cuando recibas una, aparecerá aquí para aceptarla sin usar email.</p>
        </div>

        <ul v-else class="list">
          <li v-for="inv in invites" :key="inv.businessId" class="item">
            <div class="info">
              <h3 class="name">{{ inv.businessName }}</h3>
              <p class="meta">Rol: <strong>{{ inv.role }}</strong></p>
            </div>
            <button class="btn btn-primary" @click="accept(inv.businessId)">
              <i class="fas fa-check"></i>
              Aceptar
            </button>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.invites { padding: 56px 0; background: linear-gradient(180deg, lighten($BAKANO-LIGHT, 4%) 0%, $BAKANO-LIGHT 100%); }
.container { max-width: 820px; margin: 0 auto; padding: 0 20px; }
.header h1 { margin: 0; font-size: 26px; font-weight: 800; color: $BAKANO-DARK; }
.header p { color: lighten($BAKANO-DARK, 35%); }
.loading { color: $BAKANO-DARK; }
.empty { background: #fff; border: 1px solid rgba($BAKANO-PURPLE, 0.1); border-radius: 16px; padding: 24px; text-align: center; }
.empty .icon { font-size: 2rem; color: $BAKANO-PINK; }
.list { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.75rem; }
.item { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; background: #fff; border-radius: 12px; padding: 1rem; border: 1px solid rgba($BAKANO-PURPLE, 0.12); }
.name { margin: 0; font-size: 1.125rem; font-weight: 700; color: $BAKANO-DARK; }
.meta { margin: 0.25rem 0 0; color: lighten($BAKANO-DARK, 35%); }
.btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1rem; border-radius: 10px; border: none; cursor: pointer; font-weight: 700; }
.btn-primary { background: $BAKANO-PINK; color: #fff; }
.btn-primary:hover { background: darken($BAKANO-PINK, 5%); }

@media (max-width: 560px) {
  .item { flex-direction: column; align-items: flex-start; }
  .btn { width: 100%; justify-content: center; }
}
</style>