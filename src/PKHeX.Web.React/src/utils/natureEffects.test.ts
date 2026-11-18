import { describe, expect, it } from 'vitest'
import type { StatValues } from '@pkhex-everywhere/engine'
import { getNatureDescription, getNatureInfo, getShortStatName, isNatureSuitableForStats } from './natureEffects'

describe('natureEffects', () => {
  it('correctly identifies neutral natures', () => {
    // Hardy (0)
    const hardy = getNatureInfo(0)
    expect(hardy.name).toBe('Hardy')
    expect(hardy.isNeutral).toBe(true)
    expect(hardy.increased).toBeNull()
    expect(hardy.decreased).toBeNull()

    // Serious (12)
    const serious = getNatureInfo(12)
    expect(serious.name).toBe('Serious')
    expect(serious.isNeutral).toBe(true)

    // Quirky (24)
    const quirky = getNatureInfo(24)
    expect(quirky.name).toBe('Quirky')
    expect(quirky.isNeutral).toBe(true)
  })

  it('correctly calculates stat modifiers for Adamant (3: +Atk, -SpA)', () => {
    const adamant = getNatureInfo(3)
    expect(adamant.name).toBe('Adamant')
    expect(adamant.isNeutral).toBe(false)
    expect(adamant.increased).toBe('attack')
    expect(adamant.decreased).toBe('spAttack')
  })

  it('correctly calculates stat modifiers for Jolly (13: +Spe, -SpA)', () => {
    const jolly = getNatureInfo(13)
    expect(jolly.name).toBe('Jolly')
    expect(jolly.isNeutral).toBe(false)
    expect(jolly.increased).toBe('speed')
    expect(jolly.decreased).toBe('spAttack')
  })

  it('correctly calculates stat modifiers for Modest (15: +SpA, -Atk)', () => {
    const modest = getNatureInfo(15)
    expect(modest.name).toBe('Modest')
    expect(modest.isNeutral).toBe(false)
    expect(modest.increased).toBe('spAttack')
    expect(modest.decreased).toBe('attack')
  })

  it('generates formatted description in Portuguese', () => {
    const desc = getNatureDescription(3, (_key, fallback) => fallback ?? '')
    expect(desc).toContain('+10% Ataque')
    expect(desc).toContain('-10% Atq. Especial')

    const neutralDesc = getNatureDescription(0, (_key, fallback) => fallback ?? '')
    expect(neutralDesc).toContain('Neutra')
  })

  it('correctly maps short stat names', () => {
    expect(getShortStatName('attack')).toBe('Atk')
    expect(getShortStatName('defense')).toBe('Def')
    expect(getShortStatName('spAttack')).toBe('SpA')
    expect(getShortStatName('spDefense')).toBe('SpD')
    expect(getShortStatName('speed')).toBe('Spe')
    expect(getShortStatName(null)).toBe('')
  })

  describe('isNatureSuitableForStats', () => {
    it('returns true when stats are null or undefined', () => {
      expect(isNatureSuitableForStats(3, null)).toBe(true)
      expect(isNatureSuitableForStats(3, undefined)).toBe(true)
    })

    it('returns true for neutral natures regardless of stats', () => {
      const physicalStats: StatValues = {
        health: 150,
        attack: 130,
        defense: 80,
        specialAttack: 50,
        specialDefense: 80,
        speed: 70,
      }
      expect(isNatureSuitableForStats(0, physicalStats)).toBe(true) // Hardy
      expect(isNatureSuitableForStats(12, physicalStats)).toBe(true) // Serious
      expect(isNatureSuitableForStats(24, physicalStats)).toBe(true) // Quirky
    })

    it('identifies suitable and unsuitable natures for physical attackers', () => {
      const machampStats: StatValues = {
        health: 165,
        attack: 150,
        defense: 90,
        specialAttack: 65,
        specialDefense: 95,
        speed: 65,
      }
      // Adamant (+Atk, -SpA) & Jolly (+Spe, -SpA) are ideal
      expect(isNatureSuitableForStats(3, machampStats)).toBe(true) // Adamant
      expect(isNatureSuitableForStats(13, machampStats)).toBe(true) // Jolly
      expect(isNatureSuitableForStats(8, machampStats)).toBe(true) // Impish (+Def, -SpA)
      expect(isNatureSuitableForStats(23, machampStats)).toBe(true) // Careful (+SpD, -SpA)

      // Modest (+SpA, -Atk) & Timid (+Spe, -Atk) reduce attack
      expect(isNatureSuitableForStats(15, machampStats)).toBe(false) // Modest
      expect(isNatureSuitableForStats(10, machampStats)).toBe(false) // Timid
      expect(isNatureSuitableForStats(5, machampStats)).toBe(false) // Bold (+Def, -Atk)
      expect(isNatureSuitableForStats(17, machampStats)).toBe(false) // Quiet (+SpA, -Spe: boosts spAttack)
    })

    it('identifies suitable and unsuitable natures for special attackers', () => {
      const alakazamStats: StatValues = {
        health: 130,
        attack: 50,
        defense: 45,
        specialAttack: 155,
        specialDefense: 105,
        speed: 140,
      }
      // Modest (+SpA, -Atk) & Timid (+Spe, -Atk) are ideal
      expect(isNatureSuitableForStats(15, alakazamStats)).toBe(true) // Modest
      expect(isNatureSuitableForStats(10, alakazamStats)).toBe(true) // Timid

      // Adamant (+Atk, -SpA) & Jolly (+Spe, -SpA) reduce SpA
      expect(isNatureSuitableForStats(3, alakazamStats)).toBe(false) // Adamant
      expect(isNatureSuitableForStats(13, alakazamStats)).toBe(false) // Jolly
      expect(isNatureSuitableForStats(4, alakazamStats)).toBe(false) // Naughty (+Atk, -SpD: boosts attack)
    })
  })
})
