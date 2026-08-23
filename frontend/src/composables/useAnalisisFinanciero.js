import { useAnalisisFinancieroStore } from '@/stores/analisisFinanciero'
import { useUsuarioStore } from '@/stores/usuario'
import { guardarAnalisisFinanciero, obtenerHistorialAnalisis } from '@/services/analisis'
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

    // Datos locales que el backend no devuelve
    const resumenGastos = calcularResumenGastos(transacciones)
    const totalGastos = transacciones.reduce((sum, t) => sum + Number(t.monto || 0), 0)
    // Usar ingresoOriginal para ratio consistente con el dashboard
    const ingresoBase = Number(usuarioStore.ingresoOriginal || ingreso || 0)
    const ratioGastoIngreso = ingresoBase > 0 ? Math.min(100, Math.round((totalGastos / ingresoBase) * 100)) : 0

    try {
      // Llamar al backend real
      const backendResp = await guardarAnalisisFinanciero(usuarioStore.id)

      // Mapear respuesta del backend al formato del frontend
      const resultado = mapearRespuestaBackend(backendResp, resumenGastos, ratioGastoIngreso)

      // Guardar resumen de gastos en localStorage indexado por id del usuario y del análisis
      if (backendResp.id) {
        guardarResumenLocal(usuarioStore.id, backendResp.id, resumenGastos)
      }

      store.setResultado(resultado)
      return resultado
    } catch {
      // Fallback: análisis local si el backend falla
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

  return { enviarAnalisis, cargarHistorial }
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

function calcularEndeudamiento(transacciones, ingreso) {
  const totalGastos = transacciones.reduce((total, t) => total + Number(t.monto || 0), 0)
  if (!ingreso || ingreso <= 0) return 0
  return Math.min(100, Math.round((totalGastos / ingreso) * 100))
}

function calcularFrecuenciaAhorro(transacciones, ingreso) {
  if (!ingreso || ingreso <= 0) return 'Baja'
  const totalGastado = transacciones.reduce((sum, t) => sum + Number(t.monto || 0), 0)
  const ratioGasto = totalGastado / ingreso
  if (ratioGasto < 0.5) return 'Alta'
  if (ratioGasto < 0.8) return 'Media'
  return 'Baja'
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
