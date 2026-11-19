import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '../../testing/render'
import { changeEditorLayout } from '../../host'
import { PokemonShowcaseCard } from './PokemonShowcaseCard'

describe('PokemonShowcaseCard', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
  })

  it('renders Pokémon information with official artwork and tags', () => {
    const { container } = render(
      <PokemonShowcaseCard
        pokemon={{
          speciesId: 25,
          species: 'Pikachu',
          nickname: 'Sparky',
          level: 50,
          gender: 'male',
          isShiny: true,
          types: [12],
        }}
      />,
    )

    expect(container.textContent).toContain('Sparky')
    expect(container.textContent).toContain('Pikachu')
    expect(container.textContent).toContain('#0025')
    expect(container.textContent).toContain('Shiny')
    expect(container.textContent).toContain('Macho')

    const img = container.querySelector('img')
    expect(img).not.toBeNull()
    expect(img?.getAttribute('src')).toContain('official-artwork/shiny/25.png')
  })

  it('renders non-shiny official artwork', () => {
    const { container } = render(
      <PokemonShowcaseCard
        pokemon={{
          speciesId: 6,
          species: 'Charizard',
          nickname: 'Charizard',
          level: 100,
          gender: 'male',
          isShiny: false,
          types: [9, 2],
        }}
      />,
    )

    expect(container.textContent).toContain('Charizard')
    expect(container.textContent).toContain('#0006')
    expect(container.textContent).not.toContain('Shiny')
    expect(container.textContent).not.toContain('Normal')

    const img = container.querySelector('img')
    expect(img).not.toBeNull()
    expect(img?.getAttribute('src')).toContain('official-artwork/6.png')
  })
})
