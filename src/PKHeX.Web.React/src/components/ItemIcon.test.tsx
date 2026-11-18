import { describe, expect, it } from 'vitest'
import { expectPlaceholder, failToLoad, render } from '../testing/render'
import { ItemIcon, itemSpriteName, spritesUrl } from './ItemIcon'

describe('itemSpriteName', () => {
  it('converts basic items to lowercase hyphenated slugs', () => {
    expect(itemSpriteName('Potion')).toBe('potion')
    expect(itemSpriteName('Ultra Ball')).toBe('ultra-ball')
    expect(itemSpriteName('Poké Ball')).toBe('poke-ball')
  })

  it('maps numbered TMs and TRs to tm-normal', () => {
    expect(itemSpriteName('TM01')).toBe('tm-normal')
    expect(itemSpriteName('TR25')).toBe('tm-normal')
  })

  it('splits CamelCase retro item names', () => {
    expect(itemSpriteName('BrightPowder')).toBe('bright-powder')
    expect(itemSpriteName('EnergyPowder')).toBe('energy-powder')
    expect(itemSpriteName('SilverPowder')).toBe('silver-powder')
    expect(itemSpriteName('TinyMushroom')).toBe('tiny-mushroom')
    expect(itemSpriteName('TwistedSpoon')).toBe('twisted-spoon')
    expect(itemSpriteName('DeepSeaScale')).toBe('deep-sea-scale')
    expect(itemSpriteName('DeepSeaTooth')).toBe('deep-sea-tooth')
    expect(itemSpriteName('NeverMeltIce')).toBe('never-melt-ice')
    expect(itemSpriteName('SlowpokeTail')).toBe('slowpoke-tail')
  })

  it('sanitizes punctuation like apostrophes, periods and colons', () => {
    expect(itemSpriteName("King's Rock")).toBe('kings-rock')
    expect(itemSpriteName('Guard Spec.')).toBe('guard-spec')
    expect(itemSpriteName('Exp. Share')).toBe('exp-share')
  })

  it('maps retro battle item and medicine abbreviations to PokeAPI modern names', () => {
    expect(itemSpriteName('Parlyz Heal')).toBe('paralyze-heal')
    expect(itemSpriteName('X Defend')).toBe('x-defense')
    expect(itemSpriteName('X Special')).toBe('x-sp-atk')
    expect(itemSpriteName('Elixer')).toBe('elixir')
    expect(itemSpriteName('Max Elixer')).toBe('max-elixir')
    expect(itemSpriteName('Exp. All')).toBe('exp-share')
  })

  it('maps Gen 2 retro berry names to their Gen 3+ PokeAPI equivalents', () => {
    expect(itemSpriteName('PSNCureBerry')).toBe('pecha-berry')
    expect(itemSpriteName('PRZCureBerry')).toBe('cheri-berry')
    expect(itemSpriteName('Burnt Berry')).toBe('rawst-berry')
    expect(itemSpriteName('Ice Berry')).toBe('aspear-berry')
    expect(itemSpriteName('Bitter Berry')).toBe('persim-berry')
    expect(itemSpriteName('Mint Berry')).toBe('chesto-berry')
    expect(itemSpriteName('MiracleBerry')).toBe('lum-berry')
    expect(itemSpriteName('MysteryBerry')).toBe('leppa-berry')
    expect(itemSpriteName('Gold Berry')).toBe('sitrus-berry')
    expect(itemSpriteName('Berry')).toBe('oran-berry')
  })

  it('maps Gen 2 apricorn abbreviations to modern names', () => {
    expect(itemSpriteName('Blu Apricorn')).toBe('blue-apricorn')
    expect(itemSpriteName('Ylw Apricorn')).toBe('yellow-apricorn')
    expect(itemSpriteName('Grn Apricorn')).toBe('green-apricorn')
    expect(itemSpriteName('Wht Apricorn')).toBe('white-apricorn')
    expect(itemSpriteName('Blk Apricorn')).toBe('black-apricorn')
    expect(itemSpriteName('Pnk Apricorn')).toBe('pink-apricorn')
  })

  it('maps Gen 8 renamed items like Feathers and Leek', () => {
    expect(itemSpriteName('Health Feather')).toBe('health-wing')
    expect(itemSpriteName('Muscle Feather')).toBe('muscle-wing')
    expect(itemSpriteName('Leek')).toBe('stick')
  })

  it('maps Z-Crystals to the held item variant', () => {
    expect(itemSpriteName('Firium Z')).toBe('firium-z--held')
    expect(itemSpriteName('Normalium Z')).toBe('normalium-z--held')
  })
})

describe('ItemIcon', () => {
  it('renders nothing when name is empty or None', () => {
    const { container: c1 } = render(<ItemIcon name="" />)
    expect(c1.innerHTML).toBe('')

    const { container: c2 } = render(<ItemIcon name="None" />)
    expect(c2.innerHTML).toBe('')
  })

  it('renders an img with the correct sprite URL for normal items', () => {
    const { container } = render(<ItemIcon name="Potion" />)
    const img = container.querySelector('img')
    expect(img).not.toBeNull()
    expect(img?.getAttribute('src')).toBe(`${spritesUrl}/potion.png`)
    expect(img?.getAttribute('alt')).toBe('Potion')
  })

  it('renders the resolved sprite URL for aliased retro items like Parlyz Heal', () => {
    const { container } = render(<ItemIcon name="Parlyz Heal" />)
    const img = container.querySelector('img')
    expect(img?.getAttribute('src')).toBe(`${spritesUrl}/paralyze-heal.png`)
  })

  it('shows a graceful placeholder when the sprite image fails to load', () => {
    const { container } = render(<ItemIcon name="Unknown Nonexistent Item" />)
    const img = container.querySelector('img')!
    expect(img).not.toBeNull()
    failToLoad(img)
    expectPlaceholder(container, 'Unknown Nonexistent Item')
  })

  it('retries loading when the item name changes after an error', () => {
    const { container, rerender } = render(<ItemIcon name="Unknown Nonexistent Item" />)
    failToLoad(container.querySelector('img')!)
    expectPlaceholder(container, 'Unknown Nonexistent Item')

    rerender(<ItemIcon name="Potion" />)
    const img = container.querySelector('img')
    expect(img?.getAttribute('src')).toBe(`${spritesUrl}/potion.png`)
  })
})
