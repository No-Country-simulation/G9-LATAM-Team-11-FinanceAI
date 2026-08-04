import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '../layouts/AppLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
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

export default router
