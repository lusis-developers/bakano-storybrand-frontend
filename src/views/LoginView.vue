<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { RouterLink } from 'vue-router'

const authStore = useAuthStore()

// Estado del formulario
const formData = reactive({
  email: '',
  password: ''
})

const showPassword = ref(false)
const isSubmitting = ref(false)
const rememberMe = ref(false)

// Validaciones
const errors = reactive({
  email: '',
  password: ''
})

const validateForm = (): boolean => {
  // Limpiar errores previos
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  let isValid = true

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!formData.email.trim()) {
    errors.email = 'El email es requerido'
    isValid = false
  } else if (!emailRegex.test(formData.email)) {
    errors.email = 'Ingresa un email válido'
    isValid = false
  }

  // Validar contraseña
  if (!formData.password) {
    errors.password = 'La contraseña es requerida'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    await authStore.login({
      email: formData.email.trim(),
      password: formData.password
    })
  } catch (error) {
    // El error ya se maneja en el store
    console.error('Error en login:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-card">
        <!-- Header -->
        <div class="login-header">
          <h1 class="login-title">Bienvenido de vuelta</h1>
          <p class="login-subtitle">
            Inicia sesión en tu cuenta de Bakano
          </p>
        </div>

        <!-- Formulario -->
        <form @submit.prevent="handleSubmit" class="login-form">
          <!-- Campo Email -->
          <div class="form-group">
            <label for="email" class="form-label">Correo electrónico</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              class="form-input"
              :class="{ 'form-input--error': errors.email }"
              placeholder="tu@email.com"
              autocomplete="email"
            />
            <span v-if="errors.email" class="form-error">{{ errors.email }}</span>
          </div>

          <!-- Campo Contraseña -->
          <div class="form-group">
            <label for="password" class="form-label">Contraseña</label>
            <div class="password-input-wrapper">
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ 'form-input--error': errors.password }"
                placeholder="Tu contraseña"
                autocomplete="current-password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="password-toggle"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              >
                <svg v-if="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" fill="none"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="m1 1 22 22" stroke="currentColor" stroke-width="2"/>
                  <path d="M6.71 6.71C4.68 8.1 3 10.5 3 12s1.68 3.9 3.71 5.29" stroke="currentColor" stroke-width="2" fill="none"/>
                  <path d="M17.29 17.29C19.32 15.9 21 13.5 21 12s-1.68-3.9-3.71-5.29" stroke="currentColor" stroke-width="2" fill="none"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
              </button>
            </div>
            <span v-if="errors.password" class="form-error">{{ errors.password }}</span>
          </div>

          <!-- Opciones adicionales -->
          <div class="form-options">
            <label class="checkbox-wrapper">
              <input
                v-model="rememberMe"
                type="checkbox"
                class="checkbox-input"
              />
              <span class="checkbox-custom"></span>
              <span class="checkbox-label">Recordarme</span>
            </label>
            
            <RouterLink to="/forgot-password" class="forgot-link">
              ¿Olvidaste tu contraseña?
            </RouterLink>
          </div>

          <!-- Botón Submit -->
          <button
            type="submit"
            class="submit-button"
            :disabled="isSubmitting || authStore.loading"
          >
            <span v-if="isSubmitting || authStore.loading" class="loading-spinner"></span>
            {{ isSubmitting || authStore.loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
          </button>
        </form>

        <!-- Divider -->
        <div class="divider">
          <span class="divider-text">o</span>
        </div>

        <!-- Social Login (placeholder) -->
        <div class="social-login">
          <button type="button" class="social-button" disabled>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar con Google
          </button>
        </div>

        <!-- Footer -->
        <div class="login-footer">
          <p class="register-link">
            ¿No tienes cuenta?
            <RouterLink to="/register" class="link">Regístrate gratis</RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba($BAKANO-PURPLE, 0.05) 0%, rgba($BAKANO-PINK, 0.05) 100%);
  padding: 1rem;

  @media (max-width: 768px) {
    padding: 0.5rem;
    align-items: flex-start;
    padding-top: 2rem;
  }
}

.login-container {
  width: 100%;
  max-width: 420px;
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 12px;
  }
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: $BAKANO-DARK;
  margin-bottom: 0.5rem;
  font-family: $font-principal;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
}

