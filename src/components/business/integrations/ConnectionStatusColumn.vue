<script setup lang="ts">
import type { IIntegrationRecord } from '@/types/integration.types'

const props = defineProps<{
  hasFacebookIntegrationRecord: boolean
  facebookConnectedIntegration: IIntegrationRecord | null
  isFacebookPending: boolean
  igConnected: boolean
}>()
</script>

<template>
  <div class="status-column">
    <h5><i class="fa-solid fa-circle-nodes"></i> Estado de la Conexión</h5>
    <ul class="status-list">
      <li :class="props.hasFacebookIntegrationRecord ? (props.facebookConnectedIntegration ? 'connected' : (props.isFacebookPending ? 'pending' : 'disconnected')) : 'disconnected'">
        <i :class="props.facebookConnectedIntegration ? 'fa-solid fa-check-circle' : (props.isFacebookPending ? 'fa-solid fa-hourglass-half' : 'fa-regular fa-circle-xmark')"></i>
        <div>
          <span>Facebook</span>
          <small>{{ props.facebookConnectedIntegration ? 'Conectado' : (props.isFacebookPending ? 'Pendiente' : 'No conectado') }}</small>
        </div>
      </li>
      <li :class="props.igConnected ? 'connected' : 'disconnected'">
        <i :class="props.igConnected ? 'fa-solid fa-check-circle' : 'fa-regular fa-circle-xmark'"></i>
        <div>
          <span>Instagram</span>
          <small>{{ props.igConnected ? 'Conectado' : 'No conectado' }}</small>
        </div>
      </li>
    </ul>
    <p v-if="!props.facebookConnectedIntegration || !props.igConnected" class="helper">
      Consejo: si al intentar conectar no se abren ventanas de autorización, desactiva bloqueadores de contenido para este sitio o prueba desde otro navegador.
    </p>
  </div>
</template>

<style lang="scss" scoped src="./integrations.scss"></style>