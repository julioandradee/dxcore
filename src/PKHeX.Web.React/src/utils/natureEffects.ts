import type { StatValues } from '@pkhex-everywhere/engine'

export type StatType = 'attack' | 'defense' | 'speed' | 'spAttack' | 'spDefense'

export interface NatureInfo {
  id: number
  name: string
  increased: StatType | null
  decreased: StatType | null
  isNeutral: boolean
}

const statMapping: Record<number, StatType> = {
  0: 'attack',
  1: 'defense',
  2: 'speed',
  3: 'spAttack',
  4: 'spDefense',
}

const natureNames: string[] = [
  'Hardy',    // 0
  'Lonely',   // 1
  'Brave',    // 2
  'Adamant',  // 3
  'Naughty',  // 4
  'Bold',     // 5
  'Docile',   // 6
  'Relaxed',  // 7
  'Impish',   // 8
  'Lax',      // 9
  'Timid',    // 10
  'Hasty',    // 11
  'Serious',  // 12
  'Jolly',    // 13
  'Naive',    // 14
  'Modest',   // 15
  'Mild',     // 16
  'Quiet',    // 17
  'Bashful',  // 18
  'Rash',     // 19
  'Calm',     // 20
  'Gentle',   // 21
  'Sassy',    // 22
  'Careful',  // 23
  'Quirky',   // 24
]

export function getNatureInfo(natureId: number): NatureInfo {
  const incIndex = Math.floor(natureId / 5)
  const decIndex = natureId % 5
  const isNeutral = incIndex === decIndex

  return {
    id: natureId,
    name: natureNames[natureId] ?? `Nature #${natureId}`,
    increased: isNeutral ? null : statMapping[incIndex],
    decreased: isNeutral ? null : statMapping[decIndex],
    isNeutral,
  }
}

export function getNatureDescription(
  natureId: number,
  t: (key: string, fallback?: string) => string,
): string {
  const info = getNatureInfo(natureId)
  if (info.isNeutral) {
    return t('nature.neutral', 'Natureza Neutra (Sem alteração de atributos)')
  }

  const statNames: Record<StatType, string> = {
    attack: t('stats.attack', 'Ataque'),
    defense: t('stats.defense', 'Defesa'),
    spAttack: t('stats.spAtk', 'Atq. Especial'),
    spDefense: t('stats.spDef', 'Def. Especial'),
    speed: t('stats.speed', 'Velocidade'),
  }

  const incName = info.increased ? statNames[info.increased] : ''
  const decName = info.decreased ? statNames[info.decreased] : ''

  return `🔺 +10% ${incName}  |  🔻 -10% ${decName}`
}

export function getShortStatName(stat: StatType | null): string {
  if (!stat) return ''
  switch (stat) {
    case 'attack':
      return 'Atk'
    case 'defense':
      return 'Def'
    case 'spAttack':
      return 'SpA'
    case 'spDefense':
      return 'SpD'
    case 'speed':
      return 'Spe'
  }
}

/**
 * Determina se uma natureza é considerada adequada/favorável para os status atuais do Pokémon.
 * Naturezas que penalizam os atributos chave ou fortalecem atributos inúteis recebem opacidade menor.
 */
export function isNatureSuitableForStats(natureId: number, stats?: StatValues | null): boolean {
  if (!stats) return true

  const info = getNatureInfo(natureId)
  if (info.isNeutral) return true // Naturezas neutras são equilibradas e sempre aceitáveis

  const { attack, defense, specialAttack, specialDefense, speed } = stats

  // Perfil ofensivo com margem de 15%
  const isPhysical = attack > specialAttack * 1.15
  const isSpecial = specialAttack > attack * 1.15

  if (isPhysical) {
    // Para atacante físico, reduzir o Ataque Físico é prejudicial
    if (info.decreased === 'attack') return false
    // Aumentar o Atq. Especial (inútil) em troca de defesas ou velocidade não é adequado
    if (info.increased === 'spAttack') return false
  }

  if (isSpecial) {
    // Para atacante especial, reduzir o Atq. Especial é prejudicial
    if (info.decreased === 'spAttack') return false
    // Aumentar o Ataque Físico inútil em troca de outro atributo útil não é adequado
    if (info.increased === 'attack') return false
  }

  // Identificação do atributo dominante (não-HP)
  const nonHpStats: { type: StatType; val: number }[] = [
    { type: 'attack', val: attack },
    { type: 'defense', val: defense },
    { type: 'spAttack', val: specialAttack },
    { type: 'spDefense', val: specialDefense },
    { type: 'speed', val: speed },
  ]
  const highest = nonHpStats.reduce((max, s) => (s.val > max.val ? s : max), nonHpStats[0])
  const avg = nonHpStats.reduce((sum, s) => sum + s.val, 0) / nonHpStats.length

  // Se o Pokémon tem um atributo dominante (> 20% acima da média dos seus status),
  // uma natureza que reduz exatamente esse atributo é contraproducente
  if (highest.val > avg * 1.2 && info.decreased === highest.type) {
    return false
  }

  return true
}
