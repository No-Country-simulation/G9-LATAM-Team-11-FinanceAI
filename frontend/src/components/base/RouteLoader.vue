<template>
  <Transition
    enter-active-class="transition-opacity duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-400 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="visible" class="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-coal/95 backdrop-blur-sm">
      <div class="flex flex-col items-center gap-6">
        <!-- Logo with pulse -->
        <p class="animate-pulse text-2xl font-extrabold tracking-tight">
          Finance<span class="text-cyan">AI</span>
        </p>

        <!-- Progress bar -->
        <div class="h-0.5 w-48 overflow-hidden rounded-full bg-edge">
          <div class="h-full w-full animate-loading-bar rounded-full bg-gradient-to-r from-transparent via-cyan to-transparent" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
})
</script>

<style scoped>
@keyframes loading-bar {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.animate-loading-bar {
  animation: loading-bar 0.8s ease-in-out infinite;
}
</style>
