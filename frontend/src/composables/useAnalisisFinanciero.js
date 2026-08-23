import { useAnalisisFinancieroStore } from '@/stores/analisisFinanciero'
import { useUsuarioStore } from '@/stores/usuario'
import { guardarAnalisisFinanciero, obtenerHistorialAnalisis } from '@/services/analisis'
import { obtenerFrecuenciaAhorro, obtenerEndeudamiento } from '@/services/perfil'
import { etiquetaCategoria } from '@/utils/categorias'

const CLAVE_RESUMENES = 'financeai:resumenes-gastos'

function guardarResumenLocal(idUsuario, idAnalisis, resumenGastos) {
  if (!idUsuario) return
  try {
    const resumenes = JSON.parse(localStorage.getItem(CLAVE_RESUMENES) || '{}')
    const claveUser = `u_${idUsuario}`
    resumenes[claveUser] = resumenes[claveUser] || {}
    resumenes[claveUser][idAnalisis] = resumenGastos
    localStorage.setItem(CLAVE_RESUMENES, JSON.stringify(resumenes))
  } catch {
    // si localStorage falla, no es crítico
  }
}

function obtenerResumenLocal(idUsuario, idAnalisis) {
  if (!idUsuario) return null
  try {
    const resumenes = JSON.parse(localStorage.getItem(CLAVE_RESUMENES) || '{}')
    const claveUser = `u_${idUsuario}`
    return resumenes[claveUser]?.[idAnalisis] ?? null
  } catch {
    return null
  }
}

/**
 * Composable de análisis financiero.
 *
 * FLUJO:
 * 1. Intenta llamar al backend (POST /analisisfinanciero/guardar/{idUsuario})
 * 2. El backend calcula perfil, endeudamiento, ahorro y recomendaciones con DS
 * 3. El frontend mapea la respuesta y complementa con datos locales (resumen_gastos, ratio)
 * 4. Si el backend falla → fallback con análisis local (mock)
 */
export function useAnalisisFinanciero() {
  const store = useAnalisisFinancieroStore()
  const usuarioStore = useUsuarioStore()

  async function cargarPerfilBackend() {
    if (!usuarioStore.id) return
    try {
      const [frecuencia, endeudamiento] = await Promise.all([
        obtenerFrecuenciaAhorro(usuarioStore.id).catch(() => null),
        obtenerEndeudamiento(usuarioStore.id).catch(() => null),
      ])
      if (frecuencia) store.setFrecuenciaAhorro(frecuencia)
      if (endeudamiento !== null) store.setEndeudamientoBackend(endeudamiento)
    } catch {
      // fallo silencioso
    }
  }

  async function enviarAnalisis() {
    store.setLoading(true)
    store.setError('')

    const ingreso = Number(usuarioStore.ingresoDisponible || 0)
    const ahora = new Date()
    const mesActual = ahora.getMonth()
    const anioActual = ahora.getFullYear()

    const transacciones = usuarioStore.transacciones
      .filter((t) => t.descripcion?.trim() && t.monto != null)
      .filter((t) => {
        if (!t.fecha) return false
        const fecha = new Date(`${t.fecha}T00:00:00`)
        return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual
      })

    if (transacciones.length === 0) {
      store.setError('No tienes transacciones registradas este mes para analizar.')
      store.setLoading(false)
      throw new Error('Sin transacciones del mes actual')
    }

    const resumenGastos = calcularResumenGastos(transacciones)
    const totalGastado = Object.values(resumenGastos).reduce((s, m) => s + m, 0)
    const ratioGastoIngreso = ingreso > 0 ? Math.min(100, Math.round((totalGastado / ingreso) * 100)) : 0

    try {
      const respBackend = await guardarAnalisisFinanciero(usuarioStore.id)
      const resultadoMapped = mapearRespuestaBackend(respBackend, resumenGastos, ratioGastoIngreso)
      guardarResumenLocal(usuarioStore.id, respBackend.id, resumenGastos)
      store.setResultado(resultadoMapped)
      return resultadoMapped
    } catch (err) {
      console.warn('Error backend analisis, usando calculo local fallback:', err)
      const endeudamiento = calcularEndeudamiento(transacciones, ingreso)
      const frecuenciaAhorro = calcularFrecuenciaAhorro(transacciones, ingreso)
      const resultadoMock = generarAnalisisMock(transacciones, ingreso, endeudamiento, frecuenciaAhorro)
      store.setResultado(resultadoMock)
      return resultadoMock
    } finally {
      store.setLoading(false)
    }
  }

  async function cargarHistorial() {
    if (!usuarioStore.id) return []
    try {
      const historial = await obtenerHistorialAnalisis(usuarioStore.id)
      return Array.isArray(historial)
        ? historial.slice(0, 10).map((e) => mapearEntradaHistorial(e, usuarioStore.id))
        : []
    } catch {
      return []
    }
  }

  return { enviarAnalisis, cargarHistorial, cargarPerfilBackend }
}

