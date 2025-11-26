<script setup lang="ts">
const props = defineProps<{
  facebookConnectedIntegration: any | null
  adAccounts: Array<{ id: string; account_id: string; name?: string; currency?: string; business?: { id: string; name: string } }>
  selectedAdAccountId: string | null
  isLoadingAdAccounts: boolean
  isSavingAdAccount: boolean
  errorMessage: string | null
  successMessage: string | null
  onLoadAdAccounts: () => void
  onSelectAdAccount: (acc: { id: string; account_id: string; name?: string }) => void
}>()
</script>

<template>
  <div class="step" v-if="facebookConnectedIntegration">
    <span class="step-badge"><i class="fa-solid fa-hashtag"></i> Paso 3</span>
    <h4><i class="fa-solid fa-bullhorn"></i> Seleccionar Cuenta Publicitaria</h4>
    <p class="helper">Elige la cuenta publicitaria donde gestionaremos tus campañas.</p>

    <div class="feedback" v-if="errorMessage || successMessage">
      <p v-if="errorMessage" class="error"><i class="fa-solid fa-circle-exclamation"></i> {{ errorMessage }}</p>
      <p v-else-if="successMessage" class="success"><i class="fa-solid fa-circle-check"></i> {{ successMessage }}</p>
    </div>

    <div v-if="selectedAdAccountId && !isSavingAdAccount" class="connected-summary">
      <div class="summary-box">
        <div class="left">
          <i class="fa-solid fa-rectangle-ad placeholder"></i>
          <div class="info">
            <p class="success">
              <i class="fa-solid fa-circle-check"></i>
              <span>
                Cuenta publicitaria seleccionada: <strong>{{ selectedAdAccountId }}</strong>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!adAccounts.length">
      <button type="button" class="btn btn-primary" :disabled="isLoadingAdAccounts" @click="onLoadAdAccounts">
        <span v-if="isLoadingAdAccounts"><i class="fa-solid fa-spinner fa-spin"></i> Cargando cuentas...</span>
        <span v-else><i class="fa-solid fa-bullhorn"></i> Obtener cuentas publicitarias</span>
      </button>
    </div>

    <div class="pages-box" v-else>
      <strong>
        <i class="fa-solid fa-list"></i>
        Cuentas publicitarias encontradas
        <span class="count">({{ adAccounts.length }})</span>
      </strong>
      <ul>
        <li v-for="acc in adAccounts" :key="acc.id" class="page-item">
          <div class="left">
            <i class="fa-solid fa-rectangle-ad placeholder"></i>
            <div class="info">
              <span class="page-name">{{ acc.name || acc.id }}</span>
              <span class="category">ID: {{ acc.account_id }}</span>
              <span v-if="acc.business?.name" class="page-id">Business: {{ acc.business.name }}</span>
            </div>
          </div>
          <div class="actions">
            <button type="button" class="btn btn-primary btn-connect" :disabled="isSavingAdAccount" @click="onSelectAdAccount(acc)">
              <template v-if="isSavingAdAccount">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Guardando...</span>
              </template>
              <template v-else>
                <i class="fa-solid fa-link"></i>
                <span>Seleccionar</span>
              </template>
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped src="./integrations.scss"></style>
