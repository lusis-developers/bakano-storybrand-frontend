<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import Header from './components/globals/TheHeader.vue'
import Footer from './components/globals/TheFooter.vue'
import ConfirmationDialog from './components/shared/ConfirmationDialog.vue'
import ToastNotification from './components/shared/ToastNotification.vue'
import SlowConnectionGlobalWarning from './components/shared/SlowConnectionGlobalWarning.vue'
import UserSidebar from '@/components/user/UserSidebar.vue'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isMobileSidebarOpen = ref(false)
const router = useRouter()
router.afterEach(() => { isMobileSidebarOpen.value = false })
</script>

<template>
  <Header />
  <main class="main-content" :class="{ 'main-content--admin': isAuthenticated }">
    <div v-if="isAuthenticated" class="admin-layout">
      <UserSidebar :mobileOpen="isMobileSidebarOpen" @close-mobile="isMobileSidebarOpen = false" />
      <section class="admin-layout__content">
        <RouterView />
      </section>
    </div>
    <RouterView v-else />
    <button v-if="isAuthenticated" class="mobile-sidebar-toggle" @click="isMobileSidebarOpen = true">
      <i class="fas fa-bars"></i>
    </button>
  </main>
  <ConfirmationDialog />
  <ToastNotification />
  <SlowConnectionGlobalWarning />
  <Footer />
</template>

<style lang="scss">
.main-content {
  margin-top: 56px;
  min-height: 100vh;
  background: $BAKANO-LIGHT;
}

.main-content--admin {
  background: linear-gradient(180deg, lighten($BAKANO-LIGHT, 2%) 0%, $BAKANO-LIGHT 100%);
}

.admin-layout {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.admin-layout__content {
  padding: 16px;
  flex: 1 1 auto;
  min-width: 0;
}

@media (max-width: 920px) {
  .admin-layout {
    flex-direction: row;
  }
}

@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }

  .admin-layout__content {
    padding: 12px;
  }
}

.mobile-sidebar-toggle {
  position: fixed;
  bottom: 16px;
  left: 12px;
  z-index: 950;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid lighten($BAKANO-PURPLE, 40%);
  background: #fff;
  color: $BAKANO-PURPLE;
  display: none;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 16px rgba($BAKANO-DARK, 0.12);
}

@media (max-width: 768px) {
  .mobile-sidebar-toggle {
    display: inline-flex;
  }
}
</style>
