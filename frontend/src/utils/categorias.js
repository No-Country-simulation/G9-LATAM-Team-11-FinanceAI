export const CATEGORIAS = {
  alimentacion: { etiqueta: 'Alimentación', color: '#f59e0b' },
  transporte: { etiqueta: 'Transporte', color: '#22d3ee' },
  salud: { etiqueta: 'Salud', color: '#80dd4eff' },
  vivienda: { etiqueta: 'Vivienda', color: '#8b5cf6' },
  educacion: { etiqueta: 'Educación', color: '#3b82f6' },
  ocio: { etiqueta: 'Ocio', color: '#ec4899' },
  servicios: { etiqueta: 'Servicios', color: '#8c3a90ff' },
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
