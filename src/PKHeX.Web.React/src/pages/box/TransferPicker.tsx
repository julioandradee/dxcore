import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircleFilled,
  ExclamationCircleFilled,
  InfoCircleFilled,
  LoadingOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  App,
  Button,
  Card,
  Checkbox,
  Col,
  Empty,
  Flex,
  Input,
  Modal,
  Row,
  Segmented,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import {
  EngineError,
  type PokemonHandle,
  type PokemonSummary,
  type TransferChange,
  type TransferOffer,
  type TransferPreview,
  type TransferSummary,
} from '@pkhex-everywhere/engine'
import { useEngine } from '@pkhex-everywhere/react'
import { gameName } from '../../capabilities'
import { PokemonSprite } from '../../components/PokemonSprite'
import { TypeBadge } from '../../components/TypeBadge'
import { downloadFile } from '../../host'
import { useTranslation } from '../../i18n'
import { describeChange, getRefusalReason } from './transferLabels'
import { transferPick } from './transferPick'

type View = 'party' | 'box'

const handleKey = (at: PokemonHandle) => JSON.stringify(at)
const pickKey = (pokemon: PokemonSummary) => handleKey(pokemon.at)

interface TransferPokemonCardProps {
  pokemon: PokemonSummary
  isSelected: boolean
  onToggleSelect: () => void
  refusedReason?: string
  changes?: TransferChange[]
  hasOffered: boolean
  isLoadingPreview: boolean
  t: (key: string, fallback?: string) => string
}

function TransferPokemonCard({
  pokemon,
  isSelected,
  onToggleSelect,
  refusedReason,
  changes,
  hasOffered,
  isLoadingPreview,
  t,
}: TransferPokemonCardProps) {
  const [infoOpen, setInfoOpen] = useState(false)

  const dexNumber =
    pokemon.speciesId !== null && pokemon.speciesId !== undefined
      ? `#${String(pokemon.speciesId).padStart(4, '0')}`
      : '—'

  const hasNickname = Boolean(pokemon.nickname && pokemon.nickname.trim() && pokemon.nickname !== pokemon.species)
  const genderSymbol = pokemon.gender === 'male' ? '♂' : pokemon.gender === 'female' ? '♀' : null
  const genderColor = pokemon.gender === 'male' ? '#1890ff' : '#eb2f96'
  const isBoxPokemon = typeof pokemon.at.box === 'number'

  const hasChanges = Boolean(changes && changes.length > 0)
  const hasInfo = isSelected && (Boolean(refusedReason) || hasOffered || isLoadingPreview)

  let infoText = ''
  let tooltipContent: React.ReactNode = null

  if (refusedReason) {
    infoText = refusedReason
    tooltipContent = (
      <Typography.Text type="danger" style={{ display: 'block' }}>
        {refusedReason}
      </Typography.Text>
    )
  } else if (hasChanges && changes) {
    infoText = changes.map((c) => describeChange(c, t)).join('; ')
    tooltipContent = (
      <Flex vertical gap={4}>
        <Typography.Text strong style={{ color: '#fff', fontSize: 12 }}>
          {t('transfer.changes', 'Alterações na transferência:')}
        </Typography.Text>
        {changes.map((change, idx) => (
          <Typography.Text key={idx} style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, display: 'block' }}>
            {describeChange(change, t)}
          </Typography.Text>
        ))}
      </Flex>
    )
  } else if (hasOffered) {
    infoText = t('transfer.noChanges', 'Compatível sem alterações')
    tooltipContent = (
      <Typography.Text style={{ color: '#fff', fontSize: 11 }}>
        {t('transfer.noChanges', 'Compatível sem alterações')}
      </Typography.Text>
    )
  }

  return (
    <Card
      hoverable
      size="small"
      onClick={onToggleSelect}
      style={{
        height: '100%',
        borderRadius: 10,
        position: 'relative',
        cursor: 'pointer',
        border: isSelected ? (refusedReason ? '2px solid #ff4d4f' : '2px solid #DC0A2D') : undefined,
        background: isSelected ? (refusedReason ? 'rgba(255, 77, 79, 0.05)' : 'rgba(220, 10, 45, 0.04)') : undefined,
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
      {/* Topo do Card: Checkbox + Dex # + Info Icon (Tooltip) + Tags */}
      <Flex justify="space-between" align="center" style={{ width: '100%' }}>
        <Checkbox
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation()
            onToggleSelect()
          }}
          onClick={(e) => e.stopPropagation()}
          aria-label={pokemon.nickname || pokemon.species}
        />
        <Flex align="center" gap={4}>
          <span style={{ color: '#8c8c8c', fontFamily: 'monospace', fontWeight: 600, fontSize: 12 }}>
            {dexNumber}
          </span>
          {hasInfo && (
            isLoadingPreview ? (
              <span style={{ color: '#8c8c8c', fontSize: 12, display: 'inline-flex' }}>
                <LoadingOutlined />
              </span>
            ) : (
              <Tooltip
                title={tooltipContent}
                trigger="click"
                open={infoOpen}
                onOpenChange={setInfoOpen}
                placement="top"
              >
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={t('transfer.details', 'Detalhes da transferência')}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontSize: 13,
                    lineHeight: 1,
                    color: refusedReason ? '#ff4d4f' : hasChanges ? '#1890ff' : '#52c41a',
                  }}
                >
                  {refusedReason ? (
                    <ExclamationCircleFilled />
                  ) : hasChanges ? (
                    <InfoCircleFilled />
                  ) : (
                    <CheckCircleFilled />
                  )}
                  {/* Texto para leitores de tela e testes automatizados */}
                  <span style={{ display: 'none' }}>{infoText}</span>
                </span>
              </Tooltip>
            )
          )}
          {pokemon.isShiny && (
            <Tag color="gold" style={{ margin: 0, padding: '0 4px', fontSize: 11, fontWeight: 600 }}>
              ✨ Shiny
            </Tag>
          )}
          {pokemon.isEgg && (
            <Tag color="orange" style={{ margin: 0, padding: '0 4px', fontSize: 11 }}>
              {t('editor.fields.egg', 'Ovo')}
            </Tag>
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
          <Typography.Text strong style={{ fontSize: 14 }}>
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
          </Tag>
        )}
      </Flex>
    </Card>
  )
}

