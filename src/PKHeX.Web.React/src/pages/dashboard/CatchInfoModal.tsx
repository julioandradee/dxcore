import { useEffect, useState } from 'react'
import {
  CompassOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
  SwapOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { Alert, Button, Card, Flex, Modal, Spin, Tag, Typography, theme } from 'antd'
import type { EncounterRow } from '@pkhex-everywhere/engine'
import { useEngine, useQuery } from '@pkhex-everywhere/react'
import { pokemonOfficialArtworkUrl } from '../../components/PokemonImage'
import { TypeBadge } from '../../components/TypeBadge'
import { useTranslation } from '../../i18n'
import { getPokemonObtainInfo } from './pokemonObtainMethods'

export interface CatchInfoModalProps {
  open: boolean
  onClose: () => void
  species: {
    id: number
    name: string
    types: number[]
    seen: boolean
  } | null
  onSelectSpecies?: (speciesId: number) => void
}

export function CatchInfoModal({ open, onClose, species, onSelectSpecies }: CatchInfoModalProps) {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const engine = useEngine()
  const { versions, default: defaultVersion } = useQuery('encounters.versions')
  const game = useQuery('game.get')

  const [loading, setLoading] = useState(false)
  const [encounters, setEncounters] = useState<EncounterRow[]>([])
  const [error, setError] = useState<string | null>(null)

  const activeVersion = versions.find((v) => v.id === defaultVersion)
  const obtainInfo = species ? getPokemonObtainInfo(species.id, game?.generation, activeVersion?.name ?? game?.version) : null

  useEffect(() => {
    if (!open || !species || defaultVersion === undefined) {
      setEncounters([])
      setError(null)
      return
    }

    let isMounted = true
    setLoading(true)
    setError(null)

    engine.encounters
      .search(defaultVersion, species.id)
      .then((rows) => {
        if (isMounted) {
          setEncounters(rows || [])
          setLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(String(err))
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [open, species?.id, defaultVersion])

  if (!species) return null

  const dexFormatted = `#${String(species.id).padStart(4, '0')}`
  const artworkUrl = pokemonOfficialArtworkUrl(species.id, false)

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          {t('common.close', 'Fechar')}
        </Button>,
      ]}
      width={560}
      centered
      destroyOnHidden
      title={
        <Flex align="center" gap={8}>
          <CompassOutlined style={{ color: '#38bdf8' }} />
          <span>{t('dashboard.catchInfoTitle', 'Como Capturar / Obter')}</span>
        </Flex>
      }
    >
      <Flex vertical gap={16} style={{ marginTop: 12 }}>
        {/* Pokémon Identity Banner */}
        <div
          style={{
            background: token.colorFillAlter,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: 12,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={artworkUrl ?? undefined}
              alt={species.name}
              style={{
                width: 80,
                height: 80,
                maxHeight: 80,
                maxWidth: 80,
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))',
              }}
            />
          </div>
          <Flex vertical gap={4} style={{ flex: 1, minWidth: 0 }}>
            <Flex align="center" gap={8} wrap="wrap">
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#8c8c8c', fontSize: 13 }}>
                {dexFormatted}
              </span>
              <Typography.Title level={5} style={{ margin: 0 }}>
                {species.name}
              </Typography.Title>
              {species.seen ? (
                <Tag color="orange" style={{ margin: 0, fontSize: 11, fontWeight: 600 }}>
                  {t('dashboard.statusSeen', 'Apenas Visto')}
                </Tag>
              ) : (
                <Tag color="default" style={{ margin: 0, fontSize: 11, fontWeight: 600 }}>
                  {t('dashboard.statusMissing', 'Não capturado')}
                </Tag>
              )}
            </Flex>
            <Flex wrap="wrap" gap={4} style={{ marginTop: 4 }}>
              {species.types.map((typeId) => (
                <TypeBadge key={typeId} typeId={typeId} size="small" />
              ))}
            </Flex>
          </Flex>
        </div>

        {/* Specialized Obtainment Info (Evolution / Trade / Items) */}
        {obtainInfo && (
          <Card
            size="small"
            style={{
              borderRadius: 10,
              border: '1px solid rgba(56, 189, 248, 0.3)',
              background: 'rgba(56, 189, 248, 0.04)',
            }}
          >
            <Flex vertical gap={6}>
              <Flex align="center" gap={6}>
                {obtainInfo.method === 'trade' || obtainInfo.method === 'item_trade' ? (
                  <SwapOutlined style={{ color: '#38bdf8' }} />
                ) : obtainInfo.method === 'stone' ? (
                  <ThunderboltOutlined style={{ color: '#f59e0b' }} />
                ) : (
                  <InfoCircleOutlined style={{ color: '#38bdf8' }} />
                )}
                <Typography.Text strong style={{ color: '#38bdf8' }}>
                  {obtainInfo.title}
                </Typography.Text>
              </Flex>
              <Typography.Text style={{ fontSize: 13 }}>
                {obtainInfo.description}
              </Typography.Text>
              {obtainInfo.preEvolutionId && obtainInfo.preEvolutionName && onSelectSpecies && (
                <div style={{ marginTop: 6 }}>
                  <Button
                    size="small"
                    type="link"
                    icon={<CompassOutlined />}
                    style={{ padding: 0 }}
                    onClick={() => onSelectSpecies(obtainInfo.preEvolutionId!)}
                  >
                    {t('dashboard.catchInfoViewPreEvolution', 'Ver como capturar')} {obtainInfo.preEvolutionName}
                  </Button>
                </div>
              )}
            </Flex>
          </Card>
        )}

        {/* Encounters List */}
        <div>
          <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
            <Typography.Text strong style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <EnvironmentOutlined style={{ color: '#10b981', marginRight: '6px' }} />
              {t('dashboard.catchInfoLocations', 'Locais de Encontro na Natureza')}
              {activeVersion && (
                <span style={{ color: '#8c8c8c', fontWeight: 400, marginLeft: '6px' }}>({activeVersion.name})</span>
              )}
            </Typography.Text>
          </Flex>

          {loading ? (
            <Flex justify="center" align="center" style={{ padding: '24px 0' }}>
              <Spin />
            </Flex>
          ) : error ? (
            <Alert type="error" message={error} />
          ) : encounters.length > 0 ? (
            <Flex vertical gap={8} style={{ maxHeight: 240, overflowY: 'auto', paddingRight: 4 }}>
              {encounters.map((enc) => (
                <div
                  key={enc.index}
                  style={{
                    padding: '8px',
                    borderRadius: 8,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    background: token.colorBgContainer,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <Flex vertical gap={2} style={{ minWidth: 0 }}>
                    <Typography.Text strong style={{ fontSize: 13 }}>
                      📍 {enc.location && enc.location !== '(Unknown)' ? enc.location : enc.name || t('dashboard.catchInfoSpecialEncounter', 'Encontro Especial / Evento')}
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                      {enc.name}
                    </Typography.Text>
                  </Flex>
                  <Flex align="center" gap={6}>
                    <Tag color="blue" style={{ margin: 0, fontWeight: 600 }}>
                      Nv. {enc.levelRange}
                    </Tag>
                  </Flex>
                </div>
              ))}
            </Flex>
          ) : (
            <Alert
              type="info"
              showIcon={false}
              message={
                <Typography.Text style={{ fontSize: 12 }}>
                  {t(
                    'dashboard.catchInfoNoEncounter',
                    'Nenhum local de encontro selvagem direto encontrado nesta versão do jogo.',
                  )}
                  {obtainInfo ? ' Consulte as orientações de evolução, troca ou evento acima.' : ''}
                </Typography.Text>
              }
            />
          )}
        </div>
      </Flex>
    </Modal>
  )
}
