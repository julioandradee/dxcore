import { describe, expect, it } from 'vitest'
import { calculateTypeMatchups, getSingleEffectiveness } from './typeMatchups'

describe('typeMatchups', () => {
  it('correctly calculates single effectiveness', () => {
    // Water (10) vs Fire (9) is 2x
    expect(getSingleEffectiveness(10, 9)).toBe(2)
    // Electric (12) vs Ground (4) is 0x
    expect(getSingleEffectiveness(12, 4)).toBe(0)
    // Grass (11) vs Fire (9) is 0.5x
    expect(getSingleEffectiveness(11, 9)).toBe(0.5)
  })

  it('calculates pure Electric type matchups (e.g. Pikachu)', () => {
    // Electric is type 12
    const result = calculateTypeMatchups([12])
    // Weakness: Ground (4) is 2x
    expect(result.weaknesses2x).toContain(4)
    expect(result.weaknesses4x).toHaveLength(0)
    // Resistances: Flying (2), Steel (8), Electric (12)
    expect(result.resistances05x).toContain(2)
    expect(result.resistances05x).toContain(8)
    expect(result.resistances05x).toContain(12)
    // Immunities: none
    expect(result.immunities0x).toHaveLength(0)
    // Offensive super effective: Water (10), Flying (2)
    expect(result.offensiveSuperEffective).toContain(10)
    expect(result.offensiveSuperEffective).toContain(2)
  })

  it('calculates dual type matchups (e.g. Charizard: Fire 9, Flying 2)', () => {
    const result = calculateTypeMatchups([9, 2])
    // Rock (5) is 4x critical weakness (2 * 2)
    expect(result.weaknesses4x).toContain(5)
    // Water (10) and Electric (12) are 2x
    expect(result.weaknesses2x).toContain(10)
    expect(result.weaknesses2x).toContain(12)
    // Ground (4) is 0x immunity (0 * 2 = 0)
    expect(result.immunities0x).toContain(4)
    // Grass (11) and Bug (6) are 0.25x super resistances (0.5 * 0.5)
    expect(result.resistances025x).toContain(11)
    expect(result.resistances025x).toContain(6)
  })

  it('returns empty summary for empty types array', () => {
    const result = calculateTypeMatchups([])
    expect(result.weaknesses2x).toHaveLength(0)
    expect(result.weaknesses4x).toHaveLength(0)
    expect(result.resistances05x).toHaveLength(0)
  })
})
