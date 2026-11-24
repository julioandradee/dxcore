import { act } from 'react'
import { MemoryRouter } from 'react-router'
import { App } from 'antd'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PokemonHandle, PokemonId, PokemonSummary } from '@pkhex-everywhere/engine'
import { render } from '../../testing/render'
import { ImportedPokemonModal } from './ImportedPokemonModal'

const pikachu: PokemonSummary = {
  id: 'pika' as unknown as PokemonId,
  at: { source: 'box', box: 0, slot: 0 } as PokemonHandle,
  speciesId: 25,
  speciesIndex: 25,
  species: 'Pikachu',
  isUnknown: false,
  editable: true,
  form: { id: 0, name: '' },
  nickname: 'Sparky',
  level: 50,
  isShiny: false,
  gender: 'male',
  isEgg: false,
  types: [12],
}

const charmander: PokemonSummary = {
  id: 'char' as unknown as PokemonId,
  at: { source: 'box', box: 1, slot: 4 } as PokemonHandle,
  speciesId: 4,
  speciesIndex: 4,
  species: 'Charmander',
  isUnknown: false,
  editable: true,
  form: { id: 0, name: '' },
  nickname: 'Charmander',
  level: 15,
  isShiny: false,
  gender: 'male',
  isEgg: false,
  types: [10],
}

describe('ImportedPokemonModal', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }))
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    )
  })

  it('renders imported count and cards with names, levels and dex IDs', () => {
    const onClose = vi.fn()
    render(
      <MemoryRouter>
        <App>
          <ImportedPokemonModal open={true} imported={[pikachu, charmander]} onClose={onClose} />
        </App>
      </MemoryRouter>,
    )

    const modalText = document.body.textContent ?? ''

    // Verify quantity is displayed
    expect(modalText).toMatch(/2 Pokémon (importados|imported)/i)

    // Verify cards are rendered in grid
    const cards = document.querySelectorAll('.ant-card')
    expect(cards.length).toBe(2)

    // Verify Pokédex IDs are displayed formatted
    expect(modalText).toContain('#0025')
    expect(modalText).toContain('#0004')

    // Verify names and nicknames are displayed
    expect(modalText).toContain('Pikachu')
    expect(modalText).toContain('Charmander')
    expect(modalText).toContain('Sparky')

    // Verify levels are displayed
    expect(modalText).toContain('50')
    expect(modalText).toContain('15')
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(
      <MemoryRouter>
        <App>
          <ImportedPokemonModal open={true} imported={[pikachu]} onClose={onClose} />
        </App>
      </MemoryRouter>,
    )

    const closeBtn = [...document.querySelectorAll('button')].find(
      (b) => b.textContent?.includes('Fechar') || b.textContent?.includes('Close'),
    )
    expect(closeBtn).toBeDefined()
    act(() => {
      closeBtn?.click()
    })

    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when Ver is clicked', () => {
    const onClose = vi.fn()
    render(
      <MemoryRouter>
        <App>
          <ImportedPokemonModal open={true} imported={[pikachu]} onClose={onClose} />
        </App>
      </MemoryRouter>,
    )

    const viewBtn = [...document.querySelectorAll('button')].find(
      (b) => b.textContent?.includes('Ver') || b.textContent?.includes('View'),
    )
    expect(viewBtn).toBeDefined()
    act(() => {
      viewBtn?.click()
    })

    expect(onClose).toHaveBeenCalled()
  })
})
