import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import GaugeChart from '@/components/result/GaugeChart.vue'

describe('GaugeChart.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Casos limite del prop max', () => {
    it('renderiza sin errores cuando max = 0 (no divide por cero)', () => {
      const wrapper = mount(GaugeChart, {
        props: { valor: 50, max: 0, etiqueta: 'Test' },
      })
      const paths = wrapper.findAll('path')
      const offset = Number(paths[1].attributes('stroke-dashoffset'))
      expect(Number.isFinite(offset)).toBe(true)
      expect(Number.isNaN(offset)).toBe(false)
    })

    it('muestra 0 cuando max es negativo', () => {
      const wrapper = mount(GaugeChart, {
        props: { valor: 50, max: -10, etiqueta: 'Test' },
      })
      expect(wrapper.text()).toContain('0')
    })

    it('clampea a 100 cuando valor supera max', () => {
      const wrapper = mount(GaugeChart, {
        props: { valor: 150, max: 100, etiqueta: 'Test' },
      })
      // El template muestra Math.round(valor) = 150, pero el SVG clampea el arco al 100%
      // Verificamos que el stroke-dashoffset NO sea mayor que la circunferencia
      const paths = wrapper.findAll('path')
      const circunf = Math.PI * 80
      const offset = Number(paths[1].attributes('stroke-dashoffset'))
      expect(offset).toBeGreaterThanOrEqual(0)
      expect(offset).toBeLessThanOrEqual(circunf)
    })
  })

  describe('Casos nominales', () => {
    it('muestra el valor 50 para 50/100', () => {
      const wrapper = mount(GaugeChart, {
        props: { valor: 50, max: 100, etiqueta: 'Endeudamiento' },
      })
      expect(wrapper.text()).toContain('50')
    })

    it('muestra 0 cuando valor es 0', () => {
      const wrapper = mount(GaugeChart, {
        props: { valor: 0, max: 100, etiqueta: 'Test' },
      })
      expect(wrapper.text()).toContain('0')
    })

    it('muestra la etiqueta pasada como prop', () => {
      const wrapper = mount(GaugeChart, {
        props: { valor: 75, max: 100, etiqueta: 'Capacidad de ahorro' },
      })
      expect(wrapper.text()).toContain('Capacidad de ahorro')
    })

    it('aplica color verde en modo normal con porcentaje alto (>70)', () => {
      const wrapper = mount(GaugeChart, {
        props: { valor: 80, max: 100, etiqueta: 'Test', invertido: false },
      })
      const paths = wrapper.findAll('path')
      expect(paths[1].attributes('stroke')).toBe('#10b981')
    })

    it('aplica color rojo en modo invertido con porcentaje alto (>70)', () => {
      const wrapper = mount(GaugeChart, {
        props: { valor: 80, max: 100, etiqueta: 'Test', invertido: true },
      })
      const paths = wrapper.findAll('path')
      expect(paths[1].attributes('stroke')).toBe('#ef4444')
    })
  })

  describe('Prop unidad', () => {
    it('muestra la unidad personalizada cuando se pasa como prop', () => {
      const wrapper = mount(GaugeChart, {
        props: { valor: 50, max: 100, etiqueta: 'Test', unidad: 'pts' },
      })
      expect(wrapper.text()).toContain('pts')
    })
  })
})
