<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
const isMenuOpen = ref(false)
const isUserMenuOpen = ref(false)

// Versión de la plataforma inyectada desde Vite (vite.config.ts)
const appVersion = import.meta.env.APP_VERSION

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
  isUserMenuOpen.value = false
}

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const handleLogout = () => {
  authStore.logout()
  closeMenu()
}
</script>

<template>
  <header class="header">
    <nav class="nav">
      <div class="nav__container">
        <!-- Logo -->
        <RouterLink :to="authStore.isAuthenticated ? '/dashboard' : '/'" class="nav__logo" @click="closeMenu">
          <img 
            src="@/assets/logos/bakano-dark.png" 
            alt="Bakano" 
            class="nav__logo-img"
          />
          <span class="nav__version" aria-label="Versión de la plataforma">v{{ appVersion }}</span>
        </RouterLink>

        <div class="nav__auth">
          <div v-if="!authStore.isAuthenticated" class="nav__auth-guest">
            <RouterLink to="/login" class="nav__auth-link" @click="closeMenu">
              Iniciar sesión
            </RouterLink>
            <RouterLink to="/register" class="nav__auth-button" @click="closeMenu">
              Registrarse
            </RouterLink>
          </div>

          <!-- User Menu -->
          <div v-else class="nav__auth-user">
            <div class="nav__user-menu">
              <button 
                @click="toggleUserMenu" 
                class="nav__user-button"
                :class="{ 'nav__user-button--active': isUserMenuOpen }"
              >
                <div class="nav__user-avatar">
                  {{ authStore.userName.charAt(0).toUpperCase() }}
                </div>
                <span class="nav__user-name">{{ authStore.userName }}</span>
                <svg class="nav__user-chevron" :class="{ 'nav__user-chevron--open': isUserMenuOpen }" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              
              <!-- User Dropdown -->
              <div class="nav__user-dropdown" :class="{ 'nav__user-dropdown--open': isUserMenuOpen }">
                <div class="nav__user-info">
                  <p class="nav__user-email">{{ authStore.userEmail }}</p>
                  <span v-if="!authStore.isVerified" class="nav__user-status">No verificado</span>
                </div>
                <hr class="nav__user-divider" />
                <button @click="handleLogout" class="nav__user-logout">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Menu Button -->
        <button 
          class="nav__toggle"
          :class="{ 'nav__toggle--active': isMenuOpen }"
          @click="toggleMenu"
          aria-label="Toggle menu"
        >
          <span class="nav__toggle-line"></span>
          <span class="nav__toggle-line"></span>
          <span class="nav__toggle-line"></span>
        </button>
      </div>

      <!-- Mobile Navigation -->
      <div class="nav__mobile" :class="{ 'nav__mobile--open': isMenuOpen }">
        <div class="nav__mobile-menu">
          <!-- Mobile Auth Section -->
          <div class="nav__mobile-auth">
            <div v-if="!authStore.isAuthenticated" class="nav__mobile-auth-guest">
              <RouterLink to="/login" class="nav__mobile-auth-link" @click="closeMenu">
                Iniciar sesión
              </RouterLink>
              <RouterLink to="/register" class="nav__mobile-auth-button" @click="closeMenu">
                Registrarse
              </RouterLink>
            </div>
            
            <div v-else class="nav__mobile-auth-user">
              <div class="nav__mobile-user-info">
                <div class="nav__mobile-user-avatar">
                  {{ authStore.userName.charAt(0).toUpperCase() }}
                </div>
                <div class="nav__mobile-user-details">
                  <p class="nav__mobile-user-name">{{ authStore.userName }}</p>
                  <p class="nav__mobile-user-email">{{ authStore.userEmail }}</p>
                </div>
              </div>
              <button @click="handleLogout" class="nav__mobile-logout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<style lang="scss" scoped>
@use 'sass:color';

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba($white, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba($BAKANO-PURPLE, 0.1);
  transition: all 0.3s ease;
}

