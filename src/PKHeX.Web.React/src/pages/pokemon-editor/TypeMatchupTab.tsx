import { Card, Descriptions, Empty, Flex, Space, Tag, Typography } from 'antd'
import { TypeBadge } from '../../components/TypeBadge'
import { useTranslation } from '../../i18n'
import { calculateTypeMatchups } from '../../utils/typeMatchups'
import { useDraft } from './useDraft'

export function TypeMatchupTab() {
  const { details } = useDraft()
  const { t } = useTranslation()

  const matchups = calculateTypeMatchups(details.types)

  if (!details.types || details.types.length === 0) {
    return <Empty description={t('matchups.noTypes', 'Nenhum tipo definido para este Pokémon.')} />
  }

  return (
    <Flex vertical gap={16}>
      {/* Resumo de Tipos do Pokémon */}
      <Card size="small">
        <Flex align="center" gap={12} wrap="wrap">
          <Typography.Text strong style={{ fontSize: 14 }}>
            {t('editor.fields.types', 'Tipos do Pokémon')}:
          </Typography.Text>
          <Space size={6} wrap>
            {details.types.map((typeId) => (
              <TypeBadge key={typeId} typeId={typeId} size="middle" />
            ))}
          </Space>
        </Flex>
      </Card>

      {/* Eficácia Defensiva */}
      <Card
        title={
          <Flex align="center" gap={8}>
            <span>🛡️</span>
            <span>{t('matchups.defensiveTitle', 'Eficácia Defensiva (Dano Recebido)')}</span>
          </Flex>
        }
        size="small"
      >
        <Descriptions bordered size="small" layout="vertical" column={1}>
          {/* Fraquezas Críticas 4x */}
          {matchups.weaknesses4x.length > 0 && (
            <Descriptions.Item
              label={
                <Tag color="volcano" style={{ fontWeight: 600 }}>
                  💥 4x {t('matchups.criticalWeakness', 'Dano Crítico')}
                </Tag>
              }
            >
              <Space size={6} wrap>
                {matchups.weaknesses4x.map((id) => (
                  <TypeBadge key={id} typeId={id} />
                ))}
              </Space>
            </Descriptions.Item>
          )}

          {/* Fraquezas 2x */}
          <Descriptions.Item
            label={
              <Tag color="red" style={{ fontWeight: 600 }}>
                ⚠️ 2x {t('matchups.weakness', 'Fraqueza')}
              </Tag>
            }
          >
            {matchups.weaknesses2x.length > 0 ? (
              <Space size={6} wrap>
                {matchups.weaknesses2x.map((id) => (
                  <TypeBadge key={id} typeId={id} />
                ))}
              </Space>
            ) : (
              <Typography.Text type="secondary">
                {t('matchups.none', 'Nenhuma fraqueza 2x')}
              </Typography.Text>
            )}
          </Descriptions.Item>

          {/* Resistências 0.5x */}
          <Descriptions.Item
            label={
              <Tag color="green" style={{ fontWeight: 600 }}>
                🛡️ 0.5x {t('matchups.resistance', 'Resistência')}
              </Tag>
            }
          >
            {matchups.resistances05x.length > 0 ? (
              <Space size={6} wrap>
                {matchups.resistances05x.map((id) => (
                  <TypeBadge key={id} typeId={id} />
                ))}
              </Space>
            ) : (
              <Typography.Text type="secondary">
                {t('matchups.none', 'Nenhuma')}
              </Typography.Text>
            )}
          </Descriptions.Item>

          {/* Super Resistências 0.25x */}
          {matchups.resistances025x.length > 0 && (
            <Descriptions.Item
              label={
                <Tag color="cyan" style={{ fontWeight: 600 }}>
                  💎 0.25x {t('matchups.superResistance', 'Super Resistência')}
                </Tag>
              }
            >
              <Space size={6} wrap>
                {matchups.resistances025x.map((id) => (
                  <TypeBadge key={id} typeId={id} />
                ))}
              </Space>
            </Descriptions.Item>
          )}

          {/* Imunidades 0x */}
          <Descriptions.Item
            label={
              <Tag color="purple" style={{ fontWeight: 600 }}>
                🚫 0x {t('matchups.immunity', 'Imunidade')}
              </Tag>
            }
          >
            {matchups.immunities0x.length > 0 ? (
              <Space size={6} wrap>
                {matchups.immunities0x.map((id) => (
                  <TypeBadge key={id} typeId={id} />
                ))}
              </Space>
            ) : (
              <Typography.Text type="secondary">
                {t('matchups.none', 'Nenhuma')}
              </Typography.Text>
            )}
          </Descriptions.Item>

          {/* Dano Normal 1x */}
          <Descriptions.Item
            label={
              <Tag color="default" style={{ fontWeight: 500 }}>
                ⚪ 1x {t('matchups.normal', 'Dano Normal')}
              </Tag>
            }
          >
            <Space size={6} wrap>
              {matchups.normal1x.map((id) => (
                <TypeBadge key={id} typeId={id} />
              ))}
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Cobertura Ofensiva */}
      <Card
        title={
          <Flex align="center" gap={8}>
            <span>⚔️</span>
            <span>{t('matchups.offensiveTitle', 'Vantagens Ofensivas (Ataques STAB 2x)')}</span>
          </Flex>
        }
        size="small"
      >
        <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 12 }}>
          {t(
            'matchups.offensiveDesc',
            'Tipos contra os quais os golpes que compartilham os tipos deste Pokémon causam dano super efetivo (2x):',
          )}
        </Typography.Paragraph>

        {matchups.offensiveSuperEffective.length > 0 ? (
          <Space size={6} wrap>
            {matchups.offensiveSuperEffective.map((id) => (
              <TypeBadge key={id} typeId={id} size="middle" />
            ))}
          </Space>
        ) : (
          <Typography.Text type="secondary">
            {t('matchups.none', 'Nenhuma vantagem ofensiva')}
          </Typography.Text>
        )}
      </Card>
    </Flex>
  )
}
