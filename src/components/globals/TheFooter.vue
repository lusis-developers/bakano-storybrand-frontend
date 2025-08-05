<script setup lang="ts">
const currentYear = new Date().getFullYear()

const socialLinks = [
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/bakano.ec/',
    icon: 'instagram'
  },
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/bakano.ec',
    icon: 'facebook-f'
  },
  {
    name: 'WhatsApp',
    url: 'https://wa.me/593984934039',
    icon: 'whatsapp'
  }
]
</script>

<template>
  <footer class="footer">
    <div class="footer__container">
      <!-- Main Footer Content -->
      <div class="footer__content">
        <!-- Brand Section -->
        <div class="footer__brand">
          <RouterLink to="/" class="footer__logo">
            <img 
              src="@/assets/logos/bakano-light.png" 
              alt="Bakano" 
              class="footer__logo-img"
            />
          </RouterLink>
          <p class="footer__description">
            Transformamos ideas en experiencias digitales excepcionales.
          </p>
        </div>

        <!-- Social Links -->
        <div class="footer__social">
          <a 
            v-for="social in socialLinks" 
            :key="social.name"
            :href="social.url"
            :aria-label="social.name"
            class="footer__social-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i :class="`fab fa-${social.icon}`" class="footer__social-icon"></i>
          </a>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="footer__bottom">
        <div class="footer__bottom-content">
          <p class="footer__copyright">
            © {{ currentYear }} Bakano. Todos los derechos reservados.
          </p>
          <a 
            href="https://mkt.bakano.ec/politicas" 
            class="footer__policies-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Políticas de Privacidad
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.footer {
  background: linear-gradient(135deg, $BAKANO-DARK 0%, darken($BAKANO-DARK, 5%) 100%);
  color: $text-light;
  margin-top: auto;

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;

    @media (min-width: 768px) {
      padding: 0 2rem;
    }
  }

  &__content {
    padding: 2rem 0 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1.5rem;

    @media (min-width: 768px) {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      text-align: left;
      padding: 3rem 0 2rem;
    }
  }

  &__brand {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;

    @media (min-width: 768px) {
      align-items: flex-start;
      flex: 1;
    }
  }

  &__logo {
    display: inline-block;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.05);
    }

    &-img {
      height: 36px;
      width: auto;

      @media (min-width: 768px) {
        height: 42px;
      }
    }
  }

  &__description {
    color: rgba($text-light, 0.8);
    line-height: 1.5;
    font-size: 0.9rem;
    margin: 0;
    max-width: 280px;

    @media (min-width: 768px) {
      max-width: 320px;
      font-size: 1rem;
    }
  }

  &__social {
    display: flex;
    gap: 1rem;
    justify-content: center;

    @media (min-width: 768px) {
      justify-content: flex-end;
    }

    &-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      background: rgba($white, 0.1);
      border-radius: 50%;
      color: $text-light;
      text-decoration: none;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);

      @media (min-width: 768px) {
        width: 48px;
        height: 48px;
      }

      &:hover {
        background: $BAKANO-PINK;
        transform: translateY(-3px);
        box-shadow: 0 6px 20px rgba($BAKANO-PINK, 0.4);
      }
    }

    &-icon {
      font-size: 1.3rem;

      @media (min-width: 768px) {
        font-size: 1.4rem;
      }
    }
  }

  &__bottom {
    border-top: 1px solid rgba($white, 0.1);
    padding: 1.25rem 0;

    &-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      text-align: center;

      @media (min-width: 768px) {
        flex-direction: row;
        justify-content: space-between;
        text-align: left;
        gap: 1rem;
      }
    }
  }

  &__copyright {
    color: rgba($text-light, 0.6);
    font-size: 0.8rem;
    margin: 0;

    @media (min-width: 768px) {
      font-size: 0.85rem;
    }
  }

  &__policies-link {
    color: rgba($text-light, 0.7);
    text-decoration: none;
    font-size: 0.8rem;
    transition: color 0.2s ease;
    border-bottom: 1px solid transparent;

    @media (min-width: 768px) {
      font-size: 0.85rem;
    }

    &:hover {
      color: $BAKANO-PINK;
      border-bottom-color: $BAKANO-PINK;
    }
  }
}

// Font Awesome icons are used directly with fab fa-* classes
</style>