.login-subtitle {
  color: rgba($BAKANO-DARK, 0.7);
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: $BAKANO-DARK;
  font-size: 0.875rem;
  margin: 0;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 2px solid rgba($BAKANO-PURPLE, 0.2);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: $BAKANO-PINK;
    box-shadow: 0 0 0 3px rgba($BAKANO-PINK, 0.1);
  }

  &--error {
    border-color: #dc2626;

    &:focus {
      border-color: #dc2626;
      box-shadow: 0 0 0 3px rgba(#dc2626, 0.1);
    }
  }

  &::placeholder {
    color: rgba($BAKANO-DARK, 0.4);
  }
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: rgba($BAKANO-DARK, 0.5);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: color 0.2s ease;

  &:hover {
    color: $BAKANO-DARK;
  }

  &:focus {
    outline: 2px solid $BAKANO-PINK;
    outline-offset: 2px;
  }
}

.form-error {
  color: #dc2626;
  font-size: 0.875rem;
  margin: 0;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -0.5rem;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.checkbox-custom {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba($BAKANO-PURPLE, 0.3);
  border-radius: 3px;
  position: relative;
  transition: all 0.2s ease;

  .checkbox-input:checked+& {
    background: $BAKANO-PINK;
    border-color: $BAKANO-PINK;

    &::after {
      content: '';
      position: absolute;
      top: 1px;
      left: 4px;
      width: 4px;
      height: 8px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  }

  .checkbox-input:focus+& {
    box-shadow: 0 0 0 3px rgba($BAKANO-PINK, 0.1);
  }
}

.checkbox-label {
  font-size: 0.875rem;
  color: rgba($BAKANO-DARK, 0.7);
}

.forgot-link {
  color: $BAKANO-PINK;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s ease;

  &:hover {
    color: darken($BAKANO-PINK, 10%);
    text-decoration: underline;
  }

  &:focus {
    outline: 2px solid $BAKANO-PINK;
    outline-offset: 2px;
    border-radius: 2px;
  }
}

.submit-button {
  background: linear-gradient(135deg, $BAKANO-PINK 0%, darken($BAKANO-PINK, 10%) 100%);
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, darken($BAKANO-PINK, 10%) 0%, darken($BAKANO-PINK, 20%) 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba($BAKANO-PINK, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  &:focus {
    outline: 2px solid $BAKANO-PINK;
    outline-offset: 2px;
  }
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.divider {
  position: relative;
  margin: 1.5rem 0;
  text-align: center;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: rgba($BAKANO-PURPLE, 0.2);
  }
}

.divider-text {
  background: white;
  color: rgba($BAKANO-DARK, 0.5);
  padding: 0 1rem;
  font-size: 0.875rem;
}

.social-login {
  margin-bottom: 1.5rem;
}

.social-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 2px solid rgba($BAKANO-PURPLE, 0.2);
  border-radius: 8px;
  background: white;
  color: rgba($BAKANO-DARK, 0.7);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: rgba($BAKANO-PURPLE, 0.3);
    background: rgba($BAKANO-PURPLE, 0.05);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus {
    outline: 2px solid $BAKANO-PINK;
    outline-offset: 2px;
  }
}

.login-footer {
  text-align: center;
}

.register-link {
  color: rgba($BAKANO-DARK, 0.6);
  font-size: 0.875rem;
  margin: 0;
}

.link {
  color: $BAKANO-PINK;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;

  &:hover {
    color: darken($BAKANO-PINK, 10%);
    text-decoration: underline;
  }

  &:focus {
    outline: 2px solid $BAKANO-PINK;
    outline-offset: 2px;
    border-radius: 2px;
  }
}
</style>