<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBusinessStore } from '@/stores/business.store'
import { useAuthStore } from '@/stores/auth.store'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const businessStore = useBusinessStore()
const authStore = useAuthStore()

const status = ref<'idle' | 'processing' | 'success' | 'error'>('idle')
const message = ref('')

onMounted(async () => {
  const businessId = String(route.params.businessId || '')
  if (!businessId) {
    status.value = 'error'
    message.value = 'Falta el ID del negocio en la invitación'
    return
  }
  if (!authStore.isAuthenticated) {
    router.push({ path: '/login', query: { next: `/accept-invite/${businessId}` } })
    return
  }
  try {
    status.value = 'processing'
    const updated = await businessStore.acceptTeamInvite(businessId)
    if (updated) {
      status.value = 'success'
      message.value = 'Invitación aceptada. ¡Bienvenido al equipo!'
      toast.triggerToast(message.value, 'success')
      router.push('/business')
    } else {
      throw new Error('No se pudo aceptar la invitación')
    }
  } catch (e: any) {
    status.value = 'error'
    message.value = e?.message || 'Error al aceptar invitación'
    toast.triggerToast(message.value, 'error')
  }
})
</script>

<template>
  <section class="accept-invite">
    <div class="container">
      <div class="card">
        <div class="state" :class="status">
          <div class="icon">
            <i v-if="status==='processing'" class="fas fa-spinner"></i>
            <i v-else-if="status==='success'" class="fas fa-check-circle"></i>
            <i v-else-if="status==='error'" class="fas fa-exclamation-triangle"></i>
            <i v-else class="fas fa-user-plus"></i>
          </div>
          <h1 class="title">Aceptar invitación</h1>
          <p class="desc">{{ message || 'Procesando invitación...' }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.accept-invite { padding: 56px 0; background: linear-gradient(180deg, lighten($BAKANO-LIGHT, 4%) 0%, $BAKANO-LIGHT 100%); }
.container { max-width: 560px; margin: 0 auto; padding: 0 20px; }
.card { background: #fff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); padding: 24px; text-align: center; }
.icon { font-size: 2rem; color: $BAKANO-PINK; margin-bottom: 0.5rem; }
.title { margin: 0; font-size: 24px; font-weight: 800; color: $BAKANO-DARK; }
.desc { color: lighten($BAKANO-DARK, 35%); margin-top: 0.5rem; }
.processing .icon { animation: spin 0.9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>