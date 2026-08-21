export const CATEGORIAS = {
  alimentacion: { etiqueta: 'Alimentación', color: '#f97316' },   // naranja — apetito, energía vital
  transporte: { etiqueta: 'Transporte', color: '#64748b' },       // gris azulado — movimiento, industria
  salud: { etiqueta: 'Salud', color: '#14b8a6' },                 // teal — bienestar, frescura
  vivienda: { etiqueta: 'Vivienda', color: '#a16207' },           // terracota/ámbar — hogar, estabilidad
  educacion: { etiqueta: 'Educación', color: '#6366f1' },         // índigo — conocimiento, profundidad
  ocio: { etiqueta: 'Ocio', color: '#a855f7' },                   // violeta — creatividad, diversión
  servicios: { etiqueta: 'Servicios', color: '#0ea5e9' },         // celeste — utilidad, infraestructura
  electrodomesticos: { etiqueta: 'Electrodomésticos', color: '#eab308' }, // amarillo — tecnología, energía
  inversion: { etiqueta: 'Inversión', color: '#10b981' },         // esmeralda — crecimiento, prosperidad
  vestimenta: { etiqueta: 'Vestimenta', color: '#f43f5e' },       // rosa intenso — estilo, expresión
  ahorros: { etiqueta: 'Ahorros', color: '#059669' },             // verde jade — seguridad, acumulación
  deudas: { etiqueta: 'Deudas', color: '#dc2626' },               // rojo — urgencia, alerta
  otro: { etiqueta: 'Otro', color: '#94a3b8' },                   // gris neutro
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
  return CATEGORIAS[normalizar(categoria)]?.color ?? '#94a3b8'
}
