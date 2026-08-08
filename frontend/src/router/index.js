import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '../layouts/AppLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
      meta: { requiereSesion: true },
      children: [
        { path: '', redirect: '/home' },
        {
          path: 'home',
          name: 'home',
          component: () => import('../views/DashboardView.vue'),
        },
        {
          path: 'transacciones',
          name: 'transacciones',
          component: () => import('../views/TransaccionesView.vue'),
        },
        {
          path: 'analisis',
          name: 'analisis',
          component: () => import('../views/AnalisisView.vue'),
        },
        {
          path: 'formulario',
          name: 'formulario',
          component: () => import('../views/FormularioView.vue'),
        },
        {
          path: 'resultado',
          name: 'resultado',
          component: () => import('../views/ResultadoView.vue'),
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  // Ruta protegida sin sesión → login
  if (to.matched.some(r => r.meta.requiereSesion) && !auth.sesionActiva) {
    return { name: 'login' }
  }

  // Ya logueado y va a login → home
  if (to.name === 'login' && auth.sesionActiva) {
    return { name: 'home' }
  }
})

export default router
