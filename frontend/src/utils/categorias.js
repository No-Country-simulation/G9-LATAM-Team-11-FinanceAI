export const CATEGORIAS = {
  alimentacion: { etiqueta: 'Alimentación', color: '#f59e0b' },
  transporte: { etiqueta: 'Transporte', color: '#22d3ee' },
  salud: { etiqueta: 'Salud', color: '#22c55e' },
  vivienda: { etiqueta: 'Vivienda', color: '#8b5cf6' },
  educacion: { etiqueta: 'Educación', color: '#3b82f6' },
  ocio: { etiqueta: 'Ocio', color: '#ec4899' },
  servicios: { etiqueta: 'Servicios', color: '#10b981' },
  ahorros: { etiqueta: 'Ahorros', color: '#34d399' },
  deudas: { etiqueta: 'Deudas', color: '#ef4444' },
}

function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function etiquetaCategoria(categoria) {
  return CATEGORIAS[normalizar(categoria)]?.etiqueta ?? categoria
}

export function colorCategoria(categoria) {
  return CATEGORIAS[normalizar(categoria)]?.color ?? '#8b95a7'
}
