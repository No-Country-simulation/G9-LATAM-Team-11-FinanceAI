<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAnalisisFinancieroStore } from '@/stores/analisisFinanciero'
import { useUsuarioStore } from '@/stores/usuario'
import { useDivisaStore } from '@/stores/divisa'
import { formatoMoneda } from '@/utils/formato'
import { etiquetaCategoria, colorCategoria } from '@/utils/categorias'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import GraficoGastos from '@/components/result/GraficoGastos.vue'
import GaugeChart from '@/components/result/GaugeChart.vue'
import RecomendacionesLista from '@/components/result/RecomendacionesLista.vue'

const router = useRouter()
const store = useAnalisisFinancieroStore()
const usuarioStore = useUsuarioStore()
const divisaStore = useDivisaStore()
const { resultado, loading, error } = storeToRefs(store)

const exportando = ref(false)
const menuExportar = ref(false)

function toggleMenuExportar() {
  menuExportar.value = !menuExportar.value
}

function cerrarMenuExportar() {
  menuExportar.value = false
}

// Si el resultado tiene resumen_gastos (análisis actual o historial con dato guardado),
// lo usa directamente. Si no (historial sin dato local), calcula desde transacciones actuales
const resumenGastos = computed(() => {
  if (resultado.value?.resumen_gastos) return resultado.value.resumen_gastos
  const ahora = new Date()
  const mes = ahora.getMonth()
  const anio = ahora.getFullYear()
  const transacciones = usuarioStore.transacciones.filter((t) => {
    if (!t.fecha) return false
    const f = new Date(`${t.fecha}T00:00:00`)
    return f.getMonth() === mes && f.getFullYear() === anio
  })
  if (!transacciones.length) return null
  const porCategoria = {}
  for (const t of transacciones) {
    const categoria = t.categoria || 'otro'
    porCategoria[categoria] = (porCategoria[categoria] || 0) + Number(t.monto || 0)
  }
  return porCategoria
})

// Indica si el gráfico es del análisis histórico o datos actuales
const esGraficoActual = computed(() => !resultado.value?.resumen_gastos)

const colorPerfil = computed(() => {
  if (!resultado.value) return '#94a3b8'
  const p = resultado.value.perfil_financiero
  if (p === 'Saludable') return '#10b981'
  if (p === 'En observación') return '#f59e0b'
  return '#ef4444'
})

const mayorGasto = computed(() => {
  if (!resumenGastos.value) return null
  const entradas = Object.entries(resumenGastos.value)
  if (!entradas.length) return null
  const total = entradas.reduce((sum, [, v]) => sum + v, 0)
  const [categoria, monto] = entradas.sort((a, b) => b[1] - a[1])[0]
  return { categoria, monto, porcentaje: Math.round((monto / total) * 100) }
})

function hoy() {
  return new Date().toISOString().slice(0, 10)
}

function descargarArchivo(contenido, tipo, nombre) {
  const blob = new Blob([contenido], { type: tipo })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nombre
  link.click()
  URL.revokeObjectURL(url)
}

async function exportar(formato) {
  cerrarMenuExportar()
  if (!resultado.value) return
  exportando.value = true
  try {
    if (formato === 'csv') exportarCSV()
    else if (formato === 'json') exportarJSON()
    else if (formato === 'pdf') exportarPDF()
  } finally {
    exportando.value = false
  }
}

function exportarCSV() {
  const res = resultado.value
  const fechaReporte = new Date().toLocaleString('es-AR')
  const lineas = []

  lineas.push(['=== FINANCE AI - REPORTE DE ANALISIS FINANCIERO ==='])
  lineas.push(['Fecha de emision', `"${fechaReporte}"`])
  lineas.push(['Usuario', `"${usuarioStore.nombre || 'Usuario'}"`])
  lineas.push(['Perfil Financiero', `"${res.perfil_financiero || 'No especificado'}"`])
  lineas.push(['Nivel de Endeudamiento (%)', res.nivel_endeudamiento ?? 0])
  lineas.push(['Capacidad de Ahorro (%)', res.frecuencia_ahorro ?? 0])
  lineas.push(['Ingreso Mensual Registrado', usuarioStore.ingresoDisponible ?? 0])
  lineas.push([])

  lineas.push(['--- DISTRIBUCION DE GASTOS POR CATEGORIA ---'])
  lineas.push(['Categoria', 'Monto', 'Etiqueta'])
  if (resumenGastos.value) {
    for (const [cat, monto] of Object.entries(resumenGastos.value)) {
      lineas.push([`"${cat}"`, monto, `"${etiquetaCategoria(cat)}"`])
    }
  }
  lineas.push([])

  lineas.push(['--- RECOMENDACIONES FINANCIERAS ---'])
  lineas.push(['Numero', 'Recomendacion'])
  if (res.recomendaciones?.length) {
    res.recomendaciones.forEach((rec, idx) => {
      lineas.push([idx + 1, `"${String(rec).replace(/"/g, '""')}"`])
    })
  }
  lineas.push([])

  lineas.push(['--- DETALLE DE TRANSACCIONES CONSIDERADAS ---'])
  lineas.push(['Descripcion', 'Monto', 'Categoria', 'Fecha'])
  for (const t of usuarioStore.transacciones) {
    lineas.push([
      `"${String(t.descripcion || '').replace(/"/g, '""')}"`,
      t.monto || 0,
      `"${String(t.categoria || '').replace(/"/g, '""')}"`,
      `"${t.fecha || ''}"`,
    ])
  }

  const csvContenido = lineas.map((fila) => fila.join(',')).join('\n')
  descargarArchivo(csvContenido, 'text/csv;charset=utf-8;', `financeai-analisis-${hoy()}.csv`)
}

