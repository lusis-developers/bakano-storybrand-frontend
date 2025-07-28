<script setup lang="ts">
import Header from './components/globals/TheHeader.vue'
import Footer from './components/globals/TheFooter.vue'
import ConfirmationDialog from './components/shared/ConfirmationDialog.vue';
import ToastNotification from './components/shared/ToastNotification.vue';
</script>

<template>
  <Header />
  <main class="main-content">
    <RouterView />
  </main>
  <ConfirmationDialog/>
  <ToastNotification/>
  <Footer />
</template>

<style lang="scss">

.main-content {
  margin-top: 56px;
  min-height: 100vh;
}
</style>

