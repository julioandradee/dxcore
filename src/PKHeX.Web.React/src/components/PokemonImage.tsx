import { Badge } from 'antd'
import type { PokemonSummary } from '@pkhex-everywhere/engine'
import { SpeciesImage } from './PokemonSprite'

export const showdownUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown'
export const officialArtworkUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork'

export function pokemonImageUrl(speciesId: number | null, isShiny: boolean): string | null {
  if (speciesId === null) return null
  return isShiny ? `${showdownUrl}/shiny/${speciesId}.gif` : `${showdownUrl}/${speciesId}.gif`
}

export function pokemonOfficialArtworkUrl(speciesId: number | null, isShiny: boolean): string | null {
  if (speciesId === null) return null
  return isShiny ? `${officialArtworkUrl}/shiny/${speciesId}.png` : `${officialArtworkUrl}/${speciesId}.png`
}

interface PokemonImageProps {
  pokemon: Pick<PokemonSummary, 'speciesId' | 'species' | 'isShiny'>
  style?: 'showdown' | 'official'
  size?: number
}

export function PokemonImage({ pokemon, style = 'showdown', size = 64 }: PokemonImageProps) {
  const src = style === 'official'
    ? pokemonOfficialArtworkUrl(pokemon.speciesId, pokemon.isShiny)
    : pokemonImageUrl(pokemon.speciesId, pokemon.isShiny)
  const image = <SpeciesImage name={pokemon.species} src={src} placeholderSize={size} />
  if (!pokemon.isShiny) return image
  return (
    <Badge.Ribbon text="shiny" color="orange">
      {image}
    </Badge.Ribbon>
  )
}
