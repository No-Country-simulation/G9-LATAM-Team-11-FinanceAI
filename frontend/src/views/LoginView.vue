<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUsuario } from '@/composables/useUsuario'
import { useAuthStore } from '@/stores/auth'
import { verificarPassword, passwordEsValida } from '@/utils/password'
import BaseButton from '@/components/base/BaseButton.vue'
import BasePasswordStrength from '@/components/base/BasePasswordStrength.vue'
import BaseTag from '@/components/base/BaseTag.vue'

const router = useRouter()
const auth = useAuthStore()
const { registrarYEntrar, iniciarSesionCredenciales, cargarUsuario, entrarDemo } = useUsuario()
const modo = ref('registro')
const cargando = ref(false)
const error = ref('')

const form = reactive({
  nombre: '',
  email: '',
  password: '',
  confirmarPassword: '',
  emailLogin: '',
  passwordLogin: '',
})

const requisitos = computed(() => verificarPassword(form.password))

async function registrar() {
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
  cargando.value = true
  try {
    const id = await registrarYEntrar({
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      password: form.password,
      // TODO: el ingreso se define luego (formulario de análisis); el backend lo exige al registrar.
      ingresoMensual: 0,
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
    const id = await iniciarSesionCredenciales(form.emailLogin, form.passwordLogin)
    await cargarUsuario(id)
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
              :class="
                modo === 'registro' ? 'bg-paper text-onyx' : 'text-muted hover:bg-surface-hover hover:text-white'
              "
              role="tab"
              :aria-selected="modo === 'registro'"
              @click="modo = 'registro'"
            >
              Crear cuenta
            </button>
            <button
              type="button"
              class="cursor-pointer rounded-sm px-3 py-2 text-[13px] font-semibold transition-colors duration-200"
              :class="
                modo === 'ingresar' ? 'bg-paper text-onyx' : 'text-muted hover:bg-surface-hover hover:text-white'
              "
              role="tab"
              :aria-selected="modo === 'ingresar'"
              @click="modo = 'ingresar'"
            >
              Ya tengo cuenta
            </button>
          </div>

        <form v-if="modo === 'registro'" class="gap-4" @submit.prevent="registrar">
          <label for="nombre">
            Nombre
            <input id="nombre" v-model="form.nombre" type="text" placeholder="Tu nombre" />
          </label>
          <label for="email">
            Email
            <input id="email" v-model="form.email" type="email" placeholder="tu@email.com" />
          </label>
          <div>
            <label for="password">
              Contraseña
              <input
                id="password"
                v-model="form.password"
                type="password"
                placeholder="Crea una contraseña"
                autocomplete="new-password"
              />
            </label>
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
          <label for="confirmar-password">
            Confirmar contraseña
            <input
              id="confirmar-password"
              v-model="form.confirmarPassword"
              type="password"
              placeholder="Repite la contraseña"
              autocomplete="new-password"
            />
          </label>
          <p v-if="form.confirmarPassword && form.password !== form.confirmarPassword" class="campo-error">
            Las contraseñas no coinciden.
          </p>

          <p v-if="error" class="rounded-md border border-danger-edge bg-danger-bg px-3 py-2 text-sm text-danger" role="alert">
            {{ error }}
          </p>

          <BaseButton tipo="submit" :cargando="cargando" bloqueado>
            Crear mi cuenta
          </BaseButton>
        </form>

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
