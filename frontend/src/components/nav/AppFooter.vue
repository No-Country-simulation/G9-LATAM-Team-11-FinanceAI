<script setup>
const anio = new Date().getFullYear()
</script>

<template>
  <footer class="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pb-24 pt-6 text-xs text-dim md:pb-10">
    <p>
      © {{ anio }} Finance<span class="text-cyan">AI</span> · Hackathon No Country
    </p>
    <p class="font-mono uppercase tracking-[0.14em]">G9-LATAM-Team 11</p>
  </footer>
</template>
