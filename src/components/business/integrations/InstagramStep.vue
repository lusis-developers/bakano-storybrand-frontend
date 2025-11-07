<script setup lang="ts">
import type {
  IIntegrationRecord,
  IInstagramLinkedAccount,
  IInstagramProfile,
} from '@/types/integration.types'

const props = defineProps<{
  facebookConnectedIntegration: IIntegrationRecord | null
  igIsConnectedFromStore: boolean
  connectedInstagram: IInstagramProfile | null
  isRelinkingInstagram: boolean
  isConnectingInstagram: boolean
  instagramErrorMessage: string | null
  instagramSuccessMessage: string | null
  instagramAccounts: IInstagramLinkedAccount[]
  suggestedInstagramAccounts: IInstagramLinkedAccount[]
  otherInstagramAccounts: IInstagramLinkedAccount[]
  savingInstagramId: string | null
  sanitizeUrl: (url?: string) => string
  onConnectInstagramFlow: () => void
  onSelectInstagramAccount: (acc: IInstagramLinkedAccount) => void
  onStartRelinkingInstagram: () => void
}>()
</script>

<template>
  <!-- Paso 2: Conectar Instagram -->
  <div class="step step-ig" v-if="facebookConnectedIntegration || igIsConnectedFromStore">
    <span class="step-badge"><i class="fa-solid fa-hashtag"></i> Paso 2</span>
    <h4><i class="fab fa-instagram"></i> Conectar Instagram</h4>
    <p class="helper">
      Conecta tu cuenta de Instagram para habilitar análisis y publicaciones.
    </p>

    <div class="feedback" v-if="instagramErrorMessage || instagramSuccessMessage">
      <p v-if="instagramErrorMessage" class="error"><i class="fa-solid fa-circle-exclamation"></i> {{ instagramErrorMessage }}</p>
      <p v-else-if="instagramSuccessMessage" class="success"><i class="fa-solid fa-circle-check"></i> {{ instagramSuccessMessage }}</p>
    </div>

    <!-- Resumen de Instagram conectado -->
    <div v-if="connectedInstagram && !isRelinkingInstagram" class="connected-summary">
      <div class="summary-box">
        <div class="left">
          <img
            v-if="connectedInstagram?.profilePictureUrl"
            :src="sanitizeUrl(connectedInstagram?.profilePictureUrl)"
            alt="Avatar de la cuenta de Instagram"
            class="avatar"
          />
          <i v-else class="fa-brands fa-instagram placeholder"></i>
          <div class="info">
            <p class="success">
              <i class="fa-solid fa-circle-check"></i>
              <span>
                Instagram conectado: <strong>@{{ connectedInstagram?.username }}</strong>
                <span v-if="typeof connectedInstagram?.followersCount === 'number'" class="page-id">
                  · Seguidores: {{ connectedInstagram?.followersCount }}
                </span>
              </span>
            </p>
          </div>
        </div>
        <div class="actions">
          <button
            type="button"
            class="btn btn-secondary"
            :disabled="isConnectingInstagram"
            @click="onStartRelinkingInstagram"
          >
            <i class="fa-solid fa-rotate"></i>
            <span>Revincular cuenta</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Si aún no cargamos cuentas de IG (incl. revincular), mostrar botón para traerlas -->
    <div v-else-if="!instagramAccounts.length">
      <button
        type="button"
        class="btn btn-primary"
        :disabled="isConnectingInstagram"
        @click="onConnectInstagramFlow"
      >
        <span v-if="isConnectingInstagram"><i class="fa-solid fa-spinner fa-spin"></i> Conectando Instagram...</span>
        <span v-else><i class="fab fa-instagram"></i> Conectar Instagram</span>
      </button>
    </div>

    <!-- Listado de cuentas de Instagram: Sugerido y Otros -->
    <div class="pages-box" v-else>
      <!-- Sugerido (si hay página de FB conectada que coincida con alguna cuenta) -->
      <template v-if="suggestedInstagramAccounts.length">
        <strong>
          <i class="fa-solid fa-thumbtack"></i>
          Sugerido para la página conectada
          <span class="count">({{ suggestedInstagramAccounts.length }})</span>
        </strong>
        <ul>
          <li v-for="acc in suggestedInstagramAccounts" :key="acc.instagramAccountId" class="page-item">
            <div class="left">
              <img
                v-if="acc.instagramProfilePictureUrl"
                :src="sanitizeUrl(acc.instagramProfilePictureUrl)"
                alt="Avatar Instagram"
                class="avatar"
              />
              <i v-else class="fa-brands fa-instagram placeholder"></i>
              <div class="info">
                <span class="page-name">@{{ acc.instagramUsername }}</span>
                <span class="category">{{ acc.pageName }}</span>
                <span v-if="typeof acc.followersCount === 'number'" class="page-id">Seguidores: {{ acc.followersCount }}</span>
              </div>
            </div>
            <div class="actions">
              <button
                type="button"
                class="btn btn-primary btn-connect"
                :disabled="savingInstagramId === acc.instagramAccountId"
                @click="onSelectInstagramAccount(acc)"
              >
                <template v-if="savingInstagramId === acc.instagramAccountId">
                  <i class="fa-solid fa-spinner fa-spin"></i>
                  <span>Vinculando...</span>
                </template>
                <template v-else>
                  <i class="fa-solid fa-link"></i>
                  <span>Vincular</span>
                </template>
              </button>
            </div>
          </li>
        </ul>
      </template>

      <!-- Otras cuentas disponibles (si no es la sugerida o si no hay sugeridas) -->
      <strong>
        <i class="fa-solid fa-list"></i>
        <template v-if="suggestedInstagramAccounts.length">Otras cuentas disponibles</template>
        <template v-else>Cuentas de Instagram encontradas</template>
        <span class="count">
          (
          {{ (suggestedInstagramAccounts.length ? otherInstagramAccounts.length : instagramAccounts.length) }}
          )
        </span>
      </strong>
      <ul>
        <li
          v-for="acc in (suggestedInstagramAccounts.length ? otherInstagramAccounts : instagramAccounts)"
          :key="acc.instagramAccountId"
          class="page-item"
        >
          <div class="left">
            <img
              v-if="acc.instagramProfilePictureUrl"
              :src="sanitizeUrl(acc.instagramProfilePictureUrl)"
              alt="Avatar Instagram"
              class="avatar"
            />
            <i v-else class="fa-brands fa-instagram placeholder"></i>
            <div class="info">
              <span class="page-name">@{{ acc.instagramUsername }}</span>
              <span class="category">{{ acc.pageName }}</span>
              <span v-if="typeof acc.followersCount === 'number'" class="page-id">Seguidores: {{ acc.followersCount }}</span>
            </div>
          </div>
          <div class="actions">
            <button
              type="button"
              class="btn btn-primary btn-connect"
              :disabled="savingInstagramId === acc.instagramAccountId"
              @click="onSelectInstagramAccount(acc)"
            >
              <template v-if="savingInstagramId === acc.instagramAccountId">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Vinculando...</span>
              </template>
              <template v-else>
                <i class="fa-solid fa-link"></i>
                <span>Vincular</span>
              </template>
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped src="./integrations.scss"></style>