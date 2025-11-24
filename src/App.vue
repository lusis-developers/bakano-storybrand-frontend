<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import Header from './components/globals/TheHeader.vue'
import Footer from './components/globals/TheFooter.vue'
import ConfirmationDialog from './components/shared/ConfirmationDialog.vue'
import ToastNotification from './components/shared/ToastNotification.vue'
import SlowConnectionGlobalWarning from './components/shared/SlowConnectionGlobalWarning.vue'
import UserSidebar from '@/components/user/UserSidebar.vue'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>

<template>
  <Header />
  <main class="main-content" :class="{ 'main-content--admin': isAuthenticated }">
    <div v-if="isAuthenticated" class="admin-layout">
      <UserSidebar />
      <section class="admin-layout__content">
        <RouterView />
      </section>
    </div>
    <RouterView v-else />
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
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 0;
  align-items: start;
}

.admin-layout__content {
  padding: 16px;
}

@media (max-width: 920px) {
  .admin-layout {
    grid-template-columns: 200px 1fr;
  }
}

@media (max-width: 768px) {
  .admin-layout {
    grid-template-columns: 1fr;
  }

  .admin-layout__content {
    padding: 12px;
  }
}
</style>