// ─────────────────────────────────────────────────────────────────────────────
// Mapeo de respuesta del backend al formato del frontend
// ─────────────────────────────────────────────────────────────────────────────

function mapearRespuestaBackend(resp, resumenGastos, ratioGastoIngreso) {
  // nivelAhorro del backend es string ("ALTA", "MEDIA", "BAJA") → mapear a número
  const mapaAhorro = { ALTA: 85, MEDIA: 55, BAJA: 25 }
  const frecuenciaAhorro = mapaAhorro[String(resp.nivelAhorro).toUpperCase()] ?? 50

  // recomendaciones del backend es un string largo → split por frases
  const recomendaciones = resp.recomendaciones
    ? resp.recomendaciones.split(/[.!]\s+/).filter((r) => r.trim().length > 10).map((r) => r.trim() + '.')
    : []

  return {
    perfil_financiero: resp.perfilFinanciero,
    probabilidad: calcularProbabilidadDesdeNivel(resp.nivelDeEndeudamiento, frecuenciaAhorro),
    resumen_gastos: resumenGastos,
    recomendaciones,
    nivel_endeudamiento: resp.nivelDeEndeudamiento ?? 0,
    frecuencia_ahorro: frecuenciaAhorro,
    ratio_gasto_ingreso: ratioGastoIngreso,
    fecha_analisis: resp.fechaDeAnalisis,
    periodo: resp.fechaDeMesesAnalisis,
  }
}

function mapearEntradaHistorial(entrada, idUsuario) {
  const mapaAhorro = { ALTA: 85, MEDIA: 55, BAJA: 25 }
  const frecuenciaAhorro = mapaAhorro[String(entrada.nivelAhorro).toUpperCase()] ?? 50

  // recomendaciones del historial también viene como string
  const recomendaciones = entrada.recomendaciones
    ? entrada.recomendaciones.split(/[.!]\s+/).filter((r) => r.trim().length > 10).map((r) => r.trim() + '.')
    : []

  // Recuperar resumen de gastos guardado localmente al momento del análisis para este usuario
  const resumenGastos = obtenerResumenLocal(idUsuario, entrada.id)

  return {
    id: entrada.id,
    fecha: entrada.fechaDeAnalisis,
    perfil_financiero: entrada.perfilFinanciero,
    probabilidad: calcularProbabilidadDesdeNivel(entrada.nivelDeEndeudamiento, frecuenciaAhorro),
    nivel_endeudamiento: entrada.nivelDeEndeudamiento ?? 0,
    frecuencia_ahorro: frecuenciaAhorro,
    ratio_gasto_ingreso: 0,
    resumen_gastos: resumenGastos,
    recomendaciones,
    periodo: entrada.fechaDeMesesAnalisis,
  }
}

function calcularProbabilidadDesdeNivel(endeudamiento, ahorro) {
  // Heurística: combina endeudamiento y ahorro para una probabilidad de clasificación
  const puntaje = ((100 - (endeudamiento || 0)) + ahorro) / 200
  return Math.min(0.95, Math.max(0.3, puntaje))
}

// ─────────────────────────────────────────────────────────────────────────────
// Cálculos locales (para complementar datos y para el fallback)
// ─────────────────────────────────────────────────────────────────────────────

function calcularResumenGastos(transacciones) {
  const porCategoria = {}
  for (const t of transacciones) {
    const categoria = t.categoria || 'otro'
    porCategoria[categoria] = (porCategoria[categoria] || 0) + Number(t.monto || 0)
  }
  return porCategoria
}

