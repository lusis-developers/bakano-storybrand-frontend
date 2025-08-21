<script setup lang="ts">
import Header from './components/globals/TheHeader.vue'
import Footer from './components/globals/TheFooter.vue'
import ConfirmationDialog from './components/shared/ConfirmationDialog.vue';
import ToastNotification from './components/shared/ToastNotification.vue';
import SlowConnectionGlobalWarning from './components/shared/SlowConnectionGlobalWarning.vue';
</script>

<template>
  <Header />
  <main class="main-content">
    <RouterView />
  </main>
  <ConfirmationDialog/>
  <ToastNotification/>
  <SlowConnectionGlobalWarning/>
  <Footer />
</template>

<style lang="scss">
.main-content {
  margin-top: 56px;
  min-height: 100vh;
  background: $BAKANO-LIGHT;
}
</style>

