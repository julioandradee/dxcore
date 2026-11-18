import { describe, expect, it } from 'vitest'
import { getAbilityDescription } from './abilityDescriptions'

describe('abilityDescriptions', () => {
  it('returns description for common starter abilities', () => {
    const overgrow = getAbilityDescription(65, 'Overgrow')
    expect(overgrow).toContain('Planta')

    const blaze = getAbilityDescription(66, 'Blaze')
    expect(blaze).toContain('Fogo')

    const torrent = getAbilityDescription(67, 'Torrent')
    expect(torrent).toContain('Água')
  })

  it('returns description for competitive staple abilities', () => {
    const intimidate = getAbilityDescription(22, 'Intimidate')
    expect(intimidate).toContain('Ataque')

    const levitate = getAbilityDescription(26, 'Levitate')
    expect(levitate).toContain('Terrestre')

    const speedBoost = getAbilityDescription(3, 'Speed Boost')
    expect(speedBoost).toContain('Velocidade')
  })

  it('handles case-insensitivity and formatting differences in ability names', () => {
    const magicGuard = getAbilityDescription(98, 'magic guard')
    expect(magicGuard).toContain('ataques diretos')

    const hugePower = getAbilityDescription(37, 'Huge-Power')
    expect(hugePower).toContain('Ataque')
  })

  it('provides fallback for unknown or ROM hack abilities', () => {
    const unknown = getAbilityDescription(9999, 'Super Unknown Custom Ability')
    expect(unknown).toContain('Habilidade passiva especial')
  })
})
