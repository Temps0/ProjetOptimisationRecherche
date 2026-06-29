<template>
  <div class="hero-text">
    <h1 class="headline">Vos données.<br/>Sans le bruit.</h1>
    <p class="description">
      Automatisez vos recherches géolocalisées avec précision et simplicité.
    </p>
    <form class="input-group search-bar" @submit.prevent="$router.push('/register')">
      <div class="input-wrapper">
        <input type="email" placeholder="Entrez votre adresse email..." required />
        <button type="submit" class="primary-btn search-btn" aria-label="Commencer">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.hero-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 500px;
}

.headline {
  font-family: 'Outfit', sans-serif;
  font-weight: 300;
  font-size: 4.5rem;
  line-height: 1.05;
  color: var(--text-main);
  letter-spacing: -0.03em;
  margin-bottom: 1.5rem;
}

.description {
  font-size: 1.1rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 2.5rem;
}

.search-bar .input-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.search-bar input {
  flex: 1;
  border-radius: var(--radius-sm);
}

.search-btn {
  padding: 0;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
}

@media (max-width: 768px) {
  .headline {
    font-size: 3rem;
  }
}
</style>
