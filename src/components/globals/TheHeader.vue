<script setup lang="ts">
import { ref } from 'vue'

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}
</script>

<template>
  <header class="header">
    <nav class="nav">
      <div class="nav__container">
        <!-- Logo -->
        <RouterLink to="/" class="nav__logo" @click="closeMenu">
          <img 
            src="@/assets/logos/bakano-dark.png" 
            alt="Bakano" 
            class="nav__logo-img"
          />
        </RouterLink>

        <!-- Desktop Navigation -->
        <div class="nav__menu">
          <RouterLink to="/" class="nav__link" @click="closeMenu">
            Inicio
          </RouterLink>
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
          <RouterLink to="/" class="nav__mobile-link" @click="closeMenu">
            Inicio
          </RouterLink>
          <RouterLink to="/about" class="nav__mobile-link" @click="closeMenu">
            Acerca de
          </RouterLink>
          <RouterLink to="/services" class="nav__mobile-link" @click="closeMenu">
            Servicios
          </RouterLink>
          <RouterLink to="/contact" class="nav__mobile-link" @click="closeMenu">
            Contacto
          </RouterLink>
        </div>
      </div>
    </nav>
  </header>
</template>

<style lang="scss" scoped>
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

  &__menu {
    display: none;
    align-items: center;
    gap: 2rem;

    @media (min-width: 768px) {
      display: flex;
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
  }
}
</style>