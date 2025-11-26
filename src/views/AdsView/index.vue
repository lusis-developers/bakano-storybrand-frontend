<script setup lang="ts">
import AdsTopVue from './AdsTopVue.vue'
</script>

<template>
  <div class="ads-view">
    <header class="ads-header">
      <h1>Anuncios</h1>
      <p class="ads-subtitle">Explora anuncios y rendimiento</p>
    </header>
    <section class="ads-section">
      <AdsTopVue />
    </section>
  </div>
</template>


<style lang="scss" scoped>
.ads-view {
  background-color: red;
}
</style>