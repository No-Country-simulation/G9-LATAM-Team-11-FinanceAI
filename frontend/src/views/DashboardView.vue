<script setup>
import { computed, ref } from 'vue'
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
const { nombre, transacciones } = storeToRefs(usuarioStore)
const {
  gastoMes,
  ingreso,
  ahorroMes,
  endeudamiento,
  porCategoria,
  ultimasTransacciones,
} = useDashboard()

const rangoEvolucion = ref(6)

const evolucionFiltrada = computed(() => {
  const ahora = new Date()
  const anio = ahora.getFullYear()
  const mes = ahora.getMonth()
  const cantidad = rangoEvolucion.value

  // Para 1 mes: mostrar evolución por semana del mes actual
  if (cantidad === 1) {
    const lista = []
    for (let semana = 0; semana < 4; semana++) {
      const inicioSemana = semana * 7 + 1
      const finSemana = Math.min((semana + 1) * 7, new Date(anio, mes + 1, 0).getDate())
      const total = transacciones.value
        .filter((t) => {
          if (!t.fecha) return false
          const f = new Date(`${t.fecha}T00:00:00`)
          if (f.getFullYear() !== anio || f.getMonth() !== mes) return false
          const dia = f.getDate()
          return dia >= inicioSemana && dia <= finSemana
        })
        .reduce((suma, t) => suma + Number(t.monto || 0), 0)
      // Usamos el primer día de cada semana como referencia para la etiqueta
      lista.push({ mes: new Date(anio, mes, inicioSemana), total, etiqueta: `Sem ${semana + 1}` })
    }
    return lista
  }

  // Para 6M y 12M: evolución por mes
  const lista = []
  for (let i = cantidad - 1; i >= 0; i--) {
    const d = new Date(anio, mes - i, 1)
    const total = transacciones.value
      .filter((t) => {
        if (!t.fecha) return false
        const f = new Date(`${t.fecha}T00:00:00`)
        return f.getFullYear() === d.getFullYear() && f.getMonth() === d.getMonth()
      })
      .reduce((suma, t) => suma + Number(t.monto || 0), 0)
    lista.push({ mes: d, total })
  }
  return lista
})
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
          <div class="flex gap-1">
            <button
              type="button"
              class="rounded-md px-2 py-1 text-[11px] font-semibold transition-colors"
              :class="rangoEvolucion === 1 ? 'bg-cyan/15 text-cyan' : 'text-muted hover:text-white'"
              @click="rangoEvolucion = 1"
            >
              1M
            </button>
            <button
              type="button"
              class="rounded-md px-2 py-1 text-[11px] font-semibold transition-colors"
              :class="rangoEvolucion === 6 ? 'bg-cyan/15 text-cyan' : 'text-muted hover:text-white'"
              @click="rangoEvolucion = 6"
            >
              6M
            </button>
            <button
              type="button"
              class="rounded-md px-2 py-1 text-[11px] font-semibold transition-colors"
              :class="rangoEvolucion === 12 ? 'bg-cyan/15 text-cyan' : 'text-muted hover:text-white'"
              @click="rangoEvolucion = 12"
            >
              1A
            </button>
          </div>
        </div>
        <GraficoEvolucion :key="rangoEvolucion" :datos="evolucionFiltrada" />
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
