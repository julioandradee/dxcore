import { CheckCircleFilled } from '@ant-design/icons'
import { Alert, Button, Card, Col, Flex, Modal, Row, Space, Tag, Typography } from 'antd'
import type { PokemonSummary } from '@pkhex-everywhere/engine'
import { PokemonSprite } from '../../components/PokemonSprite'
import { TypeBadge } from '../../components/TypeBadge'
import { useNavigate } from '../../host'
import { useTranslation } from '../../i18n'
import { routes } from '../../routes'

interface ImportedPokemonCardProps {
  pokemon: PokemonSummary
  onView: () => void
}

function ImportedPokemonCard({ pokemon, onView }: ImportedPokemonCardProps) {
  const { t } = useTranslation()
  const hasNickname = Boolean(pokemon.nickname && pokemon.nickname !== pokemon.species)
  const dexNumber = pokemon.speciesId !== null ? `#${String(pokemon.speciesId).padStart(4, '0')}` : '—'
  const genderSymbol = pokemon.gender === 'male' ? '♂' : pokemon.gender === 'female' ? '♀' : null
  const genderColor = pokemon.gender === 'male' ? '#1890ff' : '#eb2f96'
  const isBoxPokemon = typeof pokemon.at.box === 'number'

  return (
    <Card
      hoverable
      size="small"
      style={{
        height: '100%',
        borderRadius: 10,
        position: 'relative',
        transition: 'all 0.2s ease-in-out',
      }}
      styles={{
        body: {
          padding: '10px 8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          height: '100%',
          justifyContent: 'space-between',
        },
      }}
    >
      {/* Topo do Card: Dex # + Tags (Shiny, Egg) */}
      <Flex justify="space-between" align="center" style={{ width: '100%' }}>
        <span style={{ color: '#8c8c8c', fontFamily: 'monospace', fontWeight: 600, fontSize: 12 }}>
          {dexNumber}
        </span>
        <Flex align="center" gap={4}>
          {pokemon.isShiny && (
            <span
              title={t('editor.fields.shiny', 'Shiny')}
              style={{ fontSize: 13, lineHeight: 1, userSelect: 'none' }}
            >
              ✨
            </span>
          )}
          {pokemon.isEgg && (
            <span
              title={t('editor.fields.egg', 'Ovo')}
              style={{ fontSize: 13, lineHeight: 1, userSelect: 'none' }}
            >
              🥚
            </span>
          )}
        </Flex>
      </Flex>

      {/* Ilustração compacta por ícone sprite */}
      <div
        style={{
          width: '100%',
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          marginBottom: 12,
        }}
      >
        <div style={{ transform: 'scale(1.2)' }}>
          <PokemonSprite pokemon={pokemon} />
        </div>
      </div>

      {/* Nome e Apelido */}
      <Flex vertical align="center" gap={2} style={{ width: '100%', textAlign: 'center' }}>
        <Flex align="center" justify="center" gap={6} wrap="wrap">
          <Typography.Text strong style={{ fontSize: 12 }}>
            {hasNickname ? pokemon.nickname : pokemon.species}
          </Typography.Text>
          {genderSymbol && (
            <span style={{ color: genderColor, fontWeight: 700, fontSize: 13 }}>
              {genderSymbol}
            </span>
          )}
        </Flex>
        {hasNickname && (
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
            ({pokemon.species})
          </Typography.Text>
        )}
      </Flex>

      {/* Badges de Tipos */}
      {pokemon.types && pokemon.types.length > 0 && (
        <Space size={4} wrap style={{ justifyContent: 'center' }}>
          {pokemon.types.map((typeId) => (
            <TypeBadge key={typeId} typeId={typeId} size="small" />
          ))}
        </Space>
      )}

      {/* Badges de Nível e Caixa */}
      <Flex justify="center" gap={6} wrap="wrap">
        <Tag
          color={pokemon.level === 100 ? 'purple' : pokemon.level >= 50 ? 'blue' : 'default'}
          style={{ fontWeight: 600, margin: 0 }}
        >
          {t('box.levelPrefix', 'Lvl')} {pokemon.level}
        </Tag>
        {isBoxPokemon && (
          <Tag color="cyan" style={{ margin: 0 }}>
            {t('box.boxLabel', 'Caixa')} {(pokemon.at.box ?? 0) + 1}
            {typeof pokemon.at.slot === 'number' ? ` #${pokemon.at.slot + 1}` : ''}
          </Tag>
        )}
      </Flex>

      {/* Botão de Ação: Ver */}
      <Button
        type="link"
        size="small"
        style={{ padding: '0 4px', height: 'auto', marginTop: 2, fontSize: 12 }}
        onClick={onView}
      >
        {t('actions.view', 'Ver')}
      </Button>
    </Card>
  )
}

interface ImportedPokemonModalProps {
  open: boolean
  imported: PokemonSummary[]
  failed?: { name: string; error: string }[]
  onClose: () => void
}

export function ImportedPokemonModal({ open, imported, failed = [], onClose }: ImportedPokemonModalProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          {t('common.close', 'Fechar')}
        </Button>,
      ]}
      width={720}
      style={{ maxWidth: '95vw', top: 20 }}
      title={
        <Flex align="center" gap={8}>
          <CheckCircleFilled style={{ color: '#52c41a', fontSize: 20 }} />
          <span>{t('import.modalTitle', 'Pokémon Importados')}</span>
        </Flex>
      }
    >
      <Flex vertical gap={12} style={{ marginTop: 16 }}>
        <Alert
          type="success"
          title={
            imported.length === 1
              ? t('import.singleSuccess', '1 Pokémon importado com sucesso!')
              : t('import.multipleSuccess', '{0} Pokémon importados com sucesso!').replace(
                '{0}',
                String(imported.length),
              )
          }
          description={t(
            'import.modalDescription',
            'Os Pokémon abaixo foram adicionados às suas caixas.',
          )}
        />

        {failed.length > 0 && (
          <Alert
            type="warning"
            title={t('import.failedCount', '{0} arquivo(s) não puderam ser importados').replace(
              '{0}',
              String(failed.length),
            )}
            description={
              <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                {failed.map((f, i) => (
                  <li key={i}>
                    <strong>{f.name}</strong>: {f.error}
                  </li>
                ))}
              </ul>
            }
          />
        )}

        <div style={{ maxHeight: '55vh', overflowY: 'auto', overflowX: 'hidden' }}>
          <Row gutter={[10, 10]}>
            {imported.map((p, idx) => (
              <Col xs={12} sm={8} md={6} key={p.id ?? `${p.speciesId}-${idx}`}>
                <ImportedPokemonCard
                  pokemon={p}
                  onView={() => {
                    onClose()
                    void navigate(routes.pokemon(p))
                  }}
                />
              </Col>
            ))}
          </Row>
        </div>
      </Flex>
    </Modal>
  )
}
