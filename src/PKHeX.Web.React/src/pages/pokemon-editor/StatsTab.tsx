import { Alert, Button, Descriptions, Flex, InputNumber, Progress, Space } from 'antd'
import type { DescriptionsProps } from 'antd'
import { draftHandle, type StatPatch, type StatValues } from '@pkhex-everywhere/engine'
import { useLoadedGame } from '@pkhex-everywhere/react'
import { gameName, statsAreApproximate } from '../../capabilities'
import { useTranslation } from '../../i18n'
import { useDraft } from './useDraft'

type Stat = keyof StatValues

const statKeys: Stat[] = ['health', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed']

const total = (values: StatValues) => statKeys.reduce((sum, key) => sum + values[key], 0)

const statColors: Record<Stat, string> = {
  health: '#52c41a',
  attack: '#fa8c16',
  defense: '#1890ff',
  specialAttack: '#722ed1',
  specialDefense: '#eb2f96',
  speed: '#13c2c2',
}

export function StatsTab() {
  const { details, submit } = useDraft()
  const { game } = useLoadedGame()
  const { t } = useTranslation()

  const stats: { key: Stat; label: string }[] = [
    { key: 'health', label: t('stats.hp', 'HP') },
    { key: 'attack', label: t('stats.attack', 'Attack') },
    { key: 'defense', label: t('stats.defense', 'Defense') },
    { key: 'specialAttack', label: t('stats.spAtk', 'Special Attack') },
    { key: 'specialDefense', label: t('stats.spDef', 'Special Defense') },
    { key: 'speed', label: t('stats.speed', 'Speed') },
  ]

  const inputs: { key: 'ivs' | 'evs' | 'avs'; label: string; values: StatValues | null }[] = [
    { key: 'ivs', label: 'IV', values: details.ivs },
    { key: 'evs', label: 'EV', values: details.evs },
    { key: 'avs', label: 'AV', values: details.avs },
  ]

  const statCeiling: Record<Stat, number> = {
    health: 714,
    attack: 526,
    defense: 614,
    specialAttack: 504,
    specialDefense: 614,
    speed: 548,
  }

  const statItems = (stat: { key: Stat; label: string }): DescriptionsProps['items'] => [
    {
      key: 'stat',
      label: t('editor.stats.stat', 'Stat'),
      children: (
        <Flex vertical gap={4} style={{ minWidth: 100 }}>
          <span style={{ fontWeight: 600 }}>{details.stats[stat.key]}</span>
          <Progress
            percent={Math.min(100, Math.max(1, Math.round((details.stats[stat.key] / (statCeiling[stat.key] || 500)) * 100)))}
            strokeColor={statColors[stat.key]}
            showInfo={false}
            size="small"
            style={{ margin: 0 }}
          />
        </Flex>
      ),
    },
    ...inputs.flatMap(({ key, label, values }) =>
      values === null
        ? []
        : [
            {
              key,
              label,
              children: (
                <InputNumber
                  aria-label={`${stat.label} ${label}`}
                  min={0}
                  value={values[stat.key]}
                  onChange={(value) => value !== null && submit({ [key]: { [stat.key]: value } as StatPatch })}
                />
              ),
            },
          ],
    ),
  ]

  const totalItems: DescriptionsProps['items'] = [
    { key: 'stat', label: t('editor.stats.stat', 'Stat'), children: total(details.stats) },
    ...inputs.flatMap(({ key, label, values }) => (values === null ? [] : [{ key, label, children: total(values) }])),
  ]

  return (
    <Flex vertical gap={20}>
      {game && statsAreApproximate(game) && (
        <Alert
          type="info"
          title={`Stats are approximate. They use the original games' base stats, which ${gameName(game)} may change.`}
        />
      )}
      {stats.map((stat) => (
        <Descriptions key={stat.key} bordered size="small" layout="vertical" title={stat.label} items={statItems(stat)} />
      ))}
      <Descriptions bordered size="small" layout="vertical" title={t('stats.total', 'Total')} items={totalItems} />
      {details.hiddenPower && (
        <Descriptions
          bordered
          size="small"
          layout="vertical"
          title={t('editor.stats.hiddenPower', 'Hidden Power')}
          items={[
            { key: 'type', label: t('editor.stats.type', 'Type'), children: details.hiddenPower.type },
            ...(details.hiddenPower.power === null
              ? []
              : [{ key: 'power', label: t('editor.stats.power', 'Power'), children: details.hiddenPower.power }]),
          ]}
        />
      )}
      {details.combatPower !== null && (
        <Descriptions
          bordered
          size="small"
          layout="vertical"
          title={t('editor.stats.extra', 'Extra')}
          items={[
            {
              key: 'combatPower',
              label: 'CP',
              children: (
                <Space>
                  <InputNumber
                    aria-label="CP"
                    min={0}
                    value={details.combatPower}
                    onChange={(combatPower) => combatPower !== null && submit({ combatPower })}
                  />
                  <Button onClick={() => submit({ combatPower: details.calculatedCombatPower })}>
                    {t('editor.stats.recalculate', 'Re-calculate')}
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      )}
    </Flex>
  )
}
