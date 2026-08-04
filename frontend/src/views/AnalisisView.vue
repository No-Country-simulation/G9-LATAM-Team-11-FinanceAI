<script setup>
import { useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseTag from '@/components/base/BaseTag.vue'
import BaseEmptyState from '@/components/base/BaseEmptyState.vue'

const router = useRouter()
</script>

<template>
  <div class="flex flex-col gap-6">
    <section class="flex flex-col gap-1">
      <BaseTag punto>Análisis financiero</BaseTag>
      <h1 class="mt-4 text-2xl font-bold tracking-tight md:text-3xl">Tu perfil, en datos</h1>
    </section>

    <BaseCard>
      <BaseEmptyState
        titulo="Análisis próximamente"
        mensaje="El análisis usa tus transacciones e ingreso para clasificar tu perfil: Saludable, En observación o En riesgo."
      >
        <template #accion>
          <BaseButton bloqueado @click="router.push({ name: 'formulario' })">
            Ir al formulario actual
          </BaseButton>
        </template>
      </BaseEmptyState>
    </BaseCard>
  </div>
</template>
