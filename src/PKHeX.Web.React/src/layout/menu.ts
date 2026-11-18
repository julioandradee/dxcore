import type { SaveSummary } from '@pkhex-everywhere/engine'
import { supports } from '../capabilities'
import { routes } from '../routes'

export type MenuIcon = 'home' | 'team' | 'inbox' | 'shop' | 'flag' | 'save'

export interface MenuEntry {
  route: string
  label: string
  icon?: MenuIcon
  children?: MenuEntry[]
}

export type TranslateFn = (key: string, fallback?: string) => string

export function menuEntries(
  game: SaveSummary | null,
  t: TranslateFn = (_key, fallback) => fallback ?? _key,
): MenuEntry[] {
  return [
    { route: routes.home, label: t('menu.home', 'Home'), icon: 'home' },
    ...(game
      ? [
          { route: routes.party, label: t('menu.party', 'Party'), icon: 'team' as const },
          { route: routes.box, label: t('menu.box', 'Pokemon Box'), icon: 'inbox' as const },
          { route: routes.items, label: t('menu.items', 'Items'), icon: 'shop' as const },
          ...(game.hasEvents && supports(game, 'events') ? [{ route: routes.events, label: t('menu.events', 'Events'), icon: 'flag' as const }] : []),
        ]
      : []),
    { route: routes.save, label: t('menu.save', 'Save'), icon: 'save' },
  ]
}
