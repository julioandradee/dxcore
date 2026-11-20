import { useState } from 'react'
import { InfoCircleOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Descriptions, Empty, Flex, Space, Tag } from 'antd'
import { draftHandle } from '@pkhex-everywhere/engine'
import { useQuery } from '@pkhex-everywhere/react'
import { useTranslation } from '../../i18n'
import { getAbilityDescription } from '../../utils/abilityDescriptions'
import { ChoiceSelect } from './ChoiceSelect'
import { isLocked } from './locked'
import { useDraft } from './useDraft'

export function AbilityTab() {
  const { details, submit } = useDraft()
  const options = useQuery('pokemon.options', draftHandle)
  const [viewedAbilityId, setViewedAbilityId] = useState<number | null>(null)
  const { t } = useTranslation()

  if (!options.abilities || options.abilities.length === 0) {
    return (
      <Empty
        description={t(
          'ability.notAvailableInGen',
          'Este jogo (Geração 1 ou 2) não possui sistema de habilidades passivas.',
        )}
      />
    )
  }

  const viewedAbility = options.abilities.find((a) => a.id === viewedAbilityId)

  const handleAbilityClick = (abilityId: number) => {
    if (!isLocked(options, 'ability')) {
      submit({ ability: abilityId })
    }
    setViewedAbilityId(abilityId)
  }

  return (
    <Flex vertical gap={16}>
      <Alert
        type="info"
        message={t('ability.bannerTitle', 'Habilidade Passiva do Pokémon')}
        description={t(
          'ability.bannerDesc',
          'Habilidades passivas concedem efeitos especiais permanentes durante as batalhas ou na exploração do mapa.',
        )}
      />

      <Card size="small">
        <Descriptions bordered size="small" layout="vertical" column={1}>
          <Descriptions.Item label={t('editor.fields.ability', 'Habilidade Ativa')}>
            <ChoiceSelect
              label={t('editor.fields.ability', 'Habilidade')}
              choices={options.abilities}
              value={details.ability}
              disabled={isLocked(options, 'ability')}
              onChange={(ability) => submit({ ability })}
            />
          </Descriptions.Item>

          <Descriptions.Item label={t('ability.availableOptions', 'Habilidades Suportadas')}>
            <Flex gap={8} wrap="wrap">
              {options.abilities.map((ab) => (
                <Tag
                  key={ab.id}
                  color={ab.id === details.ability ? 'blue' : 'default'}
                  style={{
                    cursor: 'pointer',
                    padding: '2px 8px',
                    borderRadius: 4,
                    userSelect: 'none',
                  }}
                  onClick={() => handleAbilityClick(ab.id)}
                  title={t('ability.clickForDesc', 'Clique para aplicar e ver a descrição')}
                >
                  {ab.name} {ab.id === details.ability && '✓'}
                </Tag>
              ))}
            </Flex>
          </Descriptions.Item>
        </Descriptions>

        {/* Descrição detalhada da habilidade clicada */}
        {viewedAbility && (
          <div style={{ marginTop: 12 }}>
            <Alert
              type="info"
              style={{ borderRadius: 6 }}
              message={
                <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
                  <Space size={8}>
                    <span style={{ fontWeight: 600 }}>{viewedAbility.name}</span>
                    {viewedAbility.id === details.ability && (
                      <Tag color="blue" style={{ margin: 0, padding: '0 6px', fontSize: 11 }}>
                        {t('ability.active', 'Habilidade Ativa')} ✓
                      </Tag>
                    )}
                  </Space>
                  <Button
                    type="text"
                    size="small"
                    onClick={() => setViewedAbilityId(null)}
                    style={{ padding: '0 4px', height: 20, fontSize: 12 }}
                    title={t('common.close', 'Fechar')}
                  >
                    ✕
                  </Button>
                </Flex>
              }
              description={
                <div style={{ marginTop: 4, fontSize: 13, lineHeight: 1.5 }}>
                  {getAbilityDescription(viewedAbility.id, viewedAbility.name, t)}
                </div>
              }
            />
          </div>
        )}
      </Card>
    </Flex>
  )
}
