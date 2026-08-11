<script setup>
import { useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()
</script>

<template>
  <main class="flex min-h-screen flex-col items-center justify-center px-4 text-center">
    <p class="text-6xl font-bold text-cyan">404</p>
    <h1 class="mt-4 text-xl font-semibold">Página no encontrada</h1>
    <p class="mt-2 text-sm text-muted">La ruta que buscás no existe.</p>
    <BaseButton class="mt-6" @click="router.push({ name: 'home' })">
      Volver al inicio
    </BaseButton>
  </main>
</template>
