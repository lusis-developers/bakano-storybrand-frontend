<script setup lang="ts">
import type {
  IIntegrationPage,
  IIntegrationRecord,
  IFacebookPageInfo,
} from '@/types/integration.types'

const props = defineProps<{
  hasFacebookIntegrationRecord: boolean
  facebookConnectedIntegration: IIntegrationRecord | null
  userPages: IIntegrationPage[]
  isSDKLoading: boolean
  isConnecting: boolean
  connectionError: string | null
  successMessage: string | null
  savingPageId: string | null
  isRelinkingFacebook: boolean
  connectedFacebookPage: IFacebookPageInfo | null
  isFacebookPending: boolean
  sanitizeUrl: (url?: string) => string
  onConnectFacebook: () => void
  onSelectPage: (page: IIntegrationPage) => void
  onStartRelinkingFacebook: () => void
}>()
</script>

<template>
  <!-- Paso 1: Conectar Facebook (solo si no hay integración previa) -->
  <div
    class="step"
    v-if="!hasFacebookIntegrationRecord && !facebookConnectedIntegration && !userPages.length"
  >
    <span class="step-badge"><i class="fa-solid fa-hashtag"></i> Paso 1</span>
    <h4><i class="fab fa-facebook"></i> Conectar Facebook</h4>
    <p class="helper">
      Usa permisos profesionales para obtener tus páginas de Facebook y publicar de forma segura.
    </p>

    <div class="feedback" v-if="connectionError || successMessage">
      <p v-if="connectionError" class="error"><i class="fa-solid fa-circle-exclamation"></i> {{ connectionError }}</p>
      <p v-else-if="successMessage" class="success"><i class="fa-solid fa-circle-check"></i> {{ successMessage }}</p>
    </div>

    <button
      type="button"
      class="btn btn-primary"
      :disabled="isSDKLoading || isConnecting"
      @click="onConnectFacebook"
    >
      <span v-if="isConnecting || isSDKLoading"><i class="fa-solid fa-spinner fa-spin"></i> Conectando...</span>
      <span v-else><i class="fab fa-facebook"></i> Conectar</span>
    </button>
  </div>

  <!-- Paso 1 (post conexión o pendiente): Seleccionar una página -->
  <div class="step" v-else>
    <span class="step-badge"><i class="fa-solid fa-hashtag"></i> Paso 1</span>
    <h4>
      <i class="fab fa-facebook"></i>
      {{ facebookConnectedIntegration && !isRelinkingFacebook ? 'Página de Facebook conectada' : 'Selecciona una página de Facebook' }}
    </h4>
    <p class="helper">
      {{ facebookConnectedIntegration && !isRelinkingFacebook
        ? 'Ya tienes una página conectada. Si quieres cambiarla, puedes revincular.'
        : 'Elige la página que deseas vincular a tu negocio.'
      }}
    </p>

    <div class="feedback" v-if="connectionError || successMessage">
      <p v-if="connectionError" class="error"><i class="fa-solid fa-circle-exclamation"></i> {{ connectionError }}</p>
      <p v-else-if="successMessage" class="success"><i class="fa-solid fa-circle-check"></i> {{ successMessage }}</p>
    </div>

    <div class="pages-box" v-if="!facebookConnectedIntegration || isRelinkingFacebook">
      <template v-if="userPages.length">
        <strong><i class="fa-solid fa-list"></i> Páginas encontradas</strong>
        <ul>
          <li v-for="p in userPages" :key="p.id" class="page-item">
            <div class="left">
              <img v-if="p.pictureUrl" :src="sanitizeUrl(p.pictureUrl)" alt="Logo de la página" class="avatar" />
              <i v-else class="fa-solid fa-flag placeholder"></i>
              <div class="info">
                <span class="page-name">{{ p.name }}</span>
                <span v-if="p.category" class="category">{{ p.category }}</span>
                <span class="page-id">ID: {{ p.id }}</span>
              </div>
            </div>
            <div class="actions">
              <button
                type="button"
                class="btn btn-primary btn-connect"
                :disabled="savingPageId === p.id"
                @click="onSelectPage(p)"
              >
                <template v-if="savingPageId === p.id">
                  <i class="fa-solid fa-spinner fa-spin"></i>
                  <span>Conectando...</span>
                </template>
                <template v-else>
                  <i class="fa-solid fa-link"></i>
                  <span>Conectar</span>
                </template>
              </button>
            </div>
          </li>
        </ul>
      </template>
      <template v-else>
        <div class="empty-state">
          <p>
            <i class="fa-solid fa-circle-info"></i>
            <span>
              {{ isFacebookPending ? 'Tu integración de Facebook está pendiente de seleccionar página.' : 'Aún no hemos cargado tus páginas de Facebook.' }}
            </span>
          </p>
          <button type="button" class="btn btn-secondary" :disabled="isSDKLoading || isConnecting" @click="onConnectFacebook">
            <i class="fa-solid fa-rotate"></i>
            <span>{{ isFacebookPending ? 'Cargar páginas' : 'Obtener páginas' }}</span>
          </button>
        </div>
      </template>
    </div>

    <!-- Resumen de la página conectada -->
    <div v-else class="connected-summary">
      <div class="summary-box">
        <div class="left">
          <img
            v-if="connectedFacebookPage?.picture?.size150 || connectedFacebookPage?.picture?.normal || connectedFacebookPage?.picture?.url"
            :src="sanitizeUrl(connectedFacebookPage?.picture?.size150 || connectedFacebookPage?.picture?.normal || connectedFacebookPage?.picture?.url)"
            alt="Logo de la página conectada"
            class="avatar"
          />
          <i v-else class="fa-solid fa-flag placeholder"></i>
          <div class="info">
            <p class="success">
              <i class="fa-solid fa-circle-check"></i>
              <span>
                Facebook conectado a: <strong>{{ facebookConnectedIntegration?.metadata?.pageName }}</strong>
                <span v-if="facebookConnectedIntegration?.metadata?.pageId" class="page-id">(ID: {{ facebookConnectedIntegration?.metadata?.pageId }})</span>
                <span v-if="typeof facebookConnectedIntegration?.metadata?.followersCount === 'number'" class="page-id">
                  · Seguidores: {{ facebookConnectedIntegration?.metadata?.followersCount }}
                </span>
              </span>
            </p>
          </div>
        </div>
        <div class="actions">
          <button
            type="button"
            class="btn btn-secondary"
            :disabled="isSDKLoading || isConnecting"
            @click="onStartRelinkingFacebook"
          >
            <i class="fa-solid fa-rotate"></i>
            <span>Revincular página</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped src="./integrations.scss"></style>