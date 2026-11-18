import { useState } from 'react'
import { InboxOutlined } from '@ant-design/icons'

export const spritesUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items'

// PokeAPI only has per-type TM sprites and no TR sprites; the TM's move type isn't known here
const numberedTmOrTr = /^T[MR]\d+$/i

export const itemAliases: Record<string, string> = {
  // Gen 1 & 2 shortened battle items & medicine
  'parlyz-heal': 'paralyze-heal',
  'x-defend': 'x-defense',
  'x-special': 'x-sp-atk',
  'guard-spec': 'guard-spec',
  'elixer': 'elixir',
  'max-elixer': 'max-elixir',
  'exp-all': 'exp-share',

  // Gen 2 Berries (renamed in Gen 3)
  'psncureberry': 'pecha-berry',
  'psncure-berry': 'pecha-berry',
  'przcureberry': 'cheri-berry',
  'przcure-berry': 'cheri-berry',
  'burnt-berry': 'rawst-berry',
  'ice-berry': 'aspear-berry',
  'bitter-berry': 'persim-berry',
  'mint-berry': 'chesto-berry',
  'miracleberry': 'lum-berry',
  'miracle-berry': 'lum-berry',
  'mysteryberry': 'leppa-berry',
  'mystery-berry': 'leppa-berry',
  'gold-berry': 'sitrus-berry',
  'berry': 'oran-berry',

  // Gen 2 Apricorns
  'blu-apricorn': 'blue-apricorn',
  'ylw-apricorn': 'yellow-apricorn',
  'grn-apricorn': 'green-apricorn',
  'wht-apricorn': 'white-apricorn',
  'blk-apricorn': 'black-apricorn',
  'pnk-apricorn': 'pink-apricorn',

  // Gen 8 renamed items (Wings -> Feathers, Stick -> Leek)
  'health-feather': 'health-wing',
  'muscle-feather': 'muscle-wing',
  'resist-feather': 'resist-wing',
  'genius-feather': 'genius-wing',
  'clever-feather': 'clever-wing',
  'swift-feather': 'swift-wing',
  'pretty-feather': 'pretty-wing',
  'lunar-feather': 'lunar-wing',
  'rainbow-feather': 'rainbow-wing',
  'silver-feather': 'silver-wing',
  'leek': 'stick',

  // Hyphenation / specific PokeAPI filenames
  'upgrade': 'up-grade',
  'itemfinder': 'dowsing-machine',
  'mystic-ticket': 'mysticticket',
  'aurora-ticket': 'auroraticket',
}

export const itemSpriteName = (name: string): string => {
  if (numberedTmOrTr.test(name)) return 'tm-normal'

  // Insert space before uppercase letters in CamelCase retro item names (e.g. DeepSeaTooth -> Deep Sea Tooth)
  const spaced = name.replace(/([a-z])([A-Z])/g, (_, p1, p2) => `${p1} ${p2}`)

  // Sanitize: accents, punctuation, normalize spaces to hyphens
  let slug = spaced
    .toLowerCase()
    .replaceAll('é', 'e')
    .replace(/['’.:*]/g, '')
    .trim()
    .replace(/\s+/g, '-')

  if (itemAliases[slug]) {
    slug = itemAliases[slug]
  }

  // Z-Crystals: PokeAPI indexes them as <name>--held
  if (slug.endsWith('-z')) {
    slug = `${slug}--held`
  }

  return slug
}

export interface ItemPlaceholderProps {
  name: string
  size?: number
}

export function ItemPlaceholder({ name, size = 30 }: ItemPlaceholderProps) {
  return (
    <span
      role="img"
      aria-label={name}
      title={name}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
        color: '#8c8c8c',
        fontSize: Math.round(size * 0.6),
        lineHeight: 1,
        verticalAlign: 'middle',
        flexShrink: 0,
      }}
    >
      <InboxOutlined />
    </span>
  )
}

export interface ItemIconProps {
  name: string
  size?: number
}

export function ItemIcon({ name, size = 30 }: ItemIconProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  if (!name || name === 'None' || name === '(None)') return null

  const src = `${spritesUrl}/${itemSpriteName(name)}.png`

  if (src === failedSrc) {
    return <ItemPlaceholder name={name} size={size} />
  }

  return (
    <img
      alt={name}
      title={name}
      src={src}
      onError={() => setFailedSrc(src)}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        verticalAlign: 'middle',
      }}
    />
  )
}
