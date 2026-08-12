import axios from 'axios'

const FRANKFURTER_URL = 'https://api.frankfurter.dev/v2/rates'
const TIMEOUT_MS = 10000

/**
 * @typedef {{ date: string, base: string, quote: string, rate: number }} EntradaTasa
 */

/**
 * Transforma el array de respuesta v2 en un mapa quote → rate.
 * - Excluye entradas donde quote === base (USD).
 * - Si hay duplicados de quote, la última entrada prevalece.
 * @param {EntradaTasa[]} entradas - Array de la respuesta de Frankfurter v2
 * @returns {Record<string, number>} Mapa de tasas
 */
export function transformarRespuestaV2(entradas) {
  const mapa = {}
  for (const entrada of entradas) {
    if (entrada.quote !== entrada.base) {
      mapa[entrada.quote] = entrada.rate
    }
  }
  return mapa
}

/**
 * Obtiene las tasas de cambio desde Frankfurter API v2.
 * @returns {Promise<Record<string, number>>} Mapa código_moneda → tasa
 * @throws {Error} Si la API falla, timeout, o error de red
 */
export async function obtenerTasasDeCambio() {
  const { data } = await axios.get(FRANKFURTER_URL, {
    params: { base: 'USD' },
    timeout: TIMEOUT_MS,
  })
  return transformarRespuestaV2(data)
}
