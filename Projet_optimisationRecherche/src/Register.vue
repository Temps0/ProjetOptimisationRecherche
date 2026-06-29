<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const betaCode = ref('');
const errorMsg = ref('');
const successMsg = ref('');
const isLoading = ref(false);
const router = useRouter();

const handleRegister = async () => {
  errorMsg.value = '';
  successMsg.value = '';
  isLoading.value = true;
  
  try {
    const response = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: email.value, 
        password: password.value,
        betaCode: betaCode.value
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      successMsg.value = 'Inscription réussie ! Vous pouvez vous connecter.';
      setTimeout(() => router.push('/login'), 2000);
    } else {
      errorMsg.value = data.error || 'Erreur lors de l\'inscription';
    }
  } catch (err) {
    errorMsg.value = 'Erreur réseau';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="auth-container dashboard">
    <div class="glass-container auth-box">
      <header class="header">
        <svg viewBox="0 0 256 256" class="auth-logo" fill="currentColor">
          <path d="M 144 256 L 27.598 256 L 144 139.598 Z M 256 207.5 L 200 256 L 200 56 L 0 56 L 48 0 L 256 0 Z M 0 204.402 L 0 112 L 92.402 112 Z" />
        </svg>
        <h1>Inscription</h1>
        <p>Rejoignez la Bêta GeoScraper Pro</p>
      </header>
      
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="input-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" required placeholder="votre@email.com" />
        </div>
        <div class="input-group">
          <label for="password">Mot de passe</label>
          <input type="password" id="password" v-model="password" required placeholder="••••••••" />
        </div>
        <div class="input-group">
          <label for="betaCode">Code Bêta</label>
          <input type="text" id="betaCode" v-model="betaCode" required placeholder="Entrez votre code bêta" />
        </div>
        
        <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
        <p v-if="successMsg" class="success-text">{{ successMsg }}</p>
        
        <button type="submit" class="primary-btn full-width" :disabled="isLoading">
          {{ isLoading ? 'Inscription...' : 'S\'inscrire' }}
        </button>
      </form>
      
      <p class="auth-link">
        Déjà un compte ? <router-link to="/login">Se connecter</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
}

.auth-box {
  max-width: 465px;
  width: 100%;
  padding: 3.5rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.auth-logo {
  width: 32px;
  height: 32px;
  color: var(--text-main);
  margin-bottom: 1.5rem;
}

.header h1 {
  font-family: 'Outfit', sans-serif;
  font-size: 1.75rem;
  font-weight: 400;
  letter-spacing: -0.02em;
  color: var(--text-main);
  margin-bottom: 0.5rem;
}

.header p {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.full-width {
  width: 100%;
}

.error-text {
  color: #ef4444;
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
}

.success-text {
  color: var(--accent);
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
}

.auth-link {
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.auth-link a {
  color: var(--text-main);
  text-decoration: none;
  font-weight: 600;
}

.auth-link a:hover {
  text-decoration: underline;
}
</style>
