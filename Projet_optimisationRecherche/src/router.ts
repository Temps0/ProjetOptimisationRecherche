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

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else if ((to.path === '/login' || to.path === '/register' || to.path === '/') && token) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