.nav {
  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;

    @media (min-width: 768px) {
      padding: 0 2rem;
    }
  }

  &__logo {
    display: flex;
    align-items: center;
    text-decoration: none;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.05);
    }

    &-img {
      height: 32px;
      width: auto;

      @media (min-width: 768px) {
        height: 40px;
      }
    }
  }

  &__version {
    margin-left: 0.5rem;
    display: none;
    align-items: center;
    font-size: 0.75rem;
    line-height: 1;
    color: rgba($BAKANO-DARK, 0.7);
    background: rgba($BAKANO-DARK, 0.05);
    border: 1px solid rgba($BAKANO-DARK, 0.12);
    padding: 0.125rem 0.5rem;
    border-radius: 6px;

    @media (min-width: 768px) {
      display: inline-flex;
    }
  }

  &__menu {
    display: none;
    align-items: center;
    gap: 2rem;

    @media (min-width: 768px) {
      display: flex;
    }
  }

  &__auth {
    display: none;
    align-items: center;

    @media (min-width: 768px) {
      display: flex;
    }

    &-guest {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    &-link {
      color: $BAKANO-DARK;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.95rem;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      transition: all 0.2s ease;

      &:hover {
        color: $BAKANO-PINK;
        background: rgba($BAKANO-PINK, 0.1);
      }
    }

    &-button {
      background: linear-gradient(135deg, $BAKANO-PINK 0%, color.adjust($BAKANO-PINK, $lightness: -10%) 100%);
      color: white;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
      padding: 0.5rem 1.25rem;
      border-radius: 6px;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba($BAKANO-PINK, 0.3);
      }
    }

    &-user {
      position: relative;
    }
  }

  &__user-menu {
    position: relative;
  }

  &__user-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s ease;
    color: $BAKANO-DARK;

    &:hover {
      background: rgba($BAKANO-PINK, 0.1);
    }

    &--active {
      background: rgba($BAKANO-PINK, 0.1);
    }
  }

  &__user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, $BAKANO-PINK 0%, color.adjust($BAKANO-PINK, $lightness: -10%) 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.875rem;
  }

  &__user-name {
    font-weight: 500;
    font-size: 0.95rem;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__user-chevron {
    transition: transform 0.2s ease;
    color: $BAKANO-DARK;

    &--open {
      transform: rotate(180deg);
    }
  }

  &__user-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    padding: 1rem;
    min-width: 200px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.2s ease;
    z-index: 1000;
    border: 1px solid rgba($BAKANO-PURPLE, 0.1);

    &--open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
  }

  &__user-info {
    margin-bottom: 0.75rem;
  }

  &__user-email {
    font-size: 0.875rem;
    color: $BAKANO-DARK;
    margin: 0 0 0.25rem 0;
    font-weight: 500;
  }

  &__user-status {
    font-size: 0.75rem;
    color: #f59e0b;
    background: rgba(#f59e0b, 0.1);
    padding: 0.125rem 0.5rem;
    border-radius: 12px;
    font-weight: 500;
  }

  &__user-divider {
    border: none;
    height: 1px;
    background: rgba($BAKANO-PURPLE, 0.1);
    margin: 0.75rem 0;
  }

  &__user-logout {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    background: none;
    border: none;
    color: #dc2626;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.5rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(#dc2626, 0.1);
    }
  }

  &__link {
    color: $BAKANO-DARK;
    text-decoration: none;
    font-weight: 500;
    font-size: 0.95rem;
    padding: 0.5rem 0;
    position: relative;
    transition: color 0.3s ease;

    &:hover {
      color: $BAKANO-PINK;
    }

    &.router-link-active {
      color: $BAKANO-PINK;

      &::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        right: 0;
        height: 2px;
        background: $BAKANO-PINK;
        border-radius: 1px;
      }
    }
  }

  &__toggle {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 30px;
    height: 30px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    transition: transform 0.2s ease;

    @media (min-width: 768px) {
      display: none;
    }

    &:hover {
      transform: scale(1.1);
    }

    &-line {
      width: 20px;
      height: 2px;
      background: $BAKANO-DARK;
      margin: 2px 0;
      transition: all 0.3s ease;
      border-radius: 1px;
    }

    &--active {
      .nav__toggle-line {
        &:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }

        &:nth-child(2) {
          opacity: 0;
        }

        &:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -6px);
        }
      }
    }
  }

  &__mobile {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: $white;
    border-bottom: 1px solid rgba($BAKANO-PURPLE, 0.1);
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba($BAKANO-DARK, 0.1);

    @media (min-width: 768px) {
      display: none;
    }

    &--open {
      transform: translateY(0);
      opacity: 1;
      visibility: visible;
    }

    &-menu {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    &-link {
      color: $BAKANO-DARK;
      text-decoration: none;
      font-weight: 500;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      transition: all 0.2s ease;

      &:hover {
        background: $overlay-purple;
        color: $BAKANO-PINK;
      }

      &.router-link-active {
        background: $overlay-purple;
        color: $BAKANO-PINK;
      }
    }

    &-auth {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba($BAKANO-PURPLE, 0.1);

      &-guest {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      &-link {
        color: $BAKANO-DARK;
        text-decoration: none;
        font-weight: 500;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        text-align: center;
        transition: all 0.2s ease;
        border: 1px solid rgba($BAKANO-PURPLE, 0.2);

        &:hover {
          background: rgba($BAKANO-PINK, 0.1);
          color: $BAKANO-PINK;
          border-color: $BAKANO-PINK;
        }
      }

      &-button {
        background: linear-gradient(135deg, $BAKANO-PINK 0%, color.adjust($BAKANO-PINK, $lightness: -10%) 100%);
        color: white;
        text-decoration: none;
        font-weight: 600;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        text-align: center;
        transition: all 0.2s ease;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba($BAKANO-PINK, 0.3);
        }
      }

      &-user {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
    }

    &-user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: rgba($BAKANO-PINK, 0.05);
      border-radius: 8px;
    }

    &-user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, $BAKANO-PINK 0%, color.adjust($BAKANO-PINK, $lightness: -10%) 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1rem;
      flex-shrink: 0;
    }

    &-user-details {
      flex: 1;
      min-width: 0;
    }

    &-user-name {
      font-weight: 600;
      color: $BAKANO-DARK;
      margin: 0 0 0.25rem 0;
      font-size: 0.95rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &-user-email {
      font-size: 0.875rem;
      color: rgba($BAKANO-DARK, 0.7);
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &-logout {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      background: none;
      border: 1px solid #dc2626;
      color: #dc2626;
      font-size: 0.875rem;
      font-weight: 500;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: #dc2626;
        color: white;
      }
    }
  }
}
</style>