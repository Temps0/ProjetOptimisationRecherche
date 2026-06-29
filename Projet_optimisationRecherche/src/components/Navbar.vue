<template>
  <nav class="navbar animate-fade-down" :class="{ 'mobile-open': menuOpen }">
    <!-- Logo -->
    <router-link to="/" class="logo" aria-label="GeoScraper">
      <svg viewBox="0 0 256 256" class="logo-icon" fill="currentColor">
        <path d="M 144 256 L 27.598 256 L 144 139.598 Z M 256 207.5 L 200 256 L 200 56 L 0 56 L 48 0 L 256 0 Z M 0 204.402 L 0 112 L 92.402 112 Z" />
      </svg>
      <span class="logo-text">GeoScraper</span>
    </router-link>

    <!-- Desktop Nav Links -->
    <div class="nav-links">
      <a href="#fonctionnalites" class="nav-link">
        Fonctionnalités
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </a>
      <a href="#tarifs" class="nav-link">Tarifs</a>
      <a href="#cas-usage" class="nav-link">Cas d'usage</a>
    </div>

    <!-- CTA + Hamburger -->
    <div class="nav-actions">
      <router-link to="/login" class="nav-link desktop-only">Se connecter</router-link>
      <router-link to="/register" class="cta-btn">Commencer gratuitement</router-link>
      <button class="hamburger" @click="menuOpen = !menuOpen" :aria-expanded="menuOpen" aria-label="Menu">
        <span v-if="!menuOpen">
          <!-- Menu icon -->
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </span>
        <span v-else>
          <!-- X icon -->
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </span>
      </button>
    </div>

    <!-- Mobile Dropdown -->
    <div v-if="menuOpen" class="mobile-dropdown animate-fade-up">
      <a href="#fonctionnalites" class="mobile-link" @click="menuOpen = false">Fonctionnalités</a>
      <a href="#tarifs" class="mobile-link" @click="menuOpen = false">Tarifs</a>
      <a href="#cas-usage" class="mobile-link" @click="menuOpen = false">Cas d'usage</a>
      <router-link to="/login" class="mobile-link" @click="menuOpen = false">Se connecter</router-link>
      <router-link to="/register" class="mobile-link cta-mobile" @click="menuOpen = false">Commencer gratuitement →</router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const menuOpen = ref(false);
</script>

<style scoped>
.navbar {
  position: relative;
  z-index: 20;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 2.5rem;
  width: 100%;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  color: #1c1c1e;
  text-decoration: none;
  flex-shrink: 0;
}

.logo-icon {
  width: 22px;
  height: 22px;
}

.logo-text {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 1.125rem;
  letter-spacing: -0.025em;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  text-decoration: none;
  color: #4b4b52;
  font-size: 0.8125rem;
  font-weight: 500;
  transition: color 0.15s ease-in-out;
}

.nav-link:hover {
  color: #1c1c1e;
}

.chevron {
  width: 13px;
  height: 13px;
  opacity: 0.6;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.desktop-only {
  display: none;
}

@media (min-width: 768px) {
  .desktop-only {
    display: flex;
  }
}

.cta-btn {
  background: #1c1c1e;
  color: #ffffff;
  font-size: 0.8125rem;
  font-weight: 500;
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  text-decoration: none;
  transition: background 0.15s ease, box-shadow 0.15s ease;
  white-space: nowrap;
}

.cta-btn:hover {
  background: #333336;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.hamburger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  border: none;
  background: transparent;
  color: #1c1c1e;
  cursor: pointer;
  transition: background 0.15s ease;
}

.hamburger:hover {
  background: rgba(28, 28, 30, 0.08);
}

@media (min-width: 768px) {
  .hamburger {
    display: none;
  }
}

@media (max-width: 767px) {
  .nav-links {
    display: none;
  }
  .navbar {
    padding: 1rem 1.25rem;
  }
}

/* Mobile dropdown */
.mobile-dropdown {
  position: absolute;
  top: calc(100% + 0.25rem);
  left: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  z-index: 30;
}

.mobile-link {
  display: block;
  text-decoration: none;
  font-size: 0.9375rem;
  color: #4b4b52;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  transition: color 0.12s ease, background 0.12s ease;
}

.mobile-link:last-child {
  border-bottom: none;
}

.mobile-link:hover {
  color: #1c1c1e;
  background: rgba(0,0,0,0.03);
}

.cta-mobile {
  color: #1c1c1e;
  font-weight: 600;
}
</style>
