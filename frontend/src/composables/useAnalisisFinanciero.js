import { useAnalisisFinancieroStore } from '@/stores/analisisFinanciero'
import { useUsuarioStore } from '@/stores/usuario'
import { enviarAnalisisFinanciero } from '@/services/analisis'
import { etiquetaCategoria } from '@/utils/categorias'

/**
 * Composable de análisis financiero.
 *
 * FLUJO:
 * 1. Intenta enviar los datos al backend (POST /analisis-financiero)
 * 2. Si el backend responde → usa la respuesta real (perfil, recomendaciones de DS)
 * 3. Si el backend falla (endpoint no implementado aún) → genera un análisis LOCAL
 *    con heurísticas simples como fallback temporal.
 *
 * CUANDO EL BACKEND IMPLEMENTE /analisis-financiero:
 * - El try va a funcionar y el catch nunca se ejecuta
 * - No se necesita cambiar nada en el frontend
 * - Las recomendaciones vendrán del modelo de Data Science
 */
export function useAnalisisFinanciero() {
  const store = useAnalisisFinancieroStore()
  const usuarioStore = useUsuarioStore()

  async function enviarAnalisis() {
    store.setLoading(true)
    store.setError('')

    const ingreso = Number(usuarioStore.ingresoDisponible || 0)
    const transacciones = usuarioStore.transacciones
      .filter((t) => t.descripcion?.trim() && t.monto != null)

    if (transacciones.length === 0) {
      store.setError('Necesitas al menos una transacción registrada para analizar tus finanzas.')
      store.setLoading(false)
      throw new Error('Sin transacciones')
    }

    const endeudamiento = calcularEndeudamiento(transacciones, ingreso)
    const frecuenciaAhorro = calcularFrecuenciaAhorro(transacciones, ingreso)

    // Payload con el contrato esperado por el backend
    const payload = {
      ingreso_mensual: ingreso,
      nivel_endeudamiento: endeudamiento,
      frecuencia_ahorro: frecuenciaAhorro,
      transacciones: transacciones.map((t) => ({
        descripcion: t.descripcion.trim(),
        valor: Number(t.monto),
      })),
    }

    try {
      // ═══════════════════════════════════════════════════════════════
      // RESPUESTA REAL DEL BACKEND (cuando exista POST /analisis-financiero)
      // El backend usará modelo_perfil.onnx para clasificar y retornará:
      // { perfil_financiero, probabilidad, resumen_gastos, recomendaciones }
      // ═══════════════════════════════════════════════════════════════
      const resultado = await enviarAnalisisFinanciero(payload)
      store.setResultado(resultado)
      return resultado
    } catch {
      // ═══════════════════════════════════════════════════════════════
      // MOCK TEMPORAL — Análisis generado localmente en el frontend
      // Se activa porque el endpoint /analisis-financiero NO existe aún.
      // Usa heurísticas simples, NO modelos de ML.
      // Eliminar este bloque cuando backend esté listo.
      // ═══════════════════════════════════════════════════════════════
      const resultadoMock = generarAnalisisMock(transacciones, ingreso, endeudamiento, frecuenciaAhorro)
      store.setResultado(resultadoMock)
      return resultadoMock
    } finally {
      store.setLoading(false)
    }
  }

  return { enviarAnalisis }
}

// ─────────────────────────────────────────────────────────────────────────────
// Cálculos automáticos (estos se usan siempre, tanto para el payload al backend
// como para el mock local)
// ─────────────────────────────────────────────────────────────────────────────

function calcularEndeudamiento(transacciones, ingreso) {
  const ahora = new Date()
  const gastoMes = transacciones
    .filter((t) => {
      if (!t.fecha) return false
      const fecha = new Date(`${t.fecha}T00:00:00`)
      return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear()
    })
    .reduce((total, t) => total + Number(t.monto || 0), 0)

  if (!ingreso || ingreso <= 0) return 0
  return Math.min(100, Math.round((gastoMes / ingreso) * 100))
}

function calcularFrecuenciaAhorro(transacciones, ingreso) {
  if (!ingreso || ingreso <= 0) return 'Baja'

  const totalGastado = transacciones.reduce((sum, t) => sum + Number(t.monto || 0), 0)
  const meses = contarMesesConTransacciones(transacciones)
  const promedioMensual = meses > 0 ? totalGastado / meses : totalGastado

  const ratioGasto = promedioMensual / ingreso

  if (ratioGasto < 0.5) return 'Alta'
  if (ratioGasto < 0.8) return 'Media'
  return 'Baja'
}

