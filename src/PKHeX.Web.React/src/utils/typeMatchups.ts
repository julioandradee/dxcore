/**
 * Matriz oficial de eficácia de tipos (Geração 6+)
 * attackType -> defendingType -> multiplicador (0, 0.5, 2)
 * Se não estiver listado, o multiplicador é 1.
 */
const effectivenessMatrix: Record<number, Record<number, number>> = {
  // Normal (0)
  0: { 7: 0, 5: 0.5, 8: 0.5 },
  // Fighting (1)
  1: { 7: 0, 2: 0.5, 3: 0.5, 6: 0.5, 13: 0.5, 17: 0.5, 0: 2, 5: 2, 8: 2, 14: 2, 16: 2 },
  // Flying (2)
  2: { 5: 0.5, 8: 0.5, 12: 0.5, 1: 2, 6: 2, 11: 2 },
  // Poison (3)
  3: { 8: 0, 3: 0.5, 4: 0.5, 5: 0.5, 7: 0.5, 11: 2, 17: 2 },
  // Ground (4)
  4: { 2: 0, 6: 0.5, 11: 0.5, 3: 2, 5: 2, 8: 2, 9: 2, 12: 2 },
  // Rock (5)
  5: { 1: 0.5, 4: 0.5, 8: 0.5, 2: 2, 6: 2, 9: 2, 14: 2 },
  // Bug (6)
  6: { 1: 0.5, 2: 0.5, 3: 0.5, 7: 0.5, 8: 0.5, 9: 0.5, 17: 0.5, 11: 2, 13: 2, 16: 2 },
  // Ghost (7)
  7: { 0: 0, 16: 0.5, 7: 2, 13: 2 },
  // Steel (8)
  8: { 8: 0.5, 9: 0.5, 10: 0.5, 12: 0.5, 5: 2, 14: 2, 17: 2 },
  // Fire (9)
  9: { 5: 0.5, 9: 0.5, 10: 0.5, 15: 0.5, 6: 2, 8: 2, 11: 2, 14: 2 },
  // Water (10)
  10: { 10: 0.5, 11: 0.5, 15: 0.5, 4: 2, 5: 2, 9: 2 },
  // Grass (11)
  11: { 2: 0.5, 3: 0.5, 6: 0.5, 8: 0.5, 9: 0.5, 11: 0.5, 15: 0.5, 4: 2, 5: 2, 10: 2 },
  // Electric (12)
  12: { 4: 0, 11: 0.5, 12: 0.5, 15: 0.5, 2: 2, 10: 2 },
  // Psychic (13)
  13: { 16: 0, 8: 0.5, 13: 0.5, 1: 2, 3: 2 },
  // Ice (14)
  14: { 8: 0.5, 9: 0.5, 10: 0.5, 14: 0.5, 2: 2, 4: 2, 11: 2, 15: 2 },
  // Dragon (15)
  15: { 17: 0, 8: 0.5, 15: 2 },
  // Dark (16)
  16: { 1: 0.5, 16: 0.5, 17: 0.5, 7: 2, 13: 2 },
  // Fairy (17)
  17: { 3: 0.5, 8: 0.5, 9: 0.5, 1: 2, 15: 2, 16: 2 },
}

export function getSingleEffectiveness(attackType: number, defendType: number): number {
  return effectivenessMatrix[attackType]?.[defendType] ?? 1
}

export interface TypeDefensiveMatchup {
  typeId: number
  multiplier: number
}

export interface TypeMatchupSummary {
  weaknesses4x: number[]
  weaknesses2x: number[]
  resistances05x: number[]
  resistances025x: number[]
  immunities0x: number[]
  normal1x: number[]
  offensiveSuperEffective: number[]
}

const allStandardTypes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]

export function calculateTypeMatchups(pokemonTypes: number[]): TypeMatchupSummary {
  const validTypes = pokemonTypes.filter((t) => t >= 0 && t <= 17)
  const uniqueTypes = Array.from(new Set(validTypes))

  const summary: TypeMatchupSummary = {
    weaknesses4x: [],
    weaknesses2x: [],
    resistances05x: [],
    resistances025x: [],
    immunities0x: [],
    normal1x: [],
    offensiveSuperEffective: [],
  }

  if (uniqueTypes.length === 0) {
    return summary
  }

  // 1. Defensivo: dano recebido de cada um dos 18 tipos
  for (const attackType of allStandardTypes) {
    let multiplier = 1
    for (const defType of uniqueTypes) {
      multiplier *= getSingleEffectiveness(attackType, defType)
    }

    if (multiplier === 0) {
      summary.immunities0x.push(attackType)
    } else if (multiplier === 4) {
      summary.weaknesses4x.push(attackType)
    } else if (multiplier === 2) {
      summary.weaknesses2x.push(attackType)
    } else if (multiplier === 0.25) {
      summary.resistances025x.push(attackType)
    } else if (multiplier === 0.5) {
      summary.resistances05x.push(attackType)
    } else if (multiplier === 1) {
      summary.normal1x.push(attackType)
    }
  }

  // 2. Ofensivo: tipos contra os quais os ataques STAB do Pokémon causam 2x
  const offensiveTargets = new Set<number>()
  for (const myType of uniqueTypes) {
    const attacks = effectivenessMatrix[myType] ?? {}
    for (const [defTypeStr, mult] of Object.entries(attacks)) {
      if (mult === 2) {
        offensiveTargets.add(Number(defTypeStr))
      }
    }
  }
  summary.offensiveSuperEffective = Array.from(offensiveTargets).sort((a, b) => a - b)

  return summary
}
