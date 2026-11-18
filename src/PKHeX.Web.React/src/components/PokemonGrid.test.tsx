import { act } from 'react'
import { MemoryRouter } from 'react-router'
import { App } from 'antd'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Engine, PokemonHandle, PokemonId, PokemonSummary } from '@pkhex-everywhere/engine'
import { EngineProvider } from '@pkhex-everywhere/react'
import { render } from '../testing/render'
import { PokemonGrid } from './PokemonGrid'
import { PokemonTable } from './PokemonTable'

vi.mock('../hooks/useSupports', () => ({
  useSupports: () => false,
}))

const pikachu: PokemonSummary = {
  id: 'pika' as unknown as PokemonId,
  at: { source: 'party', slot: 0 } as PokemonHandle,
  speciesId: 25,
  speciesIndex: 25,
  species: 'Pikachu',
  isUnknown: false,
  editable: true,
  form: { id: 0, name: '' },
  nickname: 'Sparky',
  level: 50,
  isShiny: true,
  gender: 'male',
  isEgg: false,
  types: [12],
}

const charmander: PokemonSummary = {
  id: 'char' as unknown as PokemonId,
  at: { source: 'box', slot: 0, box: 0 } as PokemonHandle,
  speciesId: 4,
  speciesIndex: 4,
  species: 'Charmander',
  isUnknown: false,
  editable: true,
  form: { id: 0, name: '' },
  nickname: '',
  level: 15,
  isShiny: false,
  gender: 'male',
  isEgg: false,
  types: [9],
}

describe('PokemonGrid', () => {
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

  const engine = {
    subscribe: () => () => {},
    pokemon: { export: vi.fn() },
  } as unknown as Engine

  it('renders pokemon cards with nickname, species, dex number and shiny badge', () => {
    const { container } = render(
      <MemoryRouter>
        <App>
          <EngineProvider engine={engine}>
            <PokemonGrid pokemon={[pikachu]} />
          </EngineProvider>
        </App>
      </MemoryRouter>,
    )

    expect(container.textContent).toContain('Sparky')
    expect(container.textContent).toContain('(Pikachu)')
    expect(container.textContent).toContain('#0025')
    expect(container.textContent).toContain('Shiny')
    expect(container.textContent).toContain('Lvl 50')
  })

  it('renders box badge when pokemon has box location', () => {
    const { container } = render(
      <MemoryRouter>
        <App>
          <EngineProvider engine={engine}>
            <PokemonGrid pokemon={[charmander]} />
          </EngineProvider>
        </App>
      </MemoryRouter>,
    )

    expect(container.textContent).toContain('Charmander')
    expect(container.textContent).toMatch(/Box 1|Caixa 1/)
  })

  it('toggles selection when clicking card checkbox', () => {
    const onSelectedChange = vi.fn()
    const { container } = render(
      <MemoryRouter>
        <App>
          <EngineProvider engine={engine}>
            <PokemonGrid
              pokemon={[pikachu]}
              selected={[]}
              onSelectedChange={onSelectedChange}
            />
          </EngineProvider>
        </App>
      </MemoryRouter>,
    )

    const checkbox = container.querySelector<HTMLInputElement>('input[type="checkbox"]')
    expect(checkbox).not.toBeNull()
    act(() => {
      checkbox?.click()
    })

    expect(onSelectedChange).toHaveBeenCalledWith([pikachu], [JSON.stringify(pikachu.at)])
  })

  it('renders table view when explicitly requested via view="table"', () => {
    const { container } = render(
      <MemoryRouter>
        <App>
          <EngineProvider engine={engine}>
            <PokemonTable pokemon={[pikachu]} view="table" />
          </EngineProvider>
        </App>
      </MemoryRouter>,
    )

    expect(container.querySelector('.ant-table')).not.toBeNull()
  })

  it('renders gallery view when explicitly requested via view="gallery"', () => {
    const { container } = render(
      <MemoryRouter>
        <App>
          <EngineProvider engine={engine}>
            <PokemonTable pokemon={[pikachu]} view="gallery" />
          </EngineProvider>
        </App>
      </MemoryRouter>,
    )

    expect(container.querySelector('.ant-card')).not.toBeNull()
  })
})