function contarMesesConTransacciones(transacciones) {
  const mesesUnicos = new Set()
  for (const t of transacciones) {
    if (t.fecha) {
      const fecha = new Date(`${t.fecha}T00:00:00`)
      mesesUnicos.add(`${fecha.getFullYear()}-${fecha.getMonth()}`)
    }
  }
  return Math.max(1, mesesUnicos.size)
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK TEMPORAL — Todo lo que sigue se elimina cuando backend tenga el endpoint
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

function calcularResumenGastos(transacciones) {
  const porCategoria = {}
  for (const t of transacciones) {
    const categoria = t.categoria || 'otro'
    porCategoria[categoria] = (porCategoria[categoria] || 0) + Number(t.monto || 0)
  }
  return porCategoria
}

function determinarPerfil(endeudamiento, frecuenciaAhorro) {
  let puntaje = 0

  if (endeudamiento < 30) puntaje += 3
  else if (endeudamiento < 60) puntaje += 2
  else if (endeudamiento < 80) puntaje += 1

  if (frecuenciaAhorro === 'Alta') puntaje += 3
  else if (frecuenciaAhorro === 'Media') puntaje += 2
  else puntaje += 1

  if (puntaje >= 5) {
    return { nombre: 'Saludable', probabilidad: 0.7 + (puntaje - 5) * 0.1 }
  }
  if (puntaje >= 3) {
    return { nombre: 'En observación', probabilidad: 0.5 + (puntaje - 3) * 0.1 }
  }
  return { nombre: 'En riesgo', probabilidad: 0.6 + (2 - puntaje) * 0.15 }
}

/**
 * Genera recomendaciones basadas en heurísticas simples.
 * NOTA: Estas NO son recomendaciones de ML — son reglas fijas del frontend.
 * Cuando el backend implemente /analisis-financiero, las recomendaciones
 * vendrán del modelo de Data Science y este código no se ejecutará.
 */
function generarRecomendaciones(resumenGastos, ingreso, endeudamiento, frecuenciaAhorro) {
  const recomendaciones = []
  const entradas = Object.entries(resumenGastos).sort((a, b) => b[1] - a[1])
  const totalGastos = entradas.reduce((sum, [, monto]) => sum + monto, 0)

  // Alerta de endeudamiento alto
  if (endeudamiento > 70) {
    recomendaciones.push(
      'Tu nivel de gasto supera el 70% de tu ingreso. Revisa tus gastos fijos y busca reducir los no esenciales para evitar sobreendeudarte.',
    )
  } else if (endeudamiento > 50) {
    recomendaciones.push(
      'Estás gastando más de la mitad de tu ingreso. Intenta mantener tus gastos por debajo del 50% para tener un colchón financiero.',
    )
  }

  // Ahorro
  if (frecuenciaAhorro === 'Baja') {
    recomendaciones.push(
      'Tu capacidad de ahorro es baja. Un buen objetivo es ahorrar entre el 10% y el 20% de tu ingreso mensual. Automatizar una transferencia a una cuenta aparte puede ayudar.',
    )
  } else if (frecuenciaAhorro === 'Media') {
    recomendaciones.push(
      'Tu nivel de ahorro es moderado. Para mejorar, identifica un gasto recurrente que puedas reducir y redirige ese monto al ahorro.',
    )
  }

  // Análisis por categoría (top 3)
  for (const [categoria, monto] of entradas.slice(0, 3)) {
    const porcentaje = Math.round((monto / totalGastos) * 100)
    const nombre = etiquetaCategoria(categoria)

    if (porcentaje > 40) {
      recomendaciones.push(
        `${nombre} concentra el ${porcentaje}% de tus gastos totales. Considera buscar alternativas más económicas o establecer un tope mensual para esta categoría.`,
      )
    } else if (porcentaje > 25) {
      recomendaciones.push(
        `${nombre} es tu categoría de mayor gasto (${porcentaje}% del total). Revisa si hay suscripciones o compras que puedas optimizar.`,
      )
    }
  }

  // Categorías específicas con alertas
  if (resumenGastos['Ocio'] || resumenGastos['ocio']) {
    const gastoOcio = (resumenGastos['Ocio'] || 0) + (resumenGastos['ocio'] || 0)
    if (ingreso > 0 && gastoOcio / ingreso > 0.15) {
      recomendaciones.push(
        'Tus gastos en ocio superan el 15% de tu ingreso. Establece un presupuesto fijo para entretenimiento y respétalo cada mes.',
      )
    }
  }

  if (resumenGastos['deudas'] || resumenGastos['Deudas']) {
    const gastoDeudas = (resumenGastos['deudas'] || 0) + (resumenGastos['Deudas'] || 0)
    if (ingreso > 0 && gastoDeudas / ingreso > 0.2) {
      recomendaciones.push(
        'Tus pagos de deuda son significativos (más del 20% de tu ingreso). Evalúa opciones de consolidación o renegociación de tasas.',
      )
    }
  }

  // Recomendación positiva si está bien
  if (endeudamiento < 40 && frecuenciaAhorro === 'Alta') {
    recomendaciones.push(
      'Tu manejo financiero es sólido. Considera destinar parte de tu ahorro a inversiones de bajo riesgo para generar rendimientos a mediano plazo.',
    )
  } else if (endeudamiento < 50 && frecuenciaAhorro === 'Media') {
    recomendaciones.push(
      'Vas por buen camino. Con pequeños ajustes en tus gastos variables podrías pasar de un ahorro moderado a uno alto.',
    )
  }

  // Si pocas transacciones
  if (entradas.length < 5) {
    recomendaciones.push(
      'Tienes pocas transacciones registradas. Cuantos más gastos registres, más preciso será tu análisis y mejores las recomendaciones.',
    )
  }

  return recomendaciones.slice(0, 6)
}
