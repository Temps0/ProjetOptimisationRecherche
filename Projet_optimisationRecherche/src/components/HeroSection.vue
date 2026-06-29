<template>
  <section class="hero-section" :style="{ backgroundImage: `url(${heroBg})` }">
    <!-- Navbar -->
    <Navbar />

    <!-- Spacer -->
    <div class="hero-spacer-top"></div>

    <!-- Hero Content -->
    <div class="hero-content">
      <h1 class="headline">
        <span class="headline-line animate-fade-up">Vos données.</span>
        <span class="headline-line animate-fade-up line-delay">Sans le bruit.</span>
      </h1>

      <!-- Search bar -->
      <form class="search-form animate-fade-up search-delay" @submit.prevent="$router.push('/register')">
        <div class="search-pill">
          <input
            type="email"
            class="search-input"
            placeholder="Entrez votre email professionnel..."
            required
          />
          <button type="submit" class="search-submit" aria-label="Commencer">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </form>

      <!-- Description -->
      <p class="description animate-fade-up desc-delay">
        Automatisez l'extraction de données géolocalisées
        <br />depuis Google Maps — propre, structuré, instantané.
      </p>

      <!-- CTA Buttons -->
      <div class="cta-group animate-fade-up cta-delay">
        <router-link to="/register" class="btn-primary">Essayer gratuitement</router-link>
        <router-link to="/login" class="btn-secondary">Se connecter</router-link>
      </div>
    </div>

    <!-- Spacer -->
    <div class="hero-spacer-bottom"></div>

    <!-- Dashboard Mockup -->
    <div class="mockup-wrapper animate-hero-rise mockup-delay">
      <HeroDashboardMockup />
    </div>
  </section>
</template>

<script setup lang="ts">
import Navbar from './Navbar.vue';
import HeroDashboardMockup from './HeroDashboardMockup.vue';

const heroBg = '/image1.png';
</script>

<style scoped>
/* ========================
   HERO SECTION
   ======================== */
.hero-section {
  position: relative;
  min-height: 100svh;
  overflow: hidden;
  background-color: #b8d4e8; /* sky fallback matching the image */
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
}

/* ========================
   SPACERS
   ======================== */
.hero-spacer-top {
  flex: 1;
  min-height: 2rem;
  max-height: 3.5rem;
  flex-shrink: 0;
}

.hero-spacer-bottom {
  flex: 1;
  min-height: 2rem;
  max-height: 4rem;
  flex-shrink: 0;
}

/* ========================
   HERO CONTENT
   ======================== */
.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 1.25rem;
  position: relative;
  z-index: 10;
}

/* ========================
   HEADLINE
   ======================== */
.headline {
  display: flex;
  flex-direction: column;
  gap: 0;
  font-family: 'Outfit', sans-serif;
  font-weight: 300;
  line-height: 1.04;
  letter-spacing: -0.03em;
  color: #1c1c1e;
  font-size: clamp(2.8rem, 8vw, 5.25rem);
}

.headline-line {
  display: block;
}

/* ========================
   SEARCH BAR
   ======================== */
.search-form {
  margin-top: 1.5rem;
  width: 100%;
  max-width: 480px;
}

.search-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.8);
  box-shadow: 0 2px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5);
  padding: 0.375rem 0.375rem 0.375rem 1.25rem;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.875rem;
  color: #1c1c1e;
  font-family: 'Inter', sans-serif;
  padding: 0.5rem 0;
}

.search-input::placeholder {
  color: #9999a5;
}

.search-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background: #1c1c1e;
  border: none;
  color: #ffffff;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.search-submit:hover {
  transform: scale(1.06);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.search-submit:active {
  transform: scale(0.96);
}

@media (min-width: 640px) {
  .search-submit {
    width: 40px;
    height: 40px;
  }
}

/* ========================
   DESCRIPTION
   ======================== */
.description {
  margin-top: 1.25rem;
  font-size: 0.9375rem;
  color: #5a5a64;
  line-height: 1.65;
  max-width: 380px;
}

@media (min-width: 640px) {
  .description {
    font-size: 1rem;
  }
}

/* ========================
   CTA BUTTONS
   ======================== */
.cta-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  background: #1c1c1e;
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.625rem 1.5rem;
  border-radius: 9999px;
  text-decoration: none;
  transition: background 0.15s ease, box-shadow 0.15s ease;
}

.btn-primary:hover {
  background: #333336;
  box-shadow: 0 6px 20px rgba(0,0,0,0.18);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  color: #4b4b52;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.625rem 1.5rem;
  border-radius: 9999px;
  border: 1px solid rgba(0,0,0,0.15);
  text-decoration: none;
  transition: background 0.12s ease, color 0.12s ease;
  background: rgba(255,255,255,0.4);
  backdrop-filter: blur(8px);
}

.btn-secondary:hover {
  background: rgba(255,255,255,0.7);
  color: #1c1c1e;
}

/* ========================
   MOCKUP
   ======================== */
.mockup-wrapper {
  position: relative;
  z-index: 5;
  width: 92%;
  max-width: 900px;
  margin: 0 auto;
  flex-shrink: 0;
  margin-bottom: -2.5rem;
}

@media (min-width: 640px) {
  .mockup-wrapper {
    width: 86%;
    margin-bottom: -5rem;
  }
}

@media (min-width: 1024px) {
  .mockup-wrapper {
    width: 74%;
    margin-bottom: -8rem;
  }
}

/* ========================
   ANIMATIONS
   ======================== */
@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(24px);
    filter: blur(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

@keyframes hero-rise {
  from {
    opacity: 0;
    transform: translateY(64px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-fade-up {
  animation: fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.animate-hero-rise {
  animation: hero-rise 1.1s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* Staggered delays */
.line-delay        { animation-delay: 100ms; }
.search-delay      { animation-delay: 220ms; }
.desc-delay        { animation-delay: 340ms; }
.cta-delay         { animation-delay: 460ms; }
.mockup-delay      { animation-delay: 620ms; }
</style>
