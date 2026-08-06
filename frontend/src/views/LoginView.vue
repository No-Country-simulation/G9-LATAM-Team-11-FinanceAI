<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUsuario } from '@/composables/useUsuario'
import { useUsuarioStore } from '@/stores/usuario'
import { useAuthStore } from '@/stores/auth'
import { verificarPassword, passwordEsValida } from '@/utils/password'
import BaseButton from '@/components/base/BaseButton.vue'
import BasePasswordStrength from '@/components/base/BasePasswordStrength.vue'
import BaseTag from '@/components/base/BaseTag.vue'

const router = useRouter()
const usuarioStore = useUsuarioStore()
const auth = useAuthStore()
const { registrarYEntrar, iniciarSesionCredenciales, cargarUsuario, entrarDemo } = useUsuario()
const modo = ref('registro')
const cargando = ref(false)
const error = ref('')
const paso = ref(1)
const mostrarPassword = ref(false)
const mostrarConfirmar = ref(false)

const form = reactive({
  nombre: '',
  email: '',
  password: '',
  confirmarPassword: '',
  ingresoMensual: null,
  emailLogin: '',
  passwordLogin: '',
})

const requisitos = computed(() => verificarPassword(form.password))

function siguientePaso() {
  error.value = ''
  if (!form.nombre.trim() || !form.email.trim()) {
    error.value = 'Completa tu nombre y email.'
    return
  }
  if (!passwordEsValida(form.password)) {
    error.value = 'La contraseña no cumple con el nivel de seguridad requerido.'
    return
  }
  if (form.password !== form.confirmarPassword) {
    error.value = 'Las contraseñas no coinciden.'
    return
  }
  paso.value = 2
}

async function registrar() {
  error.value = ''
  if (!form.ingresoMensual || form.ingresoMensual <= 0) {
    error.value = 'Ingresa un ingreso mensual mayor a 0.'
    return
  }
  cargando.value = true
  try {
    const id = await registrarYEntrar({
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      password: form.password,
      ingresoMensual: form.ingresoMensual,
    })
    auth.iniciarSesion(id)
    router.push({ name: 'home' })
  } catch (err) {
    error.value = err.message
  } finally {
    cargando.value = false
  }
}

async function ingresar() {
  error.value = ''
  if (!form.emailLogin.trim() || !form.passwordLogin) {
    error.value = 'Ingresa tu email y contraseña.'
    return
  }
  cargando.value = true
  try {
    const { id, nombre } = await iniciarSesionCredenciales(form.emailLogin, form.passwordLogin)
    await cargarUsuario(id)
    usuarioStore.setUsuario({ id, nombre })
    auth.iniciarSesion(id)
    router.push({ name: 'home' })
  } catch (err) {
    error.value = err.message
  } finally {
    cargando.value = false
  }
}

function irModoDemo() {
  entrarDemo()
  router.push({ name: 'home' })
}
</script>

