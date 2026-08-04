<script setup>
const enlaces = [
  {
    nombre: 'home',
    etiqueta: 'Inicio',
    destino: '/home',
    icono: 'M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6v-9h-6v9zm0-16v5h6V4h-6z',
  },
  {
    nombre: 'transacciones',
    etiqueta: 'Gastos',
    destino: '/transacciones',
    icono: 'M6 6h12M6 12h12M6 18h12',
  },
  {
    nombre: 'analisis',
    etiqueta: 'Análisis',
    destino: '/analisis',
    icono: 'M4 20V10M10 20V4M16 20v-6M22 20H2',
  },
]
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-20 flex h-16 items-stretch border-t border-hairline bg-onyx/90 backdrop-blur-md md:hidden"
    aria-label="Principal"
  >
    <RouterLink
      v-for="enlace in enlaces"
      :key="enlace.nombre"
      :to="enlace.destino"
      class="flex flex-1 flex-col items-center justify-center gap-1 text-[10px] text-muted transition-colors duration-200 hover:text-white"
      active-class="text-cyan"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path :d="enlace.icono" />
      </svg>
      {{ enlace.etiqueta }}
    </RouterLink>
  </nav>
</template>
