import { createRouter, createWebHistory } from 'vue-router'
import FormularioView from '../views/FormularioView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'formulario',
      component: FormularioView,
    },
    {
      path: '/resultado',
      name: 'resultado',
      component: () => import('../views/ResultadoView.vue'),
    },
  ],
})

export default router