<template>
  <main class="relative z-10 flex min-h-screen flex-col px-4 py-12">
    <div class="flex flex-1 items-center justify-center">
      <div class="w-full max-w-md">
        <div class="mb-8 text-center">
          <RouterLink to="/home" class="text-xl font-extrabold tracking-tight">
            Finance<span class="logo-ai text-cyan">AI</span>
          </RouterLink>
          <p class="mt-2 text-sm text-muted">Tu salud financiera, en un vistazo.</p>
        </div>

        <div class="rounded-lg border border-edge bg-surface p-6">
          <BaseTag class="mb-5" punto>Acceso</BaseTag>

          <div
            class="mb-5 grid grid-cols-2 gap-1 rounded-md border border-ghost-edge bg-coal p-1"
            role="tablist"
          >
            <button
              type="button"
              class="cursor-pointer rounded-sm px-3 py-2 text-[13px] font-semibold transition-colors duration-200"
              :class="modo === 'registro' ? 'bg-paper text-onyx' : 'text-muted hover:bg-surface-hover hover:text-white'"
              role="tab"
              :aria-selected="modo === 'registro'"
              @click="modo = 'registro'"
            >
              Crear cuenta
            </button>
            <button
              type="button"
              class="cursor-pointer rounded-sm px-3 py-2 text-[13px] font-semibold transition-colors duration-200"
              :class="modo === 'ingresar' ? 'bg-paper text-onyx' : 'text-muted hover:bg-surface-hover hover:text-white'"
              role="tab"
              :aria-selected="modo === 'ingresar'"
              @click="modo = 'ingresar'"
            >
              Ya tengo cuenta
            </button>
          </div>

          <!-- FORM REGISTRO -->
          <form v-if="modo === 'registro'" class="gap-4" @submit.prevent="paso === 1 ? siguientePaso() : registrar()">
            <template v-if="paso === 1">
              <label for="nombre">
                Nombre
                <input id="nombre" v-model="form.nombre" type="text" placeholder="Tu nombre" />
              </label>
              <label for="email">
                Email
                <input id="email" v-model="form.email" type="email" placeholder="tu@email.com" />
              </label>
              <div>
                <label for="password">Contraseña</label>
                <div class="relative">
                  <input
                    id="password"
                    v-model="form.password"
                    :type="mostrarPassword ? 'text' : 'password'"
                    placeholder="Crea una contraseña"
                    autocomplete="new-password"
                  />
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white cursor-pointer"
                    :aria-label="mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                    @click="mostrarPassword = !mostrarPassword"
                  >
                    <svg v-if="!mostrarPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <path d="M1 1l22 22"/>
                      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
                    </svg>
                  </button>
                </div>
                <BasePasswordStrength :password="form.password" class="mt-2" />
                <ul v-if="form.password" class="mt-2 grid gap-1 text-xs" aria-label="Requisitos de contraseña">
                  <li
                    v-for="requisito in requisitos"
                    :key="requisito.clave"
                    :class="requisito.cumple ? 'text-success' : 'text-dim'"
                  >
                    {{ requisito.cumple ? '✓' : '○' }} {{ requisito.etiqueta }}
                  </li>
                </ul>
              </div>
              <div>
                <label for="confirmar-password">Confirmar contraseña</label>
                <div class="relative">
                  <input
                    id="confirmar-password"
                    v-model="form.confirmarPassword"
                    :type="mostrarConfirmar ? 'text' : 'password'"
                    placeholder="Repite la contraseña"
                    autocomplete="new-password"
                  />
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white cursor-pointer"
                    :aria-label="mostrarConfirmar ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                    @click="mostrarConfirmar = !mostrarConfirmar"
                  >
                    <svg v-if="!mostrarConfirmar" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <path d="M1 1l22 22"/>
                      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
                    </svg>
                  </button>
                </div>
              </div>
              <p v-if="form.confirmarPassword && form.password !== form.confirmarPassword" class="campo-error">
                Las contraseñas no coinciden.
              </p>
            </template>

            <template v-else>
              <p class="text-sm text-muted">
                Para analizar tus finanzas, necesitamos saber tu ingreso mensual.
              </p>
              <label for="ingreso-mensual">
                Ingreso mensual
                <input
                  id="ingreso-mensual"
                  v-model.number="form.ingresoMensual"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Ej: 5000"
                />
              </label>
              <button
                type="button"
                class="text-[13px] text-muted hover:text-white cursor-pointer"
                @click="paso = 1"
              >
                ← Volver al paso anterior
              </button>
            </template>

            <p v-if="error" class="rounded-md border border-danger-edge bg-danger-bg px-3 py-2 text-sm text-danger" role="alert">
              {{ error }}
            </p>

            <BaseButton tipo="submit" :cargando="cargando" bloqueado>
              {{ paso === 1 ? 'Continuar' : 'Crear mi cuenta' }}
            </BaseButton>
          </form>

          <!-- FORM LOGIN -->
          <form v-else class="gap-4" @submit.prevent="ingresar">
            <label for="email-login">
              Email
              <input
                id="email-login"
                v-model="form.emailLogin"
                type="email"
                placeholder="tu@email.com"
                autocomplete="email"
              />
            </label>
            <label for="password-login">
              Contraseña
              <input
                id="password-login"
                v-model="form.passwordLogin"
                type="password"
                placeholder="Tu contraseña"
                autocomplete="current-password"
              />
            </label>

            <p v-if="error" class="rounded-md border border-danger-edge bg-danger-bg px-3 py-2 text-sm text-danger" role="alert">
              {{ error }}
            </p>

            <BaseButton tipo="submit" :cargando="cargando" bloqueado>
              Entrar
            </BaseButton>
          </form>

          <div class="my-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-dim">
            <span class="h-px flex-1 bg-hairline" />
            o
            <span class="h-px flex-1 bg-hairline" />
          </div>

          <BaseButton variante="secundario" bloqueado @click="irModoDemo">
            Explorar en modo demo
          </BaseButton>
        </div>
      </div>
    </div>

    <footer class="flex flex-wrap items-center justify-between gap-3 pt-8 text-xs text-dim">
      <p>© {{ new Date().getFullYear() }} Finance<span class="logo-ai text-cyan">AI</span> · Hackathon No Country</p>
      <p class="font-mono uppercase tracking-[0.14em]">G9-LATAM-Team 11</p>
    </footer>
  </main>
</template>
