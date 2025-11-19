<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authService } from '@/services/auth.service'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const token = ref<string>(String(route.params.token || ''))
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)
const isSubmitting = ref(false)
const error = ref<string | null>(null)

function validate(): boolean {
  error.value = null
  const pwd = password.value
  const conf = confirmPassword.value
  if (!pwd || !conf) {
    error.value = 'Completa ambos campos'
    return false
  }
  if (pwd.length < 8) {
    error.value = 'La contraseña debe tener al menos 8 caracteres'
    return false
  }
  const hasUpper = /[A-Z]/.test(pwd)
  const hasLower = /[a-z]/.test(pwd)
  const hasNumber = /\d/.test(pwd)
  if (!(hasUpper && hasLower && hasNumber)) {
    error.value = 'Usa mayúscula, minúscula y número'
    return false
  }
  if (pwd !== conf) {
    error.value = 'Las contraseñas no coinciden'
    return false
  }
  return true
}

async function submit() {
  if (!validate()) return
  isSubmitting.value = true
  try {
    await authService.resetPassword({ token: token.value, password: password.value, confirmPassword: confirmPassword.value })
    toast.triggerToast('Contraseña creada correctamente', 'success')
    const businessId = String(route.query.businessId || route.query.b || '')
    if (businessId) {
      router.push({ path: '/login', query: { next: `/accept-invite/${businessId}` } })
    } else {
      router.push('/login')
    }
  } catch (e: any) {
    error.value = e?.message || 'No se pudo crear la contraseña'
    toast.triggerToast(error.value || 'Error', 'error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="create-password">
    <div class="container">
      <div class="card">
        <header class="card__header">
          <h1 class="card__title">Crear contraseña</h1>
          <p class="card__subtitle">Protege tu cuenta para continuar con la invitación</p>
        </header>

        <div class="form">
          <div class="form__group">
            <label class="form__label">Nueva contraseña</label>
            <div class="input-wrapper">
              <input :type="showPassword ? 'text' : 'password'" v-model="password" class="input" placeholder="••••••••" />
              <button type="button" class="toggle" @click="showPassword = !showPassword" :aria-label="showPassword ? 'Ocultar' : 'Mostrar'"><i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i></button>
            </div>
          </div>

          <div class="form__group">
            <label class="form__label">Confirmar contraseña</label>
            <div class="input-wrapper">
              <input :type="showConfirm ? 'text' : 'password'" v-model="confirmPassword" class="input" placeholder="••••••••" />
              <button type="button" class="toggle" @click="showConfirm = !showConfirm" :aria-label="showConfirm ? 'Ocultar' : 'Mostrar'"><i :class="showConfirm ? 'fas fa-eye-slash' : 'fas fa-eye'"></i></button>
            </div>
          </div>

          <p v-if="error" class="form__error">{{ error }}</p>

          <button class="btn btn-primary" :disabled="isSubmitting" @click="submit">
            <span v-if="isSubmitting" class="spinner"></span>
            Crear contraseña
          </button>
        </div>

        <div class="tips">
          <p><i class="fas fa-shield-halved"></i> Usa al menos 8 caracteres, mayúsculas, minúsculas y números.</p>
          <p><i class="fas fa-lock"></i> Después iniciarás sesión para aceptar la invitación.</p>
        </div>
      </div>
    </div>
  </section>
  
</template>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.create-password { padding: 56px 0; background: linear-gradient(180deg, lighten($BAKANO-LIGHT, 4%) 0%, $BAKANO-LIGHT 100%); }
.container { max-width: 560px; margin: 0 auto; padding: 0 20px; }
.card { background: #fff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); padding: 24px; }
.card__header { text-align: center; margin-bottom: 16px; }
.card__title { margin: 0; font-size: 26px; font-weight: 800; color: $BAKANO-DARK; }
.card__subtitle { color: lighten($BAKANO-DARK, 35%); }

.form { display: grid; gap: 1rem; }
.form__group { display: grid; gap: 0.5rem; }
.form__label { font-weight: 600; color: $BAKANO-DARK; }
.input-wrapper { position: relative; }
.input { width: 100%; padding: 0.75rem 2.5rem 0.75rem 0.75rem; border: 1px solid lighten($BAKANO-DARK, 80%); border-radius: 10px; font-size: 0.95rem; outline: none; transition: box-shadow 0.2s ease; }
.input:focus { box-shadow: 0 0 0 3px rgba($BAKANO-PURPLE, 0.1); border-color: $BAKANO-PURPLE; }
.toggle { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: transparent; border: none; color: lighten($BAKANO-DARK, 25%); cursor: pointer; padding: 6px; border-radius: 8px; }
.toggle:hover { background: $BAKANO-LIGHT; }
.form__error { color: darken($BAKANO-PINK, 10%); background: rgba($BAKANO-PINK, 0.08); border: 1px solid rgba($BAKANO-PINK, 0.3); padding: 12px; border-radius: 10px; }

.btn { padding: 0.75rem 1rem; border-radius: 10px; border: none; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; }
.btn-primary { background: $BAKANO-PINK; color: #fff; }
.btn-primary:hover { background: darken($BAKANO-PINK, 5%); }
.spinner { width: 1rem; height: 1rem; border-radius: 50%; border: 2px solid rgba(#fff, 0.6); border-top-color: #fff; animation: spin 0.9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.tips { margin-top: 1rem; color: lighten($BAKANO-DARK, 35%); font-size: 0.9rem; display: grid; gap: 0.25rem; }
.tips i { color: $BAKANO-PINK; }

@media (max-width: 480px) {
  .card { padding: 20px; }
}
</style>