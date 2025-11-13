<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
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

// Computed para el texto del botón
const buttonText = computed(() => {
  if (isSubmitting.value) {
    return 'Iniciando sesión...'
  }
  if (authStore.loading) {
    return 'Verificando perfil...'
  }
  return 'Iniciar sesión'
})
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
            {{ buttonText }}
          </button>
        </form>

        <!-- Divider -->
        <div class="divider">
          <span class="divider-text">o</span>
        </div>

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
@use 'sass:color';
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
    color: color.adjust($BAKANO-PINK, $lightness: -10%);
    text-decoration: underline;
  }

  &:focus {
    outline: 2px solid $BAKANO-PINK;
    outline-offset: 2px;
    border-radius: 2px;
  }
}

.submit-button {
  background: linear-gradient(135deg, $BAKANO-PINK 0%, color.adjust($BAKANO-PINK, $lightness: -10%) 100%);
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
    background: linear-gradient(135deg, color.adjust($BAKANO-PINK, $lightness: -10%) 0%, color.adjust($BAKANO-PINK, $lightness: -20%) 100%);
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