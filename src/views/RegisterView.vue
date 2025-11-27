<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { RouterLink } from 'vue-router'

const authStore = useAuthStore()



// Estado del formulario
const formData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  cedula: '',
  address: '',
  password: '',
  confirmPassword: ''
})

const idType = ref<'cedula' | 'ruc' | 'pasaporte'>('cedula')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isSubmitting = ref(false)

// Validaciones
const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  cedula: '',
  address: '',
  password: '',
  confirmPassword: ''
})

const validateForm = (): boolean => {
  // Limpiar errores previos
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  let isValid = true

  // Validar firstName
  if (!formData.firstName.trim()) {
    errors.firstName = 'El nombre es requerido'
    isValid = false
  } else if (formData.firstName.trim().length < 2) {
    errors.firstName = 'El nombre debe tener al menos 2 caracteres'
    isValid = false
  }

  // Validar lastName
  if (!formData.lastName.trim()) {
    errors.lastName = 'El apellido es requerido'
    isValid = false
  } else if (formData.lastName.trim().length < 2) {
    errors.lastName = 'El apellido debe tener al menos 2 caracteres'
    isValid = false
  }

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
  } else if (formData.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres'
    isValid = false
  }

  // Validar documento (requerido)
  const idVal = formData.cedula.trim()
  let idOk = false
  if (idType.value === 'cedula') idOk = /^\d{10}$/.test(idVal)
  else if (idType.value === 'ruc') idOk = /^\d{13}$/.test(idVal)
  else idOk = /^[A-Za-z0-9]{6,20}$/.test(idVal)
  if (!idVal || !idOk) {
    errors.cedula = idType.value === 'cedula'
      ? 'La cédula es requerida (10 dígitos)'
      : idType.value === 'ruc'
        ? 'El RUC es requerido (13 dígitos)'
        : 'El pasaporte es requerido (6–20 alfanuméricos)'
    isValid = false
  }

  // Validar dirección (requerida)
  if (!formData.address.trim() || formData.address.trim().length < 5) {
    errors.address = 'La dirección es requerida (mínimo 5 caracteres)'
    isValid = false
  }

  // Validar confirmación de contraseña
  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Confirma tu contraseña'
    isValid = false
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    await authStore.register({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      cedula: formData.cedula.trim() || undefined,
      address: formData.address.trim() || undefined,
      password: formData.password,
      confirmPassword: formData.confirmPassword
    })
  } catch (error) {
    // El error ya se maneja en el store
    console.error('Error en registro:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>

  
  <div class="register-view">
    <div class="register-container">
      <div class="register-card">
        <!-- Header -->
        <div class="register-header">
          <h1 class="register-title">Crear Cuenta</h1>
          <p class="register-subtitle">
            Únete a Bakano y comienza tu transformación digital
          </p>
        </div>

        <!-- Formulario -->
        <form @submit.prevent="handleSubmit" class="register-form">
          <!-- Campo Nombre -->
          <div class="form-group">
            <label for="firstName" class="form-label">Nombre</label>
            <input
              id="firstName"
              v-model="formData.firstName"
              type="text"
              class="form-input"
              :class="{ 'form-input--error': errors.firstName }"
              placeholder="Ingresa tu nombre"
              autocomplete="given-name"
            />
            <span v-if="errors.firstName" class="form-error">{{ errors.firstName }}</span>
          </div>

          <!-- Campo Apellido -->
          <div class="form-group">
            <label for="lastName" class="form-label">Apellido</label>
            <input
              id="lastName"
              v-model="formData.lastName"
              type="text"
              class="form-input"
              :class="{ 'form-input--error': errors.lastName }"
              placeholder="Ingresa tu apellido"
              autocomplete="family-name"
            />
            <span v-if="errors.lastName" class="form-error">{{ errors.lastName }}</span>
          </div>

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

        <!-- Tipo de documento -->
        <div class="form-group">
          <label for="idType" class="form-label">Tipo de documento</label>
          <select id="idType" v-model="idType" class="form-input">
            <option value="cedula">Cédula</option>
            <option value="ruc">RUC</option>
            <option value="pasaporte">Pasaporte</option>
          </select>
        </div>

        <!-- Documento -->
        <div class="form-group">
          <label for="cedula" class="form-label">Documento</label>
          <input
            id="cedula"
            v-model="formData.cedula"
            type="text"
            inputmode="numeric"
            class="form-input"
            :class="{ 'form-input--error': errors.cedula }"
            :placeholder="idType === 'cedula' ? 'Cédula (10 dígitos)' : idType === 'ruc' ? 'RUC (13 dígitos)' : 'Pasaporte (6–20 alfanuméricos)'"
            autocomplete="off"
          />
          <span v-if="errors.cedula" class="form-error">{{ errors.cedula }}</span>
        </div>

        <!-- Dirección -->
        <div class="form-group">
          <label for="address" class="form-label">Dirección</label>
          <input
            id="address"
            v-model="formData.address"
            type="text"
            class="form-input"
            :class="{ 'form-input--error': errors.address }"
            placeholder="Ingresa tu dirección"
            autocomplete="street-address"
          />
          <span v-if="errors.address" class="form-error">{{ errors.address }}</span>
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
                placeholder="Mínimo 6 caracteres"
                autocomplete="new-password"
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

          <!-- Campo Confirmar Contraseña -->
          <div class="form-group">
            <label for="confirmPassword" class="form-label">Confirmar contraseña</label>
            <div class="password-input-wrapper">
              <input
                id="confirmPassword"
                v-model="formData.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ 'form-input--error': errors.confirmPassword }"
                placeholder="Repite tu contraseña"
                autocomplete="new-password"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="password-toggle"
                :aria-label="showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              >
                <svg v-if="!showConfirmPassword" width="20" height="20" viewBox="0 0 24 24" fill="none">
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
            <span v-if="errors.confirmPassword" class="form-error">{{ errors.confirmPassword }}</span>
          </div>

          <!-- Botón Submit -->
          <button
            type="submit"
            class="submit-button"
            :disabled="isSubmitting || authStore.loading"
          >
            <span v-if="isSubmitting || authStore.loading" class="loading-spinner"></span>
            {{ isSubmitting || authStore.loading ? 'Creando cuenta...' : 'Crear cuenta' }}
          </button>
        </form>

        <!-- Footer -->
        <div class="register-footer">
          <p class="login-link">
            ¿Ya tienes cuenta?
            <RouterLink to="/login" class="link">Inicia sesión</RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '@/styles/index.scss' as *;

.register-view {
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

.register-container {
  width: 100%;
  max-width: 480px;
}

.register-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 12px;
  }
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-title {
  font-size: 2rem;
  font-weight: 700;
  color: $BAKANO-DARK;
  margin-bottom: 0.5rem;
  font-family: $font-principal;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
}

.register-subtitle {
  color: rgba($BAKANO-DARK, 0.7);
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
}

.register-form {
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

.register-footer {
  margin-top: 2rem;
  text-align: center;
}

.login-link {
  color: rgba($BAKANO-DARK, 0.7);
  font-size: 0.875rem;
  margin: 0;
}

.link {
  color: $BAKANO-PINK;
  text-decoration: none;
  font-weight: 600;
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
</style>
