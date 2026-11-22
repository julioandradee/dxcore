import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import type { PokemonHandle, PokemonId, PokemonSummary } from '@pkhex-everywhere/engine'
import { render } from '../../testing/render'
import { changeLanguage } from '../../host'
import DashboardPage from './DashboardPage'

const pikachu: PokemonSummary = {
  id: 'pika-1' as unknown as PokemonId,
  at: { source: 'party', slot: 0 } as PokemonHandle,
  speciesId: 25,
  speciesIndex: 25,
  species: 'Pikachu',
  isUnknown: false,
  editable: true,
  form: { id: 0, name: '' },
  nickname: 'Sparky',
  level: 100,
  isShiny: true,
  gender: 'male',
  isEgg: false,
  types: [12],
}

const bulbasaur: PokemonSummary = {
  id: 'bulb-1' as unknown as PokemonId,
  at: { source: 'box', box: 0, slot: 0 } as PokemonHandle,
  speciesId: 1,
  speciesIndex: 1,
  species: 'Bulbasaur',
  isUnknown: false,
  editable: true,
  form: { id: 0, name: '' },
  nickname: 'Bulbasaur',
  level: 50,
  isShiny: false,
  gender: 'male',
  isEgg: false,
  types: [11, 3],
}

const mockSpeciesPokedex = [
  { id: 1, name: 'Bulbasaur', seen: true, caught: true, types: [11, 3] },
  { id: 4, name: 'Charmander', seen: true, caught: false, types: [9] },
  { id: 7, name: 'Squirtle', seen: false, caught: false, types: [10] },
  { id: 25, name: 'Pikachu', seen: true, caught: true, types: [12] },
]

const mockEngine = {
  encounters: {
    search: vi.fn().mockResolvedValue([
      {
        index: 0,
        speciesId: 4,
        species: 'Charmander',
        name: 'Starter',
        location: 'Professor Birch Lab',
        levelRange: '5',
        version: 'Emerald',
      },
    ]),
  },
}

vi.mock('@pkhex-everywhere/react', () => ({
  useLoadedGame: () => ({
    game: {
      version: 3,
      game: 'Emerald',
      generation: 3,
      hasEvents: true,
      fileName: 'emerald.sav',
    },
  }),
  useEngine: () => mockEngine,
  useParty: () => ({
    party: [pikachu],
  }),
  useBox: () => ({
    box: [bulbasaur],
  }),
  useTrainer: () => ({
    trainer: {
      id: '12345/67890',
      name: 'Ash',
      gender: 'male',
      money: 50000,
      battlePoints: 120,
      rival: 'Gary',
    },
  }),
  useQuery: (name: string) => {
    if (name === 'encounters.versions') {
      return {
        versions: [{ id: 3, name: 'Emerald' }],
        default: 3,
      }
    }
    if (name === 'game.progress') {
      return {
        playTime: { hours: 42, minutes: 15, seconds: 30 },
        badges: { earned: 8, total: 8 },
        pokedex: { seen: 3, caught: 2 },
      }
    }
    if (name === 'trainer.badges') {
      return [
        { name: 'Stone', earned: true },
        { name: 'Knuckle', earned: true },
        { name: 'Dynamo', earned: true },
        { name: 'Heat', earned: true },
      ]
    }
    if (name === 'box.list') {
      return [
        { box: 0, name: 'Box 1', slots: 30 },
        { box: 1, name: 'Box 2', slots: 30 },
      ]
    }
    if (name === 'species.pokedex') {
      return mockSpeciesPokedex
    }
    return null
  },
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    act(() => changeLanguage('pt-BR'))
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    )
  })

  it('renders dashboard with title, badges, trainer info and KPI cards', () => {
    const { container } = render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    )

    expect(container.textContent).toContain('Dashboard do Jogo')
    expect(container.textContent).toContain('Progresso')
    expect(container.textContent).toContain('Caixas')
    expect(container.textContent).toContain('Insígnias')
    expect(container.textContent).toContain('Treinador')
    expect(container.textContent).toContain('Ash')
    expect(container.textContent).toContain('$ 50.000')
    expect(container.textContent).toContain('42h 15m')

    // Verifies 2-column layout on mobile (xs=12)
    const kpiCols = container.querySelectorAll('.ant-col-xs-12')
    expect(kpiCols.length).toBeGreaterThanOrEqual(4)
  })

  it('renders pokédex tracker cards with species and status tags', () => {
    const { container } = render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    )

    expect(container.textContent).toContain('Charmander')
    expect(container.textContent).toContain('Squirtle')

    // Status checks
    expect(container.textContent).toContain('Apenas Visto')
    expect(container.textContent).toContain('Não capturado')
    // Bulbasaur and Pikachu are already caught, so they are not shown in the missing tracker
    expect(container.textContent).not.toContain('Bulbasaur')
    expect(container.textContent).not.toContain('Pikachu')
  })

  it('filters species by status when clicking status chips', () => {
    const { container } = render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    )

    // Find and click "Não capturados" button
    const buttons = Array.from(container.querySelectorAll('button'))
    const missingBtn = buttons.find((b) => b.textContent?.includes('Não capturados'))
    expect(missingBtn).toBeDefined()

    act(() => {
      missingBtn!.click()
    })

    // Squirtle is missing
    expect(container.textContent).toContain('Squirtle')
    // Bulbasaur and Pikachu are in storage/caught, so they shouldn't appear
    expect(container.textContent).not.toContain('Bulbasaur')
    expect(container.textContent).not.toContain('Pikachu')
  })

  it('switches to collection analytics and trainer tabs', () => {
    const { container } = render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    )

    // Click tab "Estatísticas da Coleção"
    const labels = Array.from(container.querySelectorAll('label'))
    const collectionTab = labels.find((l) => l.textContent?.includes('Estatísticas da Coleção'))
    expect(collectionTab).toBeDefined()

    act(() => {
      collectionTab!.click()
    })

    expect(container.textContent).toContain('Distribuição por Tipagem')
    expect(container.textContent).toContain('Equipe Atual')
    expect(container.textContent).toContain('Galeria de Shinies')
    expect(container.textContent).toContain('Sparky')

    // Click tab "Ficha & Insígnias"
    const trainerTab = labels.find((l) => l.textContent?.includes('Ficha & Insígnias'))
    expect(trainerTab).toBeDefined()

    act(() => {
      trainerTab!.click()
    })

    expect(container.textContent).toContain('Insígnias de Ginásio')
    expect(container.textContent).toContain('Stone')
    expect(container.textContent).toContain('Knuckle')
    expect(container.textContent).toContain('Nome do Treinador (OT)')
    expect(container.textContent).toContain('12345/67890')
    expect(container.textContent).toContain('120 BP')
    expect(container.textContent).toContain('Gary')
  })

  it('opens catch info modal when clicking a pokemon card in tracker', () => {
    const { container } = render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    )

    // Click on Charmander card
    const charmanderCard = Array.from(container.querySelectorAll('.ant-card-hoverable')).find((card) =>
      card.textContent?.includes('Charmander'),
    )
    expect(charmanderCard).toBeDefined()

    act(() => {
      charmanderCard!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(document.body.textContent).toContain('Como Capturar / Obter')
    expect(document.body.textContent).toContain('Charmander')
  })
})
