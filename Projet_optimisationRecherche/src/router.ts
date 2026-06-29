import { createRouter, createWebHistory } from 'vue-router';
import Home from './Home.vue';
import Dashboard from './Dashboard.vue';
import Login from './Login.vue';
import Register from './Register.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/login', component: Login },
  { path: '/register', component: Register }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from) => {
  let isAuthenticated = false;
  
  try {
    const response = await fetch('http://localhost:3000/api/me', { credentials: 'include' });
    if (response.ok) {
      isAuthenticated = true;
    }
  } catch (e) {
    console.error('Auth check failed', e);
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    return '/login';
  } else if ((to.path === '/login' || to.path === '/register' || to.path === '/') && isAuthenticated) {
    return '/dashboard';
  }
});

export default router;
