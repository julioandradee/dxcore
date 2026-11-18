import type { PokemonSummary } from '@pkhex-everywhere/engine'

export const routes = {
  home: '/',
  load: '/load',
  party: '/party',
  items: '/items',
  events: '/events',
  save: '/save',
  settings: '/settings',
  features: '/features',
  credits: '/credits',
  privacyPolicy: '/privacy-policy',
  termsOfUse: '/terms-of-use',
  releaseNotes: (since?: string | null) => (since === undefined ? '/release-notes' : `/release-notes?since=${since ?? ''}`),
  pokemon: ({ at, id }: Pick<PokemonSummary, 'at' | 'id'>) => `/pokemon/${at.source}/${id}`,
  box: '/pokemon-box',
  searchEncounter: '/pokemon/search-encounter',
  clonePokemon: ({ at, id }: Pick<PokemonSummary, 'at' | 'id'>) => `/pokemon/${at.source}/${id}/clone`,
  encounters: ({ version, species }: { version: number; species?: number }) =>
    `/pokemon/search-encounter?${new URLSearchParams({ version: String(version), ...(species && { species: String(species) }) })}`,
}