function exportarJSON() {
  const datos = {
    meta: {
      aplicacion: 'Finance AI',
      version: '1.0',
      fecha_exportacion: new Date().toISOString(),
      usuario: usuarioStore.nombre,
      ingreso_mensual: usuarioStore.ingresoDisponible,
      moneda: divisaStore.monedaActiva,
    },
    analisis: {
      perfil_financiero: resultado.value.perfil_financiero,
      nivel_endeudamiento: resultado.value.nivel_endeudamiento,
      capacidad_ahorro: resultado.value.frecuencia_ahorro,
      periodo: resultado.value.periodo || 'Mes actual',
      resumen_gastos: resumenGastos.value || {},
      recomendaciones: resultado.value.recomendaciones || [],
    },
    transacciones: usuarioStore.transacciones,
  }

  descargarArchivo(JSON.stringify(datos, null, 2), 'application/json', `financeai-analisis-${hoy()}.json`)
}

function generarSvgGauge(valor, etiqueta, invertido = false) {
  const p = Math.min(100, Math.max(0, Number(valor) || 0))
  let color = '#ef4444'
  if (invertido) {
    if (p < 40) color = '#10b981'
    else if (p < 70) color = '#f59e0b'
  } else {
    if (p > 70) color = '#10b981'
    else if (p > 40) color = '#f59e0b'
  }

  const radio = 70
  const circunf = Math.PI * radio
  const offset = circunf - (p / 100) * circunf

  return `
    <div style="display:inline-flex; flex-direction:column; align-items:center; width:220px; background:#18181b; border:1px solid #27272a; border-radius:12px; padding:16px; margin:8px;">
      <svg width="160" height="90" viewBox="0 0 180 100" style="overflow:visible;">
        <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke="#27272a" stroke-width="14" stroke-linecap="round" />
        <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke="${color}" stroke-width="14" stroke-linecap="round" stroke-dasharray="${circunf}" stroke-dashoffset="${offset}" />
        <text x="90" y="86" text-anchor="middle" font-family="'Space Grotesk', system-ui, sans-serif" font-weight="700" font-size="28" fill="${color}">${Math.round(p)}%</text>
      </svg>
      <span style="font-family:'Space Grotesk', monospace; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:1px; color:#a1a1aa; margin-top:8px;">${etiqueta}</span>
    </div>
  `
}

function generarBarrasGastosHtml(gastos) {
  if (!gastos) return '<p style="color:#71717a;">No hay datos de distribución.</p>'
  const entradas = Object.entries(gastos)
  if (!entradas.length) return '<p style="color:#71717a;">No hay datos de distribución.</p>'

  const max = Math.max(...entradas.map(([, v]) => v), 1)
  const total = entradas.reduce((sum, [, v]) => sum + v, 0)

  let html = '<div style="display:flex; flex-direction:column; gap:10px; margin-top:12px;">'
  for (const [cat, monto] of entradas.sort((a, b) => b[1] - a[1])) {
    const etq = etiquetaCategoria(cat)
    const col = colorCategoria(cat)
    const pct = Math.round((monto / total) * 100)
    const widthPct = Math.round((monto / max) * 100)

    html += `
      <div>
        <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
          <span style="font-weight:600; color:#e4e4e7;">${etq}</span>
          <span style="font-family:monospace; color:#a1a1aa;">${formatoMoneda(monto)} (${pct}%)</span>
        </div>
        <div style="height:10px; background:#27272a; border-radius:5px; overflow:hidden;">
          <div style="height:100%; width:${widthPct}%; background:${col}; border-radius:5px;"></div>
        </div>
      </div>
    `
  }
  html += '</div>'
  return html
}

