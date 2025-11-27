<script setup lang="ts">
import AdsTopVue from './AdsTopVue.vue'
</script>

<template>
  <div class="ads-view">
    <header class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1>Anuncios</h1>
          <p class="subtitle">Explora anuncios y rendimiento</p>
        </div>
      </div>
    </header>
    <section class="ads-section">
      <AdsTopVue />
    </section>
  </div>
</template>


<style lang="scss" scoped>
.ads-view {
  min-height: 100vh;
  padding: 1rem;
  max-width: 1440px;
  margin: 0 auto;
}

.page-header {
  background: $white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.header-left {
  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: $BAKANO-DARK;
    margin: 0.5rem 0 0.25rem 0;
  }

  .subtitle {
    color: rgba($BAKANO-DARK, 0.6);
    margin: 0;
    font-size: 1rem;
  }
}

.ads-section {
  background: $white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .ads-view {
    padding: 0.75rem;
  }

  .page-header {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
}
</style>
