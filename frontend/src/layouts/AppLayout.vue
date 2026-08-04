<script setup>
import { RouterView } from 'vue-router'
import AppNav from '@/components/nav/AppNav.vue'
import AppTabBar from '@/components/nav/AppTabBar.vue'
</script>

<template>
  <div class="mx-auto w-full max-w-[1120px] px-4 md:px-6">
    <AppNav />
    <main class="pb-28 pt-6 md:pb-12 md:pt-8">
      <RouterView v-slot="{ Component }">
        <Transition
          mode="out-in"
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="translate-y-2 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="opacity-0"
        >
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <AppTabBar />
  </div>
</template>
