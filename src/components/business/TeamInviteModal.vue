<script setup lang="ts">
import { ref } from 'vue'
import Modal from '@/components/shared/Modal.vue'
import { useBusinessStore } from '@/stores/business.store'
import type { TeamRole } from '@/types/business.types'
import { useToast } from '@/composables/useToast'

interface Props {
  visible: boolean
  businessId: string
}

interface Emits {
  (e: 'close'): void
  (e: 'invited'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const businessStore = useBusinessStore()
const { triggerToast } = useToast()

const email = ref('')
const role = ref<TeamRole>('collaborator')
const isSubmitting = ref(false)

const roles: TeamRole[] = ['owner', 'admin', 'collaborator', 'viewer']

const submit = async () => {
  if (!email.value.trim()) {
    triggerToast('Ingresa un email válido', 'error')
    return
  }
  isSubmitting.value = true
  try {
    const updated = await businessStore.inviteTeamMember(props.businessId, email.value.trim(), role.value)
    if (updated) {
      triggerToast('Invitación enviada', 'success')
      emit('invited')
      emit('close')
      email.value = ''
      role.value = 'collaborator'
    }
  } catch (e: any) {
    triggerToast(e?.message || 'Error al invitar', 'error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Modal :visible="visible" title="Invitar al equipo" width="520px" @close="emit('close')">
    <div class="form">
      <label class="label">Email del invitado</label>
      <div class="input-wrapper">
        <i class="fas fa-envelope"></i>
        <input v-model="email" type="email" class="input" placeholder="correo@dominio.com" />
      </div>

      <label class="label">Rol</label>
      <div class="select-wrapper">
        <i class="fas fa-user-tag"></i>
        <select v-model="role" class="select">
          <option v-for="r in roles" :key="r" :value="r">
            {{ r.charAt(0).toUpperCase() + r.slice(1) }}
          </option>
        </select>
      </div>
    </div>

    <template #footer>
      <button class="btn btn-outline" type="button" @click="emit('close')" :disabled="isSubmitting">
        Cancelar
      </button>
      <button class="btn btn-primary" type="button" @click="submit" :disabled="isSubmitting">
        <i class="fas fa-paper-plane"></i>
        Enviar invitación
      </button>
    </template>
  </Modal>
  
</template>

<style lang="scss" scoped>
.form {
  display: grid;
  gap: 0.75rem;
}

.label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: $BAKANO-DARK;
}

.input-wrapper,
.select-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid lighten($BAKANO-DARK, 86%);
  background: #fff;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
}

.input,
.select {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.875rem;
}

.input::placeholder { color: lighten($BAKANO-DARK, 40%); }

.btn {
  padding: 0.625rem 1rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.8125rem;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: $BAKANO-PINK;
  color: #fff;
}

.btn-outline {
  background: transparent;
  color: $BAKANO-DARK;
  border: 1px solid lighten($BAKANO-DARK, 80%);
}

@media (max-width: 480px) {
  .input,
  .select { font-size: 0.8125rem; }
}
</style>