export function TransferPicker({ transfer, onClose }: { transfer: TransferSummary; onClose: () => Promise<void> }) {
  const engine = useEngine()
  const { notification } = App.useApp()
  const { t } = useTranslation()
  const [view, setView] = useState<View>('party')
  const [partnerPokemon, setPartnerPokemon] = useState<PokemonSummary[]>([])
  const [pickedKeys, setPickedKeys] = useState<string[]>([])
  const [previewed, setPreviewed] = useState<{ of: TransferOffer; preview: TransferPreview }>()
  const [moving, setMoving] = useState(false)
  const [search, setSearch] = useState('')
  const [boxFilter, setBoxFilter] = useState<string>('all')

  useEffect(() => {
    let current = true
    void engine.transfer.partnerBoxes().then((pokemon) => current && setPartnerPokemon(pokemon))
    return () => {
      current = false
    }
  }, [engine])

  const partnerBoxes = useMemo(() => {
    return partnerPokemon.filter((p) => p.at.source === 'box')
  }, [partnerPokemon])

  const boxOptions = useMemo(() => {
    const boxSet = new Set<number>()
    for (const p of partnerBoxes) {
      if (typeof p.at.box === 'number') {
        boxSet.add(p.at.box + 1)
      }
    }
    const maxBox = Math.max(1, ...boxSet)
    const options = [{ value: 'all', label: t('box.allBoxes', 'Todas as Caixas') }]
    for (let i = 1; i <= maxBox; i++) {
      const count = partnerBoxes.filter((p) => (p.at.box ?? 0) + 1 === i).length
      options.push({
        value: String(i),
        label: `${t('box.boxLabel', 'Caixa')} ${i}${count > 0 ? ` (${count})` : ''}`,
      })
    }
    return options
  }, [partnerBoxes, t])

  const displayed = useMemo(() => {
    let list = partnerPokemon.filter((pokemon) => pokemon.at.source === view)
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((p) => {
        const matchesSpecies = p.species.toLowerCase().includes(q)
        const matchesNickname = p.nickname ? p.nickname.toLowerCase().includes(q) : false
        return matchesSpecies || matchesNickname
      })
    }
    if (view === 'box' && boxFilter !== 'all') {
      const targetBox = Number(boxFilter)
      list = list.filter((p) => (p.at.box ?? 0) + 1 === targetBox)
    }
    return list
  }, [partnerPokemon, view, search, boxFilter])

  const picked = useMemo(
    () => partnerPokemon.filter((pokemon) => pickedKeys.includes(pickKey(pokemon))),
    [partnerPokemon, pickedKeys],
  )

  const offer = useMemo<TransferOffer>(() => ({ send: [], receive: picked.map((pokemon) => pokemon.at) }), [picked])

  useEffect(() => {
    if (offer.receive.length === 0) return
    let current = true
    void engine.transfer.preview(offer).then((preview) => current && setPreviewed({ of: offer, preview }))
    return () => {
      current = false
    }
  }, [engine, offer])

  const preview = previewed?.of === offer ? previewed.preview : undefined
  const pick = transferPick(offer.receive, transfer.room, preview)

  const togglePick = (pokemon: PokemonSummary) => {
    const key = pickKey(pokemon)
    setPickedKeys((prevKeys) =>
      prevKeys.includes(key) ? prevKeys.filter((k) => k !== key) : [...prevKeys, key],
    )
  }

  const move = async () => {
    setMoving(true)
    try {
      const result = await engine.transfer.commit(offer)
      notification.success({
        title: t('transfer.movedSuccess', '{0} Pokémon movido(s) para o seu box').replace(
          '{0}',
          String(result.arrived.length),
        ),
        description: t('transfer.exportHint', 'Exporte este save na página Salvar para mantê-los.'),
        actions: (
          <Button type="link" onClick={() => downloadFile(result.partner.bytes, result.partner.fileName)}>
            {t('transfer.downloadPartner', 'Baixar {0}').replace('{0}', result.partner.fileName)}
          </Button>
        ),
      })
      await onClose()
    } catch (error) {
      if (!(error instanceof EngineError)) throw error
      notification.error({ title: error.message })
    } finally {
      setMoving(false)
    }
  }

  return (
    <Modal
      open
      width={720}
      style={{ maxWidth: '95vw', top: 20 }}
      title={
        <Flex vertical>
          {t('transfer.fromPartner', 'Transferir de {0}').replace('{0}', transfer.partner.fileName ?? '')}
          <Typography.Text type="secondary" style={{ fontWeight: 'normal', fontSize: 13 }}>
            {`${gameName(transfer.partner)} · ${transfer.trainer.name}`}
          </Typography.Text>
        </Flex>
      }
      onCancel={onClose}
      footer={
        <Flex justify="space-between" align="center" gap={8} wrap>
          <Typography.Text type="secondary">
            {`${t('transfer.selectedCount', '{0} selecionado(s)').replace('{0}', String(pick.selected))} · ${t(
              'transfer.freeSlotsCount',
              '{0} vagas livres',
            ).replace('{0}', String(pick.freeSlots))}${pick.refused
                ? ` · ${t('transfer.cannotMoveCount', '{0} não podem ser movidos').replace('{0}', String(pick.refused))}`
                : ''
              }`}
          </Typography.Text>
          <Space>
            <Button onClick={onClose}>{t('actions.cancel', 'Cancelar')}</Button>
            <Button type="primary" disabled={!pick.canMove} loading={moving} onClick={move}>
              {t('transfer.moveHere', 'Mover {0} para cá').replace('{0}', String(pick.selected))}
            </Button>
          </Space>
        </Flex>
      }
    >
      <Flex vertical gap={12}>
        <Segmented<View>
          options={[
            { label: t('transfer.viewParty', 'Equipe'), value: 'party' },
            { label: t('transfer.viewBox', 'Box'), value: 'box' },
          ]}
          value={view}
          onChange={setView}
        />
        {/* Linha de busca e seletor com largura otimizada para manter em uma única linha */}
        <Flex align="center" gap={8} wrap="nowrap" style={{ width: '100%' }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
            placeholder={t('box.searchPlaceholder', 'Buscar Pokémon...')}
            allowClear
            style={{ width: 140, flex: '1 1 140px', minWidth: 100 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {view === 'box' && (
            <Select
              value={boxFilter}
              onChange={setBoxFilter}
              options={boxOptions}
              style={{ width: 140, minWidth: 110, flexShrink: 0 }}
            />
          )}
        </Flex>

        {/* Grade de Pokémon: 2 colunas em telas menores (xs=12), 3 em médias (sm=8) e 4 em maiores (md=6) */}
        <div style={{ maxHeight: '55vh', overflowY: 'auto', padding: '4px 2px' }}>
          {displayed.length === 0 ? (
            <Empty description={t('box.noPokemon', 'Nenhum Pokémon encontrado')} />
          ) : (
            <Row gutter={[10, 10]}>
              {displayed.map((p) => {
                const key = pickKey(p)
                const isSelected = pickedKeys.includes(key)
                const refused = preview?.refused.find((refusal) => handleKey(refusal.at) === key)
                const offered = preview?.offers.find((off) => pickKey(off.from) === key)
                const refusedReason = refused ? getRefusalReason(refused.reason, t) : undefined

                return (
                  <Col xs={12} sm={8} md={6} key={key} data-row-key={key}>
                    <TransferPokemonCard
                      pokemon={p}
                      isSelected={isSelected}
                      onToggleSelect={() => togglePick(p)}
                      refusedReason={refusedReason}
                      changes={offered?.changes}
                      hasOffered={Boolean(offered)}
                      isLoadingPreview={isSelected && !preview}
                      t={t}
                    />
                  </Col>
                )
              })}
            </Row>
          )}
        </div>
      </Flex>
    </Modal>
  )
}
