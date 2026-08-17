export const CATEGORIAS = {
  alimentacion: { etiqueta: 'Alimentación', color: '#f59e0b' },
  transporte: { etiqueta: 'Transporte', color: '#22d3ee' },
  salud: { etiqueta: 'Salud', color: '#80dd4eff' },
  vivienda: { etiqueta: 'Vivienda', color: '#8b5cf6' },
  educacion: { etiqueta: 'Educación', color: '#3b82f6' },
  ocio: { etiqueta: 'Ocio', color: '#ec4899' },
  servicios: { etiqueta: 'Servicios', color: '#8c3a90ff' },
  electrodomesticos: { etiqueta: 'Electrodomésticos', color: '#6366f1' },
  inversion: { etiqueta: 'Inversión', color: '#34d399' },
  vestimenta: { etiqueta: 'Vestimenta', color: '#f472b6' },
  ahorros: { etiqueta: 'Ahorros', color: '#10b981' },
  deudas: { etiqueta: 'Deudas', color: '#ef4444' },
  otro: { etiqueta: 'Otro', color: '#8b95a7' },
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
