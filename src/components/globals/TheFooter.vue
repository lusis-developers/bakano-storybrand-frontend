<script setup lang="ts">
const currentYear = new Date().getFullYear()

const socialLinks = [
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com/company/bakano',
    icon: 'linkedin'
  },
  {
    name: 'Twitter',
    url: 'https://twitter.com/bakano',
    icon: 'twitter'
  },
  {
    name: 'Instagram',
    url: 'https://instagram.com/bakano',
    icon: 'instagram'
  }
]

const footerLinks = {
  company: [
    { name: 'Acerca de', to: '/about' },
    { name: 'Servicios', to: '/services' },
    { name: 'Equipo', to: '/team' },
    { name: 'Carreras', to: '/careers' }
  ],
  support: [
    { name: 'Contacto', to: '/contact' },
    { name: 'FAQ', to: '/faq' },
    { name: 'Soporte', to: '/support' },
    { name: 'Documentación', to: '/docs' }
  ],
  legal: [
    { name: 'Privacidad', to: '/privacy' },
    { name: 'Términos', to: '/terms' },
    { name: 'Cookies', to: '/cookies' }
  ]
}
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
              src="@/assets/logos/bakano-dark.png" 
              alt="Bakano" 
              class="footer__logo-img"
            />
          </RouterLink>
          <p class="footer__description">
            Transformamos ideas en experiencias digitales excepcionales. 
            Creamos soluciones innovadoras que impulsan el crecimiento de tu negocio.
          </p>
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
              <i :class="`icon-${social.icon}`" class="footer__social-icon"></i>
            </a>
          </div>
        </div>

        <!-- Links Sections -->
        <div class="footer__links">
          <!-- Company Links -->
          <div class="footer__section">
            <h3 class="footer__section-title">Empresa</h3>
            <ul class="footer__section-list">
              <li v-for="link in footerLinks.company" :key="link.name">
                <RouterLink :to="link.to" class="footer__section-link">
                  {{ link.name }}
                </RouterLink>
              </li>
            </ul>
          </div>

          <!-- Support Links -->
          <div class="footer__section">
            <h3 class="footer__section-title">Soporte</h3>
            <ul class="footer__section-list">
              <li v-for="link in footerLinks.support" :key="link.name">
                <RouterLink :to="link.to" class="footer__section-link">
                  {{ link.name }}
                </RouterLink>
              </li>
            </ul>
          </div>

          <!-- Legal Links -->
          <div class="footer__section">
            <h3 class="footer__section-title">Legal</h3>
            <ul class="footer__section-list">
              <li v-for="link in footerLinks.legal" :key="link.name">
                <RouterLink :to="link.to" class="footer__section-link">
                  {{ link.name }}
                </RouterLink>
              </li>
            </ul>
          </div>

          <!-- Contact Info -->
          <div class="footer__section">
            <h3 class="footer__section-title">Contacto</h3>
            <div class="footer__contact">
              <p class="footer__contact-item">
                <i class="icon-mail"></i>
                <a href="mailto:hello@bakano.com" class="footer__contact-link">
                  hello@bakano.com
                </a>
              </p>
              <p class="footer__contact-item">
                <i class="icon-phone"></i>
                <a href="tel:+1234567890" class="footer__contact-link">
                  +1 (234) 567-890
                </a>
              </p>
              <p class="footer__contact-item">
                <i class="icon-location"></i>
                <span>Ciudad, País</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="footer__bottom">
        <div class="footer__bottom-content">
          <p class="footer__copyright">
            © {{ currentYear }} Bakano. Todos los derechos reservados.
          </p>
          <div class="footer__bottom-links">
            <RouterLink to="/privacy" class="footer__bottom-link">
              Privacidad
            </RouterLink>
            <RouterLink to="/terms" class="footer__bottom-link">
              Términos
            </RouterLink>
          </div>
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
    padding: 3rem 0 2rem;
    display: grid;
    gap: 2rem;
    grid-template-columns: 1fr;

    @media (min-width: 768px) {
      grid-template-columns: 1fr 2fr;
      gap: 3rem;
      padding: 4rem 0 3rem;
    }

    @media (min-width: 1024px) {
      gap: 4rem;
    }
  }

  &__brand {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  &__logo {
    display: inline-block;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.05);
    }

    &-img {
      height: 40px;
      width: auto;

      @media (min-width: 768px) {
        height: 48px;
      }
    }
  }

  &__description {
    color: rgba($text-light, 0.8);
    line-height: 1.6;
    max-width: 300px;
    margin: 0;
  }

  &__social {
    display: flex;
    gap: 1rem;

    &-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: rgba($white, 0.1);
      border-radius: 50%;
      color: $text-light;
      text-decoration: none;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);

      &:hover {
        background: $BAKANO-PINK;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba($BAKANO-PINK, 0.3);
      }
    }

    &-icon {
      font-size: 1.2rem;
    }
  }

  &__links {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;

    @media (min-width: 768px) {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  &__section {
    &-title {
      color: $white;
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0 1rem 0;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 0;
        width: 30px;
        height: 2px;
        background: $BAKANO-PINK;
        border-radius: 1px;
      }
    }

    &-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    &-link {
      color: rgba($text-light, 0.8);
      text-decoration: none;
      font-size: 0.9rem;
      transition: all 0.2s ease;
      display: inline-block;

      &:hover {
        color: $BAKANO-PINK;
        transform: translateX(4px);
      }
    }
  }

  &__contact {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    &-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
      font-size: 0.9rem;
      color: rgba($text-light, 0.8);

      i {
        color: $BAKANO-PINK;
        font-size: 1rem;
        width: 16px;
      }
    }

    &-link {
      color: inherit;
      text-decoration: none;
      transition: color 0.2s ease;

      &:hover {
        color: $BAKANO-PINK;
      }
    }
  }

  &__bottom {
    border-top: 1px solid rgba($white, 0.1);
    padding: 1.5rem 0;

    &-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      text-align: center;

      @media (min-width: 768px) {
        flex-direction: row;
        justify-content: space-between;
        text-align: left;
      }
    }

    &-links {
      display: flex;
      gap: 1.5rem;
    }

    &-link {
      color: rgba($text-light, 0.6);
      text-decoration: none;
      font-size: 0.85rem;
      transition: color 0.2s ease;

      &:hover {
        color: $BAKANO-PINK;
      }
    }
  }

  &__copyright {
    color: rgba($text-light, 0.6);
    font-size: 0.85rem;
    margin: 0;
  }
}

// Icon placeholders (replace with your preferred icon system)
.icon-linkedin::before {
  content: '💼';
}

.icon-twitter::before {
  content: '🐦';
}

.icon-instagram::before {
  content: '📷';
}

.icon-mail::before {
  content: '✉️';
}

.icon-phone::before {
  content: '📞';
}

.icon-location::before {
  content: '📍';
}
</style>