function normalizarCat(cat) {
  return String(cat || 'otro')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function calcularEndeudamiento(transacciones, ingreso) {
  if (!ingreso || ingreso <= 0) return 0
  const gastosFijos = transacciones
    .filter((t) => {
      const c = normalizarCat(t.categoria)
      return c === 'vivienda' || c === 'servicios'
    })
    .reduce((total, t) => total + Number(t.monto || 0), 0)

  if (gastosFijos > 0) {
    return Math.min(100, Math.round((gastosFijos / ingreso) * 100))
  }
  const totalGastos = transacciones.reduce((total, t) => total + Number(t.monto || 0), 0)
  return Math.min(100, Math.round((totalGastos / ingreso) * 100))
}

function calcularFrecuenciaAhorro(transacciones) {
  const inversiones = transacciones.filter((t) => {
    const c = normalizarCat(t.categoria)
    return c === 'inversion' || c === 'inversión' || c === 'ahorros'
  }).length

  if (inversiones === 0) return 'Baja'
  if (inversiones === 1) return 'Baja'
  if (inversiones === 2) return 'Media'
  return 'Alta'
}

// ─────────────────────────────────────────────────────────────────────────────
// FALLBACK — Análisis local si backend no responde
// ─────────────────────────────────────────────────────────────────────────────

function generarAnalisisMock(transacciones, ingreso, endeudamiento, frecuenciaAhorro) {
  const resumenGastos = calcularResumenGastos(transacciones)
  const perfil = determinarPerfil(endeudamiento, frecuenciaAhorro)
  const recomendaciones = generarRecomendaciones(resumenGastos, ingreso, endeudamiento, frecuenciaAhorro)

  const totalGastos = transacciones.reduce((sum, t) => sum + Number(t.monto || 0), 0)
  const ratioGastoIngreso = ingreso > 0 ? Math.min(100, Math.round((totalGastos / ingreso) * 100)) : 0
  const frecuenciaAhorroNumero = frecuenciaAhorro === 'Alta' ? 85 : frecuenciaAhorro === 'Media' ? 55 : 25

  return {
    perfil_financiero: perfil.nombre,
    probabilidad: perfil.probabilidad,
    resumen_gastos: resumenGastos,
    recomendaciones,
    nivel_endeudamiento: endeudamiento,
    frecuencia_ahorro: frecuenciaAhorroNumero,
    ratio_gasto_ingreso: ratioGastoIngreso,
  }
}

function determinarPerfil(endeudamiento, frecuenciaAhorro) {
  let puntaje = 0
  if (endeudamiento < 30) puntaje += 3
  else if (endeudamiento < 60) puntaje += 2
  else if (endeudamiento < 80) puntaje += 1

  if (frecuenciaAhorro === 'Alta') puntaje += 3
  else if (frecuenciaAhorro === 'Media') puntaje += 2
  else puntaje += 1

  if (puntaje >= 5) return { nombre: 'Saludable', probabilidad: 0.7 + (puntaje - 5) * 0.1 }
  if (puntaje >= 3) return { nombre: 'En observación', probabilidad: 0.5 + (puntaje - 3) * 0.1 }
  return { nombre: 'En riesgo', probabilidad: 0.6 + (2 - puntaje) * 0.15 }
}

function generarRecomendaciones(resumenGastos, ingreso, endeudamiento, frecuenciaAhorro) {
  const recomendaciones = []
  const entradas = Object.entries(resumenGastos).sort((a, b) => b[1] - a[1])
  const totalGastos = entradas.reduce((sum, [, monto]) => sum + monto, 0)

  if (endeudamiento > 70) {
    recomendaciones.push('Tu nivel de gasto supera el 70% de tu ingreso. Revisa tus gastos fijos y busca reducir los no esenciales.')
  } else if (endeudamiento > 50) {
    recomendaciones.push('Estás gastando más de la mitad de tu ingreso. Intenta mantener tus gastos por debajo del 50%.')
  }

  if (frecuenciaAhorro === 'Baja') {
    recomendaciones.push('Tu capacidad de ahorro es baja. Intenta ahorrar entre el 10% y el 20% de tu ingreso mensual.')
  }

  for (const [categoria, monto] of entradas.slice(0, 3)) {
    const porcentaje = Math.round((monto / totalGastos) * 100)
    const nombre = etiquetaCategoria(categoria)
    if (porcentaje > 40) {
      recomendaciones.push(`${nombre} concentra el ${porcentaje}% de tus gastos. Considera establecer un tope mensual.`)
    }
  }

  if (endeudamiento < 40 && frecuenciaAhorro === 'Alta') {
    recomendaciones.push('Tu manejo financiero es sólido. Considera inversiones de bajo riesgo para generar rendimientos.')
  }

  return recomendaciones.slice(0, 6)
}
