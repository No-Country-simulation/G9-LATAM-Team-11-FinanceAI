# Diseño Técnico: currency-ux-fixes

## Resumen

Breve descripción de los 3 cambios técnicos necesarios.

## Cambios por Archivo

### 1. `frontend/src/components/dashboard/FormularioTransaccion.vue`

**Problema:** La función `validar()` compara `form.monto >= ingresoDisponible.value` sin conversión de moneda.

**Solución:** Convertir `ingresoDisponible` a la moneda activa antes de comparar.

**Código actual:**
```javascript
function validar() {
  if (!form.descripcion.trim()) return 'La descripción es obligatoria.'
  if (!form.monto || form.monto <= 0) return 'Ingresa un monto mayor a 0.'
  if (form.monto >= ingresoDisponible.value) return 'El monto debe ser menor que tu ingreso disponible.'
  if (!form.categoria) return 'Selecciona una categoría.'
  if (!form.fecha) return 'La fecha es obligatoria.'
  return ''
}
```

**Código corregido:**
```javascript
function validar() {
  if (!form.descripcion.trim()) return 'La descripción es obligatoria.'
  if (!form.monto || form.monto <= 0) return 'Ingresa un monto mayor a 0.'
  const limiteEnMonedaActiva = divisaStore.convertirDesdeUSD(ingresoDisponible.value)
  if (form.monto >= limiteEnMonedaActiva) return 'El monto debe ser menor que tu ingreso disponible.'
  if (!form.categoria) return 'Selecciona una categoría.'
  if (!form.fecha) return 'La fecha es obligatoria.'
  return ''
}
```

**Explicación:** `convertirDesdeUSD(ingresoDisponible)` multiplica el ingreso (en USD) por `tasaActiva`, convirtiendo el límite a la misma moneda que el usuario está ingresando. Cuando la moneda es USD, `tasaActiva === 1`, por lo que la comparación es directa.

### 2. `frontend/src/stores/divisa.js`

**Problema:** `monedasDisponibles` retorna todas las monedas del API sin filtrar.

**Solución:** Agregar una constante `MONEDAS_PRINCIPALES` (whitelist) y filtrar el computed.

**Código actual:**
```javascript
const monedasDisponibles = computed(() => {
  const codigos = Object.keys(tasas.value)
  if (!codigos.includes('USD')) codigos.unshift('USD')
  return codigos.sort()
})
```

**Código corregido:**
```javascript
/**
 * Whitelist de monedas principales del mundo (enfocada en usuarios LATAM).
 */
const MONEDAS_PRINCIPALES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CLP', 'ARS', 'BRL',
  'MXN', 'CAD', 'AUD', 'CNY', 'CHF', 'COP', 'PEN',
]

const monedasDisponibles = computed(() => {
  const disponibles = MONEDAS_PRINCIPALES.filter(
    codigo => codigo === 'USD' || tasas.value[codigo] != null
  )
  return disponibles.sort()
})
```

**Explicación:** USD siempre se incluye (tasa implícita 1). Las demás solo aparecen si el API retornó una tasa para ellas. Esto reduce de 30+ a ~14 opciones.

**Cambio adicional - Fallback para moneda activa fuera de whitelist:**

Agregar un watcher o guard en `cargarTasas()` para que si la moneda activa almacenada en localStorage no está en `MONEDAS_PRINCIPALES`, haga fallback a USD:

```javascript
async function cargarTasas() {
  cargando.value = true
  error.value = false
  try {
    tasas.value = await obtenerTasasDeCambio()
    // Fallback si la moneda activa no está en la whitelist
    if (!MONEDAS_PRINCIPALES.includes(monedaActiva.value)) {
      seleccionarMoneda('USD')
    }
  } catch {
    tasas.value = {}
    error.value = true
  } finally {
    cargando.value = false
  }
}
```

**Exportar la constante** para que los tests puedan verificarla:
```javascript
return {
  // ... existing exports
  MONEDAS_PRINCIPALES,
}
```

### 3. `frontend/src/components/nav/AppNav.vue`

**Problema:** `SelectorMoneda` está dentro del div de usuario (derecha), apilado con nombre y botón "Salir".

**Solución:** Mover `SelectorMoneda` al `<nav>` central, después de los enlaces de navegación.

