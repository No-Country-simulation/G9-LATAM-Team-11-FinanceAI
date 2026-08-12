<script setup>
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useUsuarioStore } from '@/stores/usuario'
import { useDashboard } from '@/composables/useDashboard'
import { formatoMoneda, formatoNumero } from '@/utils/formato'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseTag from '@/components/base/BaseTag.vue'
import KpiCard from '@/components/dashboard/KpiCard.vue'
import GraficoCategorias from '@/components/dashboard/GraficoCategorias.vue'
import GraficoEvolucion from '@/components/dashboard/GraficoEvolucion.vue'
import ListaTransacciones from '@/components/dashboard/ListaTransacciones.vue'

const router = useRouter()
const usuarioStore = useUsuarioStore()
const { nombre } = storeToRefs(usuarioStore)
const {
  gastoMes,
  ingreso,
  ahorroMes,
  endeudamiento,
  porCategoria,
  evolucionMensual,
  ultimasTransacciones,
} = useDashboard()
</script>

<template>
  <div class="flex flex-col gap-6">
    <section class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <BaseTag punto>En vivo</BaseTag>
        <h1 class="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
          Hola, <span class="text-cyan">{{ nombre }}</span>
        </h1>
        <p class="mt-1 text-sm text-muted">
          Gasto de este mes: <span class="font-semibold text-ink">−{{ formatoMoneda(gastoMes) }}</span>
        </p>
      </div>
      <div class="flex gap-3">
        <BaseButton variante="secundario" @click="router.push({ name: 'transacciones' })">
          Ver gastos
        </BaseButton>
        <BaseButton @click="router.push({ name: 'analisis' })">Analizar</BaseButton>
      </div>
    </section>

    <section class="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4" aria-label="Indicadores">
      <KpiCard
        etiqueta="Ingreso disponible"
        :valor="ingreso"
        :formato="(n) => formatoMoneda(n)"
      />
      <KpiCard
        etiqueta="Gasto del mes"
        :valor="gastoMes"
        :formato="(n) => formatoMoneda(n)"
        delta="total mensual"
        tono="cyan"
      />
      <KpiCard
        etiqueta="Ahorro"
        :valor="ahorroMes"
        :formato="(n) => formatoMoneda(n)"
        delta="ingreso − gastos"
        tono="success"
      />
      <KpiCard
        etiqueta="Endeudamiento"
        :valor="endeudamiento"
        :formato="(n) => `${formatoNumero(n)}%`"
        :delta="endeudamiento < 30 ? 'saludable' : 'en riesgo'"
        :tono="endeudamiento < 30 ? 'success' : 'danger'"
      />
    </section>

    <section class="grid gap-4 lg:grid-cols-2">
      <BaseCard>
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-ink">Evolución de gastos</h2>
          <BaseTag plano>últimos 6 meses</BaseTag>
        </div>
        <GraficoEvolucion :datos="evolucionMensual" />
      </BaseCard>

      <BaseCard>
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-ink">Gastos por categoría</h2>
          <BaseTag plano>total</BaseTag>
        </div>
        <GraficoCategorias :datos="porCategoria" />
      </BaseCard>
    </section>

    <BaseCard>
      <div class="mb-2 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-ink">Últimos movimientos</h2>
        <RouterLink
          to="/transacciones"
          class="text-[13px] font-semibold text-cyan hover:underline"
        >
          Ver todas
        </RouterLink>
      </div>
      <ListaTransacciones :transacciones="ultimasTransacciones" />
    </BaseCard>
  </div>
</template>
