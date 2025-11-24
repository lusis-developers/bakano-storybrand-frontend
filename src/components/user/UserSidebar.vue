<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useBusinessStore } from '@/stores/business.store'
import { useToast } from '@/composables/useToast'

const authStore = useAuthStore()
const businessStore = useBusinessStore()
const { triggerToast } = useToast()

const pendingCount = computed(() => businessStore.pendingInvitationsCount)
const businesses = computed(() => businessStore.businesses)
const currentBusiness = computed(() => businessStore.currentBusiness)
const selectedBusinessId = ref<string>('')
const searchTerm = ref('')
const showBusinessMenu = ref(false)

const filteredBusinesses = computed(() => businesses.value)

const changeBusiness = (id: string) => {
  const found = businesses.value.find((b) => b.id === id || b._id === id)
  if (found) {
    businessStore.setCurrentBusiness(found)
    triggerToast(`Negocio seleccionado: ${found.name}`, 'success')
    selectedBusinessId.value = found.id || found._id
    showBusinessMenu.value = false
  }
}

onMounted(async () => {
  if (businesses.value.length === 0) {
    await businessStore.fetchBusinesses()
  }
  if (!currentBusiness.value && businesses.value.length > 0) {
    await businessStore.ensureCurrentBusiness()
  }
  selectedBusinessId.value = currentBusiness.value?.id || currentBusiness.value?._id || ''
})
</script>

<template>
  <aside class="user-sidebar">
    <div class="user-sidebar__brand">
      <RouterLink :to="authStore.isAuthenticated ? '/dashboard' : '/'" class="user-sidebar__logo">
        <img src="@/assets/logos/bakano-dark-small.png" alt="Bakano" />
      </RouterLink>
    </div>

    <div class="user-sidebar__section">
      <div class="user-sidebar__section-title">Negocios</div>
      <button class="user-sidebar__current user-sidebar__current--button" @click="showBusinessMenu = !showBusinessMenu">
        <img class="user-sidebar__avatar" src="@/assets/logos/bakano-dark-small.png" alt="Logo negocio" />
        <div class="user-sidebar__current-meta">
          <span class="user-sidebar__label">Negocio actual</span>
          <span class="user-sidebar__current-name">{{ currentBusiness?.name || 'Sin selección' }}</span>
        </div>
        <svg class="user-sidebar__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" :class="{ 'is-open': showBusinessMenu }">
          <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div v-if="showBusinessMenu" class="user-sidebar__menu">
        <ul class="user-sidebar__list">
          <li v-for="b in filteredBusinesses" :key="b.id" class="user-sidebar__item" @click="changeBusiness(b.id)">
            <img class="user-sidebar__avatar" src="@/assets/logos/bakano-dark-small.png" alt="Logo negocio" />
            <span class="user-sidebar__item-name">{{ b.name }}</span>
          </li>
        </ul>
      </div>
    </div>

    <nav class="user-sidebar__nav">
      <RouterLink to="/dashboard" class="user-sidebar__link">
        <span class="user-sidebar__icon"><i class="fas fa-chart-line"></i></span>
        <span class="user-sidebar__text">Dashboard</span>
      </RouterLink>
      <RouterLink to="/business" class="user-sidebar__link">
        <span class="user-sidebar__icon"><i class="fas fa-briefcase"></i></span>
        <span class="user-sidebar__text">Negocios</span>
      </RouterLink>
      <RouterLink to="/social/manager" class="user-sidebar__link">
        <span class="user-sidebar__icon"><i class="fas fa-hashtag"></i></span>
        <span class="user-sidebar__text">Social Manager</span>
      </RouterLink>
      <RouterLink to="/advisor" class="user-sidebar__link">
        <span class="user-sidebar__icon"><i class="fas fa-robot"></i></span>
        <span class="user-sidebar__text">Asesor IA</span>
      </RouterLink>
      <RouterLink to="/team/invitations" class="user-sidebar__link">
        <span class="user-sidebar__icon"><i class="fas fa-users"></i></span>
        <span class="user-sidebar__text">Invitaciones</span>
        <span v-if="pendingCount" class="user-sidebar__badge">{{ pendingCount }}</span>
      </RouterLink>
      <RouterLink to="/pricing" class="user-sidebar__link">
        <span class="user-sidebar__icon"><i class="fas fa-tags"></i></span>
        <span class="user-sidebar__text">Precios</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<style scoped lang="scss">
.user-sidebar {
  position: sticky;
  top: 56px;
  align-self: start;
  width: 240px;
  min-height: calc(100vh - 56px);
  background: #fff;
  border-right: 1px solid lighten($BAKANO-DARK, 85%);
  padding: 16px 12px;
}

.user-sidebar__brand {
  padding: 8px 10px;
}

.user-sidebar__logo img {
  width: 110px;
  height: auto;
  display: block;
}

.user-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
}

.user-sidebar__section {
  border: 1px solid lighten($BAKANO-DARK, 85%);
  border-radius: 12px;
  padding: 10px;
  margin-top: 8px;
}

.user-sidebar__section-title {
  font-weight: 700;
  color: $BAKANO-DARK;
  margin-bottom: 6px;
}

.user-sidebar__current {
  display: flex;
  align-items: center;
  gap: 8px;
  color: $BAKANO-DARK;
  font-weight: 600;
  margin-bottom: 8px;
}

.user-sidebar__current--button {
  width: 100%;
  background: none;
  border: 1px solid lighten($BAKANO-DARK, 80%);
  border-radius: 10px;
  padding: 8px 10px;
  cursor: pointer;
  display: grid;
  grid-template-columns: 28px 1fr 16px;
  align-items: center;
}

.user-sidebar__avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid lighten($BAKANO-DARK, 80%);
}

.user-sidebar__current-meta {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-sidebar__label {
  font-size: 12px;
  color: lighten($BAKANO-DARK, 30%);
  font-weight: 600;
}

.user-sidebar__current-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-sidebar__chevron {
  transition: transform 0.2s ease;
  color: $BAKANO-DARK;
}

.user-sidebar__chevron.is-open {
  transform: rotate(180deg);
}

.user-sidebar__menu {
  margin-top: 8px;
  border: 1px solid lighten($BAKANO-DARK, 80%);
  border-radius: 10px;
  background: #fff;
}

.user-sidebar__list {
  list-style: none;
  margin: 0;
  padding: 4px;
}

.user-sidebar__item {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 8px;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
}

.user-sidebar__item:hover {
  background: $overlay-purple;
}

.user-sidebar__item-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-sidebar__link {
  display: grid;
  grid-template-columns: 24px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  color: $BAKANO-DARK;
  text-decoration: none;
  border: 1px solid transparent;
}

.user-sidebar__link:hover {
  background: $overlay-purple;
  color: $BAKANO-PINK;
}

.user-sidebar__link.router-link-active {
  background: $overlay-purple;
  border-color: rgba($BAKANO-PINK, 0.3);
  color: $BAKANO-PINK;
}

.user-sidebar__icon {
  color: $BAKANO-DARK;
}

.user-sidebar__text {
  font-weight: 600;
}

.user-sidebar__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  border-radius: 999px;
  background: $BAKANO-PINK;
  color: #fff;
  font-size: 0.75rem;
  line-height: 1;
  font-weight: 700;
}

@media (max-width: 920px) {
  .user-sidebar {
    width: 200px;
  }
}

@media (max-width: 768px) {
  .user-sidebar {
    display: none;
  }
}
</style>