**Template actual:**
```html
<nav class="hidden items-center gap-7 md:flex" aria-label="Principal">
  <RouterLink v-for="enlace in enlaces" ...>{{ enlace.etiqueta }}</RouterLink>
</nav>

<div class="flex items-center gap-2.5">
  <template v-if="auth.sesionActiva">
    <SelectorMoneda />
    <span ...>{{ nombre }}</span>
    <BaseButton ...>Salir</BaseButton>
  </template>
</div>
```

**Template corregido:**
```html
<nav class="hidden items-center gap-7 md:flex" aria-label="Principal">
  <RouterLink v-for="enlace in enlaces" ...>{{ enlace.etiqueta }}</RouterLink>
  <SelectorMoneda v-if="auth.sesionActiva" />
</nav>

<div class="flex items-center gap-2.5">
  <template v-if="auth.sesionActiva">
    <span ...>{{ nombre }}</span>
    <BaseButton ...>Salir</BaseButton>
  </template>
  <BaseButton v-else ...>Entrar</BaseButton>
</div>
```

**Explicación:** El selector ahora está en la zona de navegación central con `hidden md:flex` heredado del nav padre. Se le agrega `v-if="auth.sesionActiva"` para que solo aparezca cuando hay sesión activa. El área derecha queda limpia con solo nombre + botón.

## Propiedades de Correctitud (PBT)

### Property Test 1: Validación consistente con conversión de moneda
```javascript
// Para todo monto M > 0 y tasa T > 0 e ingreso I > 0:
// validar() acepta M ⟺ M < I * T
fc.property(
  fc.double({ min: 0.01, max: 1_000_000, noNaN: true }), // monto
  fc.double({ min: 0.0001, max: 100_000, noNaN: true }), // tasa
  fc.double({ min: 100, max: 100_000, noNaN: true }),     // ingreso USD
  (monto, tasa, ingreso) => {
    // Setup: store con tasaActiva = tasa, ingresoDisponible = ingreso
    const limiteEnMonedaActiva = ingreso * tasa
    const validacionPasa = monto < limiteEnMonedaActiva
    // Assert: validar() acepta si y solo si monto < ingreso * tasa
  }
)
```

### Property Test 2: Whitelist es subconjunto del API
```javascript
// Para todo mapa de tasas arbitrario:
// monedasDisponibles ⊆ MONEDAS_PRINCIPALES
// Y cada código en monedasDisponibles (excepto USD) tiene tasa > 0
fc.property(
  fc.dictionary(
    fc.stringOf(fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), { minLength: 3, maxLength: 3 }),
    fc.double({ min: 0.0001, max: 100000, noNaN: true })
  ),
  (tasasMap) => {
    // Setup: store.tasas = tasasMap
    // Assert: every code in monedasDisponibles is in MONEDAS_PRINCIPALES
    // Assert: every code !== 'USD' has tasasMap[code] > 0
  }
)
```

## Impacto en Tests Existentes

- Los property tests existentes de `divisa.pbt.spec.js` (Properties 1-8) no se ven afectados ya que prueban funciones de conversión, no el computed `monedasDisponibles` ni la validación del formulario.
- Los nuevos PBT se agregarán al mismo archivo de tests del store.

## Archivos Modificados

| Archivo | Tipo de cambio |
|---------|---------------|
| `frontend/src/components/dashboard/FormularioTransaccion.vue` | Fix validación (1 línea) |
| `frontend/src/stores/divisa.js` | Whitelist + filtrado + fallback |
| `frontend/src/components/nav/AppNav.vue` | Mover selector al nav central |

## Diagrama de Flujo de Validación Corregido

```
form.monto (en monedaActiva)
        │
        ▼
limiteEnMonedaActiva = convertirDesdeUSD(ingresoDisponible)
        │                    = ingresoDisponible * tasaActiva
        ▼
form.monto >= limiteEnMonedaActiva ?
   ├── Sí → Error: "El monto debe ser menor que tu ingreso disponible."
   └── No → Continúa validación...
              │
              ▼
         enviar():
         montoUSD = convertirAUSD(form.monto)
                  = form.monto / tasaActiva
              │
              ▼
         backend recibe monto en USD ✓
```