function exportarPDF() {
  const res = resultado.value
  const fechaStr = new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })
  const gaugeEndeudamiento = generarSvgGauge(res.nivel_endeudamiento ?? 0, 'Nivel de endeudamiento', true)
  const gaugeAhorro = generarSvgGauge(res.frecuencia_ahorro ?? 0, 'Capacidad de ahorro', false)
  const graficoBarras = generarBarrasGastosHtml(resumenGastos.value)

  const recsHtml = res.recomendaciones?.length
    ? `<ol style="padding-left:20px; margin:0; line-height:1.7; color:#e4e4e7;">${res.recomendaciones.map((r) => `<li style="margin-bottom:8px;">${r}</li>`).join('')}</ol>`
    : '<p style="color:#71717a;">Sin recomendaciones generadas.</p>'

  const ventana = window.open('', '_blank')
  if (!ventana) {
    alert('Por favor habilita las ventanas emergentes para exportar a PDF.')
    return
  }

  ventana.document.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Finance AI - Informe Financiero (${hoy()})</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; }
        html, body {
          background-color: #09090b !important;
          color: #f4f4f5 !important;
          margin: 0;
          padding: 0;
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        .container {
          padding: 32px 40px;
          background-color: #09090b;
          min-height: 100vh;
        }
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          html, body {
            background-color: #09090b !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .container {
            padding: 24px 32px !important;
            background-color: #09090b !important;
          }
          .no-print {
            display: none !important;
          }
          .card {
            break-inside: avoid;
          }
        }
        .card {
          background-color: #121215 !important;
          border: 1px solid #27272a;
          border-radius: 14px;
          padding: 22px;
          margin-bottom: 20px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #27272a;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .btn-print {
          background: #00e5ff;
          color: #000;
          font-weight: 700;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-family: inherit;
          font-size: 13px;
          box-shadow: 0 0 15px rgba(0,229,255,0.3);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="no-print" style="margin-bottom:24px; display:flex; justify-content:space-between; align-items:center; background:#18181b; padding:14px 20px; border-radius:10px; border:1px solid #27272a;">
          <span style="font-size:13px; color:#a1a1aa;">Para conservar el fondo oscuro y gráficos idénticos, asegúrate de activar <b>"Gráficos de fondo"</b> en las opciones de impresión.</span>
          <button class="btn-print" onclick="window.print()">Imprimir / Guardar en PDF</button>
        </div>

        <div class="header">
          <div>
            <h1 style="margin:0; font-size:24px; font-weight:800; letter-spacing:-0.5px; color:#ffffff !important;">Finance<span style="color:#00e5ff !important;">AI</span></h1>
            <p style="margin:4px 0 0; font-size:12px; color:#a1a1aa !important;">Informe Completo de Diagnóstico Financiero</p>
          </div>
          <div style="text-align:right;">
            <p style="margin:0; font-size:15px; font-weight:700; color:#ffffff !important;">${usuarioStore.nombre || 'Usuario'}</p>
            <p style="margin:2px 0 0; font-size:11px; font-family:monospace; color:#a1a1aa !important;">${fechaStr}</p>
          </div>
        </div>

        <!-- Perfil Principal -->
        <div class="card" style="text-align:center; padding:28px 16px;">
          <span style="font-family:'Space Grotesk', monospace; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:#a1a1aa;">Perfil Financiero Clasificado</span>
          <h2 style="font-size:32px; font-weight:800; margin:10px 0 0; color:${colorPerfil.value} !important;">${res.perfil_financiero}</h2>
        </div>

        <!-- Gauges Indicadores -->
        <div class="card">
          <h3 style="margin:0 0 16px; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:#a1a1aa; text-align:center;">Indicadores Clave de Desempeño</h3>
          <div style="display:flex; justify-content:center; gap:20px; flex-wrap:wrap;">
            ${gaugeEndeudamiento}
            ${gaugeAhorro}
          </div>
        </div>

        <!-- Distribución de gastos -->
        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <h3 style="margin:0; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:#a1a1aa;">Distribución de Gastos</h3>
            ${mayorGasto.value ? `<span style="font-size:12px; color:#a1a1aa;">Mayor gasto: <strong style="color:#ffffff;">${mayorGasto.value.categoria}</strong> (${mayorGasto.value.porcentaje}%)</span>` : ''}
          </div>
          ${graficoBarras}
        </div>

        <!-- Recomendaciones -->
        <div class="card">
          <h3 style="margin:0 0 14px; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:#a1a1aa;">Recomendaciones Personalizadas</h3>
          ${recsHtml}
        </div>

        <div style="text-align:center; margin-top:30px; font-size:11px; color:#71717a;">
          Generado automáticamente por FinanceAI Intelligence Engine • ${fechaStr}
        </div>
      </div>
    </body>
    </html>
  `)
  ventana.document.close()
}

function irAlAnalisis() {
  router.push({ name: 'analisis' })
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-4xl flex-col gap-6">
    <section v-if="loading" class="flex items-center justify-center py-20" aria-busy="true">
      <p class="text-muted">Analizando tus finanzas…</p>
    </section>

    <section v-else-if="error && !resultado" class="text-center py-12">
      <p class="mb-4 rounded-md border border-danger-edge bg-danger-bg px-4 py-3 text-sm text-danger">{{ error }}</p>
      <BaseButton variante="secundario" @click="irAlAnalisis">
        Volver e intentar de nuevo
      </BaseButton>
    </section>

    <template v-else-if="resultado">
      <!-- Tarjeta unificada: Perfil Financiero + Indicadores Clave en una misma fila -->
      <BaseCard>
        <div class="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
          <!-- Título y Perfil de Riesgo (5 columnas en desktop) -->
          <div class="flex flex-col items-center justify-center border-b border-edge/60 pb-6 text-center md:col-span-5 md:border-b-0 md:border-r md:pb-0 md:pr-6 md:text-left md:items-start">
            <div class="inline-flex items-center gap-2 rounded-full border border-edge bg-surface px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted">
              <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: colorPerfil }" />
              {{ resultado.periodo || 'Diagnóstico actual' }}
            </div>
            <span class="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-faint">Perfil Financiero</span>
            <h1 class="mt-1 text-2xl font-bold tracking-tight md:text-3xl" :style="{ color: colorPerfil }">
              {{ resultado.perfil_financiero }}
            </h1>
            <p class="mt-2 text-xs text-muted leading-relaxed">
              Basado en tus patrones de consumo, nivel de endeudamiento y frecuencia de ahorro del mes.
            </p>
          </div>

          <!-- Gauges Indicadores Clave (7 columnas en desktop) -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-7">
            <GaugeChart
              :valor="resultado.nivel_endeudamiento ?? 0"
              etiqueta="Nivel de endeudamiento"
              invertido
            />
            <GaugeChart
              :valor="resultado.frecuencia_ahorro ?? 0"
              etiqueta="Capacidad de ahorro"
            />
          </div>
        </div>
      </BaseCard>

      <!-- Distribución de gastos -->
      <BaseCard v-if="resumenGastos">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-ink">Distribución de gastos</h2>
          <span v-if="esGraficoActual" class="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
            mes actual
          </span>
        </div>
        <GraficoGastos :gastos="resumenGastos" />
        <p v-if="mayorGasto" class="mt-4 text-center text-xs text-muted">
          Tu mayor gasto es
          <span class="font-semibold text-ink">{{ mayorGasto.categoria }}</span>
          ({{ mayorGasto.porcentaje }}% del total)
        </p>
      </BaseCard>

      <!-- Recomendaciones -->
      <RecomendacionesLista :recomendaciones="resultado.recomendaciones" />

      <div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <BaseButton variante="secundario" @click="irAlAnalisis">
          Volver al análisis
        </BaseButton>

        <!-- Dropdown de exportación -->
        <div class="relative">
          <BaseButton :cargando="exportando" @click="toggleMenuExportar">
            <span class="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Exportar resultados
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="6 9 12 14 18 9" />
              </svg>
            </span>
          </BaseButton>

          <Transition name="dropdown">
            <div
              v-if="menuExportar"
              class="absolute right-0 bottom-full z-10 mb-1 min-w-[170px] overflow-hidden rounded-lg border border-edge bg-surface shadow-xl"
            >
              <button
                type="button"
                class="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-muted transition-colors hover:bg-surface-hover hover:text-white"
                @click="exportar('csv')"
              >
                <span class="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan">CSV</span>
                Hoja de cálculo
              </button>
              <button
                type="button"
                class="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-muted transition-colors hover:bg-surface-hover hover:text-white"
                @click="exportar('json')"
              >
                <span class="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan">JSON</span>
                Datos estructurados
              </button>
              <button
                type="button"
                class="flex w-full items-center gap-2 border-t border-edge px-3.5 py-2.5 text-left text-sm text-muted transition-colors hover:bg-surface-hover hover:text-white"
                @click="exportar('pdf')"
              >
                <span class="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan">PDF</span>
                Informe visual con gráficos
              </button>
            </div>
          </Transition>

          <!-- Overlay para cerrar el menú al hacer click afuera -->
          <div v-if="menuExportar" class="fixed inset-0 z-0" @click="cerrarMenuExportar" />
        </div>
      </div>
    </template>

    <section v-else class="text-center py-12">
      <p class="mb-4 text-sm text-muted">No hay resultados todavía. Analiza tus finanzas para ver tu perfil.</p>
      <BaseButton variante="secundario" @click="irAlAnalisis">
        Ir al análisis
      </BaseButton>
    </section>
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
