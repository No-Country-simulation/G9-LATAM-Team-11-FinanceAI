export const REQUISITOS_PASSWORD = [
  { clave: 'longitud', etiqueta: 'Al menos 8 caracteres', test: (password) => password.length >= 8 },
  { clave: 'minuscula', etiqueta: 'Al menos una minúscula', test: (password) => /[a-z]/.test(password) },
  { clave: 'numero', etiqueta: 'Al menos un número', test: (password) => /\d/.test(password) },
  { clave: 'especial', etiqueta: 'Al menos un símbolo', test: (password) => /[^A-Za-z0-9]/.test(password) },
]

export function verificarPassword(password) {
  return REQUISITOS_PASSWORD.map((requisito) => ({
    ...requisito,
    cumple: requisito.test(password),
  }))
}

export function passwordEsValida(password) {
  return REQUISITOS_PASSWORD.every((requisito) => requisito.test(password))
}
