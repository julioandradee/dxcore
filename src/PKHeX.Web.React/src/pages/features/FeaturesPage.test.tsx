import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import { render } from '../../testing/render'
import { changeLanguage } from '../../host'
import FeaturesPage from './FeaturesPage'
import SettingsPage from '../settings/SettingsPage'

describe('FeaturesPage', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: () => { },
      removeEventListener: () => { },
    }))
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() { }
        unobserve() { }
        disconnect() { }
      },
    )
  })

  it('renders features catalog with title and items in English', () => {
    act(() => changeLanguage('en'))
    const { container } = render(
      <MemoryRouter>
        <FeaturesPage />
      </MemoryRouter>,
    )

    expect(container.textContent).toContain('DXCore Feature Catalog')
    expect(container.textContent).toContain('Move Pokémon Between Boxes with Capacity Check')
    expect(container.textContent).toContain('Visual Table Indicators')
    expect(container.textContent).toContain('Broad Save File & ROM Hack Support')
    expect(container.textContent).toContain('Deep Pokémon Editor')
  })

  it('renders features catalog with title and items in Portuguese', () => {
    act(() => changeLanguage('pt-BR'))
    const { container } = render(
      <MemoryRouter>
        <FeaturesPage />
      </MemoryRouter>,
    )

    expect(container.textContent).toContain('Catálogo de Recursos do DXCore')
    expect(container.textContent).toContain('Mover Pokémon entre Caixas')
    expect(container.textContent).toContain('Indicadores Visuais na Tabela')
    expect(container.textContent).toContain('Amplo Suporte a Saves e ROM Hacks')
    expect(container.textContent).toContain('Editor Aprofundado de Pokémon')
  })

  it('filters items when search input changes', () => {
    act(() => changeLanguage('pt-BR'))
    const { container } = render(
      <MemoryRouter>
        <FeaturesPage />
      </MemoryRouter>,
    )

    const input = container.querySelector('input')
    expect(input).not.toBeNull()

    act(() => {
      if (input) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value',
        )?.set
        nativeInputValueSetter?.call(input, 'IndexedDB')
        input.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    expect(container.textContent).toContain('Sistema Híbrido de Backups de Saves')
    // Items that do not match should be filtered out
    expect(container.textContent).not.toContain('Indicadores Visuais na Tabela')
  })
})

describe('SettingsPage Features button', () => {
  it('renders DXCore version and button to view all features without raw badges', () => {
    act(() => changeLanguage('pt-BR'))
    const { container } = render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    )

    expect(container.textContent).toContain('DXCore v2.0')
    expect(container.textContent).toContain('Ver Catálogo')
    // Raw badges should no longer be rendered inline
    expect(container.textContent).not.toContain('🛡️ Backups Automáticos')
    expect(container.textContent).not.toContain('⚡ Ações em Lote (Shiny/IVs/Nível)')
  })
})
