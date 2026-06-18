<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const errorMsg = ref('');
const isLoading = ref(false);
const router = useRouter();

const handleLogin = async () => {
  errorMsg.value = '';
  isLoading.value = true;
  
  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      router.push('/');
    } else {
      errorMsg.value = data.error || 'Erreur lors de la connexion';
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
        <h1>Connexion</h1>
        <p>Accédez à GeoScraper Pro</p>
      </header>
      
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="input-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" required placeholder="votre@email.com" />
        </div>
        <div class="input-group">
          <label for="password">Mot de passe</label>
          <input type="password" id="password" v-model="password" required placeholder="••••••••" />
        </div>
        
        <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
        
        <button type="submit" class="primary-btn full-width" :disabled="isLoading">
          {{ isLoading ? 'Connexion...' : 'Se connecter' }}
        </button>
      </form>
      
      <p class="auth-link">
        Pas encore de compte ? <router-link to="/register">S'inscrire</router-link>
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
  margin-bottom: 0.5rem;
}

.header h1 {
  font-family: 'Outfit', sans-serif;
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--text-main);
  margin-bottom: 0.25rem;
}

.header p {
  font-size: 0.85rem;
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
