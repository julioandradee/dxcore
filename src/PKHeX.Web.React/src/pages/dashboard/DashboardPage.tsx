import { useMemo, useState } from 'react'
import {
  ClockCircleOutlined,
  CloseCircleFilled,
  CloseCircleOutlined,
  CompassOutlined,
  DollarOutlined,
  EyeFilled,
  FireOutlined,
  InboxOutlined,
  PartitionOutlined,
  SearchOutlined,
  StarFilled,
  TeamOutlined,
  TrophyFilled,
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Badge,
  Button,
  Card,
  Col,
  Flex,
  Grid,
  Input,
  Pagination,
  Progress,
  Radio,
  Row,
  Select,
  Space,
  Tag,
  theme,
  Tooltip,
  Typography,
} from 'antd'
import type { PokemonHandle, PokemonId, PokemonSummary } from '@pkhex-everywhere/engine'
import { useBox, useLoadedGame, useParty, useQuery, useTrainer } from '@pkhex-everywhere/react'
import { gameName } from '../../capabilities'
import { PageHeader } from '../../components/PageHeader'
import { pokemonOfficialArtworkUrl } from '../../components/PokemonImage'
import { SpeciesImage } from '../../components/PokemonSprite'
import { TypeBadge, typeData } from '../../components/TypeBadge'
import { useNavigate } from '../../host'
import { useTranslation } from '../../i18n'
import { routes } from '../../routes'
import { CatchInfoModal } from './CatchInfoModal'

const PAGE_SIZE = 24

type StatusFilter = 'all-needed' | 'missing' | 'seenOnly'
type SortOption = 'number-asc' | 'number-desc' | 'name-asc' | 'name-desc'
type DashboardTab = 'pokedex' | 'collection' | 'trainer'

interface StorageItem {
  summary: PokemonSummary
  location: string
  box?: number | null
  slot: number
}

const hoennBadges = new Set(['stone', 'knuckle', 'dynamo', 'heat', 'balance', 'feather', 'mind', 'rain'])

function badgeImageUrl(badgeName: string): string {
  const normalized = badgeName.trim().toLowerCase()
  const ext = hoennBadges.has(normalized) ? 'svg' : 'png'
  return `https://cdn.jsdelivr.net/gh/paulthemagno/pokemon-emulator-tracker@main/public/badges/${normalized}.${ext}`
}

function GymBadgeImage({ name, earned }: { name: string; earned: boolean }) {
  const [loadError, setLoadError] = useState(false)
  const url = badgeImageUrl(name)

  if (loadError) {
    return (
      <TrophyFilled
        style={{
          fontSize: '2rem',
          color: earned ? '#f59e0b' : '#64748b',
          opacity: earned ? 1 : 0.4,
        }}
      />
    )
  }

  return (
    <div
      style={{
        width: 48,
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: earned ? 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.45))' : 'grayscale(100%) opacity(35%)',
        transition: 'all 0.25s ease',
      }}
    >
      <img
        src={url}
        alt={name}
        onError={() => setLoadError(true)}
        style={{
          maxWidth: 44,
          maxHeight: 44,
          objectFit: 'contain',
        }}
      />
    </div>
  )
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const { game } = useLoadedGame()
  const navigate = useNavigate()
  const { token } = theme.useToken()

  const { party = [] } = useParty() || {}
  const { box = [] } = useBox() || {}
  const { trainer } = useTrainer() || {}
  const progress = useQuery('game.progress')
  const badgesList = useQuery('trainer.badges')
  const boxList = useQuery('box.list') || []
  const pokedexEntries = useQuery('species.pokedex') || []

  const [activeTab, setActiveTab] = useState<DashboardTab>('pokedex')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all-needed')
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('number-asc')
  const [page, setPage] = useState(1)
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md
  const [catchModalSpecies, setCatchModalSpecies] = useState<{
    id: number
    name: string
    types: number[]
    seen: boolean
  } | null>(null)

  // Map species to storage locations
  const storageMap = useMemo(() => {
    const map = new Map<number, StorageItem[]>()
    party.forEach((p, idx) => {
      if (p.speciesId === null || p.speciesId === undefined) return
      const list = map.get(p.speciesId) ?? []
      list.push({
        summary: p,
        location: `${t('dashboard.party', 'Equipe')} #${idx + 1}`,
        slot: idx,
      })
      map.set(p.speciesId, list)
    })
    box.forEach((p) => {
      if (p.speciesId === null || p.speciesId === undefined) return
      const list = map.get(p.speciesId) ?? []
      const boxIdx = p.at.box ?? 0
      const boxName = boxList[boxIdx]?.name ?? `Caixa ${boxIdx + 1}`
      const slotIdx = (p.at.slot ?? 0) + 1
      list.push({
        summary: p,
        location: `${boxName} (Slot ${slotIdx})`,
        box: p.at.box,
        slot: p.at.slot,
      })
      map.set(p.speciesId, list)
    })
    return map
  }, [party, box, boxList, t])

  // Aggregate metrics
  const totalSpecies = pokedexEntries.length
  const caughtSpeciesCount = pokedexEntries.filter((s) => s.caught).length
  const seenSpeciesCount = pokedexEntries.filter((s) => s.seen).length
  const missingSpeciesCount = pokedexEntries.filter((s) => !s.seen && !s.caught && !storageMap.has(s.id)).length
  const seenOnlySpeciesCount = pokedexEntries.filter((s) => s.seen && !s.caught && !storageMap.has(s.id)).length
  const neededSpeciesCount = missingSpeciesCount + seenOnlySpeciesCount

  const pokedexPercent = totalSpecies > 0 ? Math.round((caughtSpeciesCount / totalSpecies) * 100) : 0

  const totalCapacity = useMemo(() => {
    const boxSlots = boxList.reduce((acc, b) => acc + b.slots, 0)
    return boxSlots + 6 // + party
  }, [boxList])

  const totalInCollection = party.length + box.length
  const occupancyPercent = totalCapacity > 0 ? Math.round((totalInCollection / totalCapacity) * 100) : 0

  const shinies = useMemo(() => {
    return [...party, ...box].filter((p) => p.isShiny)
  }, [party, box])

  const maxLevelList = useMemo(() => {
    return [...party, ...box].filter((p) => p.level === 100)
  }, [party, box])

  // Filtered and sorted Pokédex entries - ONLY NEEDED POKÉMON (Missing or Seen Only)
  const filteredSpecies = useMemo(() => {
    const q = search.trim().toLowerCase()
    return pokedexEntries
      .filter((s) => {
        const inStorage = storageMap.has(s.id)
        // Must NOT be already caught or in storage
        if (s.caught || inStorage) return false

        if (statusFilter === 'missing') {
          if (s.seen) return false
        } else if (statusFilter === 'seenOnly') {
          if (!s.seen) return false
        }

        if (selectedType !== null) {
          if (!s.types.includes(selectedType)) return false
        }

        if (q) {
          const matchesName = s.name.toLowerCase().includes(q)
          const matchesNumber = s.id.toString().includes(q) || `#${s.id.toString().padStart(3, '0')}`.includes(q)
          if (!matchesName && !matchesNumber) return false
        }

        return true
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'number-desc':
            return b.id - a.id
          case 'name-asc':
            return a.name.localeCompare(b.name)
          case 'name-desc':
            return b.name.localeCompare(a.name)
          case 'number-asc':
          default:
            return a.id - b.id
        }
      })
  }, [pokedexEntries, storageMap, statusFilter, selectedType, search, sortBy])

  const paginatedSpecies = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredSpecies.slice(start, start + PAGE_SIZE)
  }, [filteredSpecies, page])

  // Type Distribution in storage
  const typeDistribution = useMemo(() => {
    const counts: Record<number, number> = {}
    for (const p of [...party, ...box]) {
      for (const tid of p.types) {
        counts[tid] = (counts[tid] || 0) + 1
      }
    }
    return Object.entries(counts)
      .map(([typeId, count]) => ({
        typeId: Number(typeId),
        count,
        percent: totalInCollection > 0 ? Math.round((count / totalInCollection) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
  }, [party, box, totalInCollection])

  const badgesEarnedCount = progress?.badges?.earned ?? badgesList?.filter((b) => b.earned).length ?? 0
  const badgesTotalCount = progress?.badges?.total ?? badgesList?.length ?? 8

  return (
    <Flex vertical gap={20} style={{ width: '100%', maxWidth: 1400, margin: '0 auto', paddingBottom: 32 }}>
      {/* Page Header (No Extra Buttons) */}
      <PageHeader
        title={
          <Flex align="center" gap={10} wrap="wrap">
            <span style={{ fontWeight: 800, letterSpacing: -0.5 }}>{t('dashboard.title', 'Dashboard do Jogo')}</span>
            {game && (
              <Tag color="cyan" style={{ fontSize: '0.85em', fontWeight: 600, padding: '2px 10px', borderRadius: 12 }}>
                {gameName(game)}
              </Tag>
            )}
          </Flex>
        }
      />

      {/* Hero KPI Stats Grid */}
      <Row gutter={[14, 14]}>
        {/* KPI 1: Pokédex Completion */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            size="small"
            style={{
              height: '100%',
              borderRadius: 12,
              border: `1px solid ${token.colorBorderSecondary}`,
              background: token.colorBgContainer,
            }}
          >
            <Flex vertical gap={8}>
              <Flex justify="space-between" align="center">
                <Typography.Text type="secondary" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {t('dashboard.pokedexCompletion', 'Progresso da Pokédex')}
                </Typography.Text>
                <CompassOutlined style={{ fontSize: '1.25rem', color: '#38bdf8' }} />
              </Flex>
              <Flex align="baseline" gap={8}>
                <Typography.Title level={2} style={{ margin: 0, fontWeight: 800, color: '#38bdf8' }}>
                  {pokedexPercent}%
                </Typography.Title>
                <Typography.Text type="secondary" style={{ fontSize: '0.85rem' }}>
                  ({caughtSpeciesCount} / {totalSpecies})
                </Typography.Text>
              </Flex>
              <Progress
                percent={pokedexPercent}
                showInfo={false}
                strokeColor={{ '0%': '#38bdf8', '100%': '#10b981' }}
                size="small"
              />
              <Flex wrap="wrap" gap={6} style={{ marginTop: 2 }}>
                <Tag color="green" style={{ fontSize: '0.72rem', margin: 0 }}>
                  {t('dashboard.caught', 'Registrados')}: {caughtSpeciesCount}
                </Tag>
                <Tag color="orange" style={{ fontSize: '0.72rem', margin: 0 }}>
                  {t('dashboard.seen', 'Vistos')}: {seenSpeciesCount}
                </Tag>
                <Tag color="default" style={{ fontSize: '0.72rem', margin: 0 }}>
                  {t('dashboard.missing', 'Em Falta')}: {missingSpeciesCount}
                </Tag>
              </Flex>
            </Flex>
          </Card>
        </Col>

        {/* KPI 2: Storage Occupancy */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            size="small"
            style={{
              height: '100%',
              borderRadius: 12,
              border: `1px solid ${token.colorBorderSecondary}`,
              background: token.colorBgContainer,
            }}
          >
            <Flex vertical gap={8}>
              <Flex justify="space-between" align="center">
                <Typography.Text type="secondary" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {t('dashboard.storageCapacity', 'Capacidade das Caixas')}
                </Typography.Text>
                <InboxOutlined style={{ fontSize: '1.25rem', color: '#10b981' }} />
              </Flex>
              <Flex align="baseline" gap={8}>
                <Typography.Title level={2} style={{ margin: 0, fontWeight: 800, color: '#10b981' }}>
                  {occupancyPercent}%
                </Typography.Title>
                <Typography.Text type="secondary" style={{ fontSize: '0.85rem' }}>
                  ({totalInCollection} / {totalCapacity})
                </Typography.Text>
              </Flex>
              <Progress
                percent={occupancyPercent}
                showInfo={false}
                strokeColor={{ '0%': '#10b981', '100%': '#f59e0b' }}
                size="small"
              />
              <Flex wrap="wrap" gap={6} style={{ marginTop: 2 }}>
                <Tag color="gold" style={{ fontSize: '0.72rem', margin: 0 }}>
                  ✨ Shinies: {shinies.length}
                </Tag>
                <Tag color="blue" style={{ fontSize: '0.72rem', margin: 0 }}>
                  🏆 Nv. 100: {maxLevelList.length}
                </Tag>
                <Tag color="purple" style={{ fontSize: '0.72rem', margin: 0 }}>
                  👥 Equipe: {party.length}/6
                </Tag>
              </Flex>
            </Flex>
          </Card>
        </Col>

        {/* KPI 3: Gym Badges */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            size="small"
            style={{
              height: '100%',
              borderRadius: 12,
              border: `1px solid ${token.colorBorderSecondary}`,
              background: token.colorBgContainer,
            }}
          >
            <Flex vertical gap={8}>
              <Flex justify="space-between" align="center">
                <Typography.Text type="secondary" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {t('dashboard.badges', 'Insígnias')}
                </Typography.Text>
                <TrophyOutlined style={{ fontSize: '1.25rem', color: '#f59e0b' }} />
              </Flex>
              <Flex align="baseline" gap={8}>
                <Typography.Title level={2} style={{ margin: 0, fontWeight: 800, color: '#f59e0b' }}>
                  {badgesEarnedCount} / {badgesTotalCount}
                </Typography.Title>
              </Flex>
              <Progress
                percent={badgesTotalCount > 0 ? Math.round((badgesEarnedCount / badgesTotalCount) * 100) : 0}
                showInfo={false}
                strokeColor="#f59e0b"
                size="small"
              />
              <Typography.Text style={{ fontSize: '0.78rem', color: '#8c8c8c' }}>
                {badgesEarnedCount === badgesTotalCount
                  ? t('dashboard.allBadgesEarned', 'Campeão da Liga Pokémon!')
                  : `${badgesTotalCount - badgesEarnedCount} insígnias restantes`}
              </Typography.Text>
            </Flex>
          </Card>
        </Col>

        {/* KPI 4: Trainer Overview */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            size="small"
            style={{
              height: '100%',
              borderRadius: 12,
              border: `1px solid ${token.colorBorderSecondary}`,
              background: token.colorBgContainer,
            }}
          >
            <Flex vertical gap={8}>
              <Flex justify="space-between" align="center">
                <Typography.Text type="secondary" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {t('dashboard.tabTrainer', 'Ficha & Insígnias')}
                </Typography.Text>
                <UserOutlined style={{ fontSize: '1.25rem', color: '#818cf8' }} />
              </Flex>
              <Flex align="baseline" gap={8}>
                <Typography.Title
                  level={3}
                  style={{
                    margin: 0,
                    fontWeight: 800,
                    color: token.colorText,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {trainer?.name || 'Treinador'}
                </Typography.Title>
                <Tag color="geekblue" style={{ fontSize: '0.72rem', margin: 0 }}>
                  ID: {trainer?.id}
                </Tag>
              </Flex>
              <Flex wrap="wrap" gap={8} style={{ fontSize: '0.8rem', color: '#8c8c8c', marginTop: 4 }}>
                {progress?.playTime && (
                  <Flex align="center" gap={4}>
                    <ClockCircleOutlined />
                    <span>
                      {progress.playTime.hours}h {progress.playTime.minutes}m
                    </span>
                  </Flex>
                )}
                {trainer?.money !== null && trainer?.money !== undefined && (
                  <Flex align="center" gap={4}>
                    <DollarOutlined />
                    <span>$ {trainer.money.toLocaleString()}</span>
                  </Flex>
                )}
              </Flex>
            </Flex>
          </Card>
        </Col>
      </Row>

      {/* Main Tabs Segmented Navigation */}
      <Flex justify="center" style={{ width: '100%', marginTop: 8 }}>
        <Radio.Group
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value as DashboardTab)}
          buttonStyle="solid"
          size="middle"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Radio.Button value="pokedex" style={{ borderRadius: 8, fontWeight: 600, padding: '0 16px' }}>
            <CompassOutlined style={{ marginRight: 6 }} />
            {t('dashboard.tabPokedex', 'Rastreador Pokédex')}
          </Radio.Button>
          <Radio.Button value="collection" style={{ borderRadius: 8, fontWeight: 600, padding: '0 16px' }}>
            <PartitionOutlined style={{ marginRight: 6 }} />
            {t('dashboard.tabCollection', 'Estatísticas da Coleção')}
          </Radio.Button>
          <Radio.Button value="trainer" style={{ borderRadius: 8, fontWeight: 600, padding: '0 16px' }}>
            <TrophyOutlined style={{ marginRight: 6 }} />
            {t('dashboard.tabTrainer', 'Ficha & Insígnias')}
          </Radio.Button>
        </Radio.Group>
      </Flex>

      {/* TAB 1: POKÉDEX TRACKER - ONLY NEEDED POKÉMON */}
      {activeTab === 'pokedex' && (
        <div
          style={{
            width: '100%',
            backgroundColor: token.colorBgContainer,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: 16,
            padding: isMobile ? '16px 12px' : '20px 20px',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
          }}
        >
          <Flex vertical gap={16} style={{ width: '100%' }}>
            {/* Quick Filter Chips for Needed Pokémon - Centered on mobile */}
            <Flex wrap="wrap" gap={8} justify="center" align="center" style={{ width: '100%' }}>
              <Button
                type={statusFilter === 'all-needed' ? 'primary' : 'default'}
                size="middle"
                onClick={() => {
                  setStatusFilter('all-needed')
                  setPage(1)
                }}
                style={{ borderRadius: 20, fontWeight: 600 }}
              >
                🎯 {t('dashboard.filterAllNeeded', 'Faltantes')} ({neededSpeciesCount})
              </Button>
              <Button
                type={statusFilter === 'missing' ? 'primary' : 'default'}
                danger={statusFilter === 'missing'}
                size="middle"
                onClick={() => {
                  setStatusFilter('missing')
                  setPage(1)
                }}
                style={{ borderRadius: 20, fontWeight: 600 }}
              >
                ❌ {t('dashboard.filterMissing', 'Não capturados')} ({missingSpeciesCount})
              </Button>
              <Button
                type={statusFilter === 'seenOnly' ? 'primary' : 'default'}
                size="middle"
                onClick={() => {
                  setStatusFilter('seenOnly')
                  setPage(1)
                }}
                style={{
                  borderRadius: 20,
                  fontWeight: 600,
                  borderColor: statusFilter === 'seenOnly' ? undefined : '#f59e0b',
                  color: statusFilter === 'seenOnly' ? undefined : '#f59e0b',
                }}
              >
                👁️ {t('dashboard.filterSeenOnly', 'Apenas Vistos')} ({seenOnlySpeciesCount})
              </Button>
            </Flex>

          {/* Search & Select Controls */}
          <Card
            size="small"
            style={{
              borderRadius: 12,
              border: `1px solid ${token.colorBorderSecondary}`,
              background: token.colorBgContainer,
            }}
          >
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} md={10} lg={12}>
                <Input
                  prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
                  placeholder={t('dashboard.searchPlaceholder', 'Filtrar por nome ou número (#001)...')}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  allowClear
                  style={{ width: '100%', height: 38 }}
                />
              </Col>
              <Col xs={12} md={7} lg={6}>
                <Select
                  value={selectedType ?? -1}
                  onChange={(val) => {
                    setSelectedType(val === -1 ? null : val)
                    setPage(1)
                  }}
                  placeholder={t('dashboard.filterType', 'Tipo Elementar')}
                  style={{ width: '100%', height: 38 }}
                  options={[
                    { label: t('dashboard.allTypes', 'Todos os Tipos'), value: -1 },
                    ...Object.entries(typeData).map(([id, d]) => ({
                      label: (
                        <Flex align="center" gap={6}>
                          <span
                            style={{
                              display: 'inline-block',
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: d.color,
                            }}
                          />
                          <span>{t(`types.${d.name.toLowerCase()}`, d.name)}</span>
                        </Flex>
                      ),
                      value: Number(id),
                    })),
                  ]}
                />
              </Col>
              <Col xs={12} md={7} lg={6}>
                <Select
                  value={sortBy}
                  onChange={(val) => setSortBy(val)}
                  style={{ width: '100%', height: 38 }}
                  options={[
                    { label: t('dashboard.sortNumberAsc', 'Número (Crescente)'), value: 'number-asc' },
                    { label: t('dashboard.sortNumberDesc', 'Número (Decrescente)'), value: 'number-desc' },
                    { label: t('dashboard.sortNameAsc', 'Nome (A - Z)'), value: 'name-asc' },
                    { label: t('dashboard.sortNameDesc', 'Nome (Z - A)'), value: 'name-desc' },
                  ]}
                />
              </Col>
            </Row>
          </Card>

          {/* Species Results Counter */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
            <Typography.Text type="secondary" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              {filteredSpecies.length} Pokémon para completar a Pokédex
            </Typography.Text>
            {filteredSpecies.length > PAGE_SIZE && (
              <Pagination
                current={page}
                pageSize={PAGE_SIZE}
                total={filteredSpecies.length}
                onChange={(p) => setPage(p)}
                size="small"
                showSizeChanger={false}
              />
            )}
          </Flex>

          {/* Species Card Grid (Zero Tables, strictly capped 80px images!) */}
          {filteredSpecies.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '40px 20px', borderRadius: 12 }}>
              <Typography.Title level={4} style={{ color: '#10b981', margin: '0 0 8px 0' }}>
                🎉 Pokédex Completa!
              </Typography.Title>
              <Typography.Text type="secondary" style={{ fontSize: '0.95rem' }}>
                {neededSpeciesCount === 0
                  ? t('dashboard.pokedexCompleted', 'Parabéns! Todos os Pokémon disponíveis nesta versão do jogo já foram capturados ou registrados!')
                  : t('dashboard.noPokemonFound', 'Nenhum Pokémon encontrado com os filtros selecionados.')}
              </Typography.Text>
            </Card>
          ) : (
            <Row gutter={[16, 16]}>
              {paginatedSpecies.map((species) => {
                const dexNumber = `#${String(species.id).padStart(4, '0')}`
                const artUrl = pokemonOfficialArtworkUrl(species.id, false)
                const statusIcon = species.seen ? (
                  <Tooltip title={t('dashboard.statusSeen', 'Apenas Visto')} trigger={['hover', 'click']}>
                    <span
                      onClick={(e) => e.stopPropagation()}
                      style={{ display: 'inline-flex', alignItems: 'center', cursor: 'help' }}
                      role="img"
                      aria-label={t('dashboard.statusSeen', 'Apenas Visto')}
                    >
                      <EyeFilled style={{ color: '#f59e0b', fontSize: 14 }} />
                    </span>
                  </Tooltip>
                ) : (
                  <Tooltip title={t('dashboard.statusMissing', 'Não capturado')} trigger={['hover', 'click']}>
                    <span
                      onClick={(e) => e.stopPropagation()}
                      style={{ display: 'inline-flex', alignItems: 'center', cursor: 'help' }}
                      role="img"
                      aria-label={t('dashboard.statusMissing', 'Não capturado')}
                    >
                      <CloseCircleOutlined style={{ color: '#8c8c8c', fontSize: 14 }} />
                    </span>
                  </Tooltip>
                )

                return (
                  <Col key={species.id} xs={24} sm={12} md={8} lg={6} xl={4}>
                    <Card
                      size="small"
                      hoverable
                      onClick={() => setCatchModalSpecies(species)}
                      style={{
                        height: '100%',
                        borderRadius: 10,
                        position: 'relative',
                        cursor: 'pointer',
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
                      {/* Topo do Card: Ícone de Status + Número da Pokédex (ordem padrão das outras páginas) */}
                      <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                        <Flex align="center" gap={6}>
                          {statusIcon}
                          <span style={{ color: '#8c8c8c', fontFamily: 'monospace', fontWeight: 600, fontSize: 12 }}>
                            {dexNumber}
                          </span>
                        </Flex>
                        <span />
                      </Flex>

                      {/* Imagem do Pokémon (80x80px padrão das caixas) */}
                      <div
                        style={{
                          width: '100%',
                          height: 80,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 2,
                          position: 'relative',
                        }}
                      >
                        <img
                          src={artUrl ?? undefined}
                          alt={species.name}
                          style={{
                            width: 80,
                            height: 80,
                            maxHeight: 80,
                            maxWidth: 80,
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.12))',
                            transition: 'transform 0.15s ease',
                          }}
                        />
                      </div>

                      {/* Nome da Espécie */}
                      <Flex vertical align="center" gap={2} style={{ width: '100%', textAlign: 'center' }}>
                        <Flex align="center" justify="center" gap={6} wrap="wrap">
                          <Typography.Text strong style={{ fontSize: 14 }}>
                            {species.name}
                          </Typography.Text>
                        </Flex>
                      </Flex>

                      {/* Badges de Tipos */}
                      <Space size={4} wrap style={{ justifyContent: 'center' }}>
                        {species.types.map((tid) => (
                          <TypeBadge key={tid} typeId={tid} size="small" />
                        ))}
                      </Space>
                    </Card>
                  </Col>
                )
              })}
            </Row>
          )}

          {/* Bottom Pagination */}
          {filteredSpecies.length > PAGE_SIZE && (
            <Flex justify="center" style={{ marginTop: 16 }}>
              <Pagination
                current={page}
                pageSize={PAGE_SIZE}
                total={filteredSpecies.length}
                onChange={(p) => setPage(p)}
                showSizeChanger={false}
              />
            </Flex>
          )}
        </Flex>
      </div>
      )}

      {/* TAB 2: COLLECTION ANALYTICS */}
      {activeTab === 'collection' && (
        <div
          style={{
            width: '100%',
            backgroundColor: token.colorBgContainer,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: 16,
            padding: isMobile ? '16px 12px' : '20px 20px',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
          }}
        >
          <Flex vertical gap={20} style={{ width: '100%' }}>
          {/* Type Distribution Breakdown */}
          <Card
            title={
              <Flex align="center" gap={8}>
                <FireOutlined style={{ color: '#f59e0b' }} />
                <span>{t('dashboard.typeBreakdown', 'Distribuição por Tipos Elementares na Coleção')}</span>
              </Flex>
            }
            size="small"
            style={{ borderRadius: 12 }}
          >
            <Row gutter={[16, 12]}>
              {typeDistribution.map(({ typeId, count, percent }) => {
                const info = typeData[typeId]
                if (!info) return null
                return (
                  <Col key={typeId} xs={24} sm={12} md={8} lg={6}>
                    <Card
                      size="small"
                      style={{
                        borderRadius: 8,
                        background: token.colorBgContainer,
                        border: `1px solid ${token.colorBorderSecondary}`,
                      }}
                    >
                      <Flex vertical gap={6}>
                        <Flex justify="space-between" align="center">
                          <TypeBadge typeId={typeId} size="middle" />
                          <Typography.Text strong style={{ fontSize: '0.85rem' }}>
                            {count} ({percent}%)
                          </Typography.Text>
                        </Flex>
                        <Progress
                          percent={percent}
                          showInfo={false}
                          strokeColor={info.color}
                          size="small"
                        />
                      </Flex>
                    </Card>
                  </Col>
                )
              })}
            </Row>
          </Card>

          {/* Current Party Showcase */}
          <Card
            title={
              <Flex align="center" gap={8}>
                <TeamOutlined style={{ color: '#38bdf8' }} />
                <span>
                  {t('dashboard.partyShowcase', 'Equipe Atual')} ({party.length} / 6)
                </span>
              </Flex>
            }
            size="small"
            style={{ borderRadius: 12 }}
          >
            <Row gutter={[12, 12]}>
              {party.map((p, idx) => (
                <Col key={idx} xs={24} sm={12} md={8} lg={4}>
                  <Card
                    size="small"
                    hoverable
                    onClick={() => navigate(routes.pokemon(p))}
                    style={{
                      borderRadius: 10,
                      textAlign: 'center',
                      background: token.colorBgContainer,
                      border: `1px solid ${token.colorBorderSecondary}`,
                    }}
                  >
                    <Flex vertical align="center" gap={4}>
                      <Badge count={p.isShiny ? '✨' : 0} color="gold">
                        <div
                          className="dashboard-pokemon-thumb"
                          style={{
                            width: 64,
                            height: 64,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                          }}
                        >
                          <SpeciesImage
                            name={p.species}
                            src={pokemonOfficialArtworkUrl(p.speciesId, p.isShiny)}
                            placeholderSize={44}
                          />
                        </div>
                      </Badge>
                      <Typography.Text strong style={{ fontSize: '0.85rem', marginTop: 4 }}>
                        {p.nickname || p.species}
                      </Typography.Text>
                      <Tag color="blue" style={{ fontSize: '0.72rem', margin: 0 }}>
                        Nv. {p.level}
                      </Tag>
                      <Flex wrap="wrap" justify="center" gap={2}>
                        {p.types.map((t) => (
                          <TypeBadge key={t} typeId={t} size="small" />
                        ))}
                      </Flex>
                    </Flex>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>

          {/* Shiny Showcase */}
          <Card
            title={
              <Flex align="center" gap={8}>
                <StarFilled style={{ color: '#faad14' }} />
                <span>
                  {t('dashboard.shinyGallery', 'Galeria de Shinies')} ({shinies.length})
                </span>
              </Flex>
            }
            size="small"
            style={{ borderRadius: 12 }}
          >
            {shinies.length === 0 ? (
              <Typography.Text type="secondary">
                {t('dashboard.noShinies', 'Nenhum Pokémon Shiny encontrado nas caixas ou equipe.')}
              </Typography.Text>
            ) : (
              <Row gutter={[12, 12]}>
                {shinies.map((p, idx) => (
                  <Col key={idx} xs={24} sm={12} md={8} lg={4}>
                    <Card
                      size="small"
                      hoverable
                      onClick={() => navigate(routes.pokemon(p))}
                      style={{
                        borderRadius: 10,
                        textAlign: 'center',
                        borderColor: '#faad1480',
                        background: token.colorBgElevated,
                      }}
                    >
                      <Flex vertical align="center" gap={4}>
                        <div
                          className="dashboard-pokemon-thumb"
                          style={{
                            width: 64,
                            height: 64,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                          }}
                        >
                          <SpeciesImage
                            name={p.species}
                            src={pokemonOfficialArtworkUrl(p.speciesId, true)}
                            placeholderSize={44}
                          />
                        </div>
                        <Typography.Text strong style={{ fontSize: '0.85rem' }}>
                          ✨ {p.nickname || p.species}
                        </Typography.Text>
                        <Tag color="gold" style={{ fontSize: '0.72rem', margin: 0 }}>
                          Nv. {p.level}
                        </Tag>
                        <Flex wrap="wrap" justify="center" gap={2}>
                          {p.types.map((t) => (
                            <TypeBadge key={t} typeId={t} size="small" />
                          ))}
                        </Flex>
                      </Flex>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Card>

          {/* Level 100 Max Level Showcase */}
          <Card
            title={
              <Flex align="center" gap={8}>
                <TrophyFilled style={{ color: '#10b981' }} />
                <span>
                  {t('dashboard.maxLevelShowcase', 'Destaques Nível 100')} ({maxLevelList.length})
                </span>
              </Flex>
            }
            size="small"
            style={{ borderRadius: 12 }}
          >
            {maxLevelList.length === 0 ? (
              <Typography.Text type="secondary">
                {t('dashboard.noMaxLevel', 'Nenhum Pokémon no nível 100 encontrado.')}
              </Typography.Text>
            ) : (
              <Row gutter={[12, 12]}>
                {maxLevelList.map((p, idx) => (
                  <Col key={idx} xs={24} sm={12} md={8} lg={4}>
                    <Card
                      size="small"
                      hoverable
                      onClick={() => navigate(routes.pokemon(p))}
                      style={{
                        borderRadius: 10,
                        textAlign: 'center',
                        borderColor: '#10b98180',
                        background: token.colorBgElevated,
                      }}
                    >
                      <Flex vertical align="center" gap={4}>
                        <div
                          className="dashboard-pokemon-thumb"
                          style={{
                            width: 64,
                            height: 64,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                          }}
                        >
                          <SpeciesImage
                            name={p.species}
                            src={pokemonOfficialArtworkUrl(p.speciesId, p.isShiny)}
                            placeholderSize={44}
                          />
                        </div>
                        <Typography.Text strong style={{ fontSize: '0.85rem' }}>
                          {p.isShiny ? '✨ ' : ''}
                          {p.nickname || p.species}
                        </Typography.Text>
                        <Tag color="green" style={{ fontSize: '0.72rem', margin: 0 }}>
                          MAX LVL 100
                        </Tag>
                      </Flex>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Card>
        </Flex>
      </div>
      )}

      {/* TAB 3: TRAINER & BADGES */}
      {activeTab === 'trainer' && (
        <div
          style={{
            width: '100%',
            backgroundColor: token.colorBgContainer,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: 16,
            padding: isMobile ? '16px 12px' : '20px 20px',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
          }}
        >
          <Flex vertical gap={20} style={{ width: '100%' }}>
          {/* Gym Badges Visual Board with Real Illustrated Badges */}
          <Card
            title={
              <Flex align="center" gap={8}>
                <TrophyOutlined style={{ color: '#f59e0b' }} />
                <span>
                  {t('dashboard.badges', 'Insígnias de Ginásio')} ({badgesEarnedCount} / {badgesTotalCount})
                </span>
              </Flex>
            }
            size="small"
            style={{ borderRadius: 12 }}
          >
            {badgesList && badgesList.length > 0 ? (
              <Row gutter={[12, 12]}>
                {badgesList.map((badge, idx) => (
                  <Col key={idx} xs={12} sm={8} md={6} lg={3}>
                    <Card
                      size="small"
                      style={{
                        borderRadius: 10,
                        textAlign: 'center',
                        border: `1px solid ${badge.earned ? '#f59e0b80' : token.colorBorderSecondary}`,
                        background: badge.earned ? token.colorBgElevated : token.colorBgLayout,
                        transition: 'all 0.25s ease',
                      }}
                    >
                      <Flex vertical align="center" gap={6}>
                        <GymBadgeImage name={badge.name} earned={badge.earned} />
                        <Typography.Text strong style={{ fontSize: '0.82rem' }}>
                          {badge.name}
                        </Typography.Text>
                        <Tag
                          color={badge.earned ? 'gold' : 'default'}
                          style={{ margin: 0, fontSize: '0.68rem', fontWeight: 600 }}
                        >
                          {badge.earned
                            ? t('dashboard.badgesEarned', 'Conquistada')
                            : t('dashboard.badgesPending', 'Pendente')}
                        </Tag>
                      </Flex>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Flex vertical gap={8} align="center" style={{ padding: '20px 0' }}>
                <TrophyFilled style={{ fontSize: '2.5rem', color: '#f59e0b' }} />
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {badgesEarnedCount} / {badgesTotalCount} {t('dashboard.badges', 'Insígnias')}
                </Typography.Title>
                <Progress
                  percent={badgesTotalCount > 0 ? Math.round((badgesEarnedCount / badgesTotalCount) * 100) : 0}
                  strokeColor="#f59e0b"
                  style={{ maxWidth: 300 }}
                />
              </Flex>
            )}
          </Card>

          {/* Trainer Identity Card (Modern Card, Zero Tables) */}
          <Card
            title={
              <Flex align="center" gap={8}>
                <UserOutlined style={{ color: '#818cf8' }} />
                <span>{t('dashboard.tabTrainer', 'Ficha & Insígnias')}</span>
              </Flex>
            }
            size="small"
            style={{ borderRadius: 12 }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Flex vertical gap={4}>
                  <Typography.Text type="secondary" style={{ fontSize: '0.8rem' }}>
                    Nome do Treinador (OT)
                  </Typography.Text>
                  <Typography.Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                    {trainer?.name || '—'}
                  </Typography.Title>
                </Flex>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Flex vertical gap={4}>
                  <Typography.Text type="secondary" style={{ fontSize: '0.8rem' }}>
                    TID / SID
                  </Typography.Text>
                  <Typography.Title level={4} style={{ margin: 0, fontFamily: 'monospace', fontWeight: 700 }}>
                    {trainer?.id || '—'}
                  </Typography.Title>
                </Flex>
              </Col>
              {trainer?.gender !== null && trainer?.gender !== undefined && (
                <Col xs={24} sm={12} md={8}>
                  <Flex vertical gap={4}>
                    <Typography.Text type="secondary" style={{ fontSize: '0.8rem' }}>
                      Gênero
                    </Typography.Text>
                    <Typography.Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                      {trainer.gender === 'female' ? '♀ Feminino' : '♂ Masculino'}
                    </Typography.Title>
                  </Flex>
                </Col>
              )}
              {progress?.playTime && (
                <Col xs={24} sm={12} md={8}>
                  <Flex vertical gap={4}>
                    <Typography.Text type="secondary" style={{ fontSize: '0.8rem' }}>
                      {t('dashboard.playTime', 'Tempo de Jogo')}
                    </Typography.Text>
                    <Typography.Title level={4} style={{ margin: 0, fontWeight: 700, color: '#38bdf8' }}>
                      {progress.playTime.hours}h {progress.playTime.minutes}m {progress.playTime.seconds}s
                    </Typography.Title>
                  </Flex>
                </Col>
              )}
              {trainer?.money !== null && trainer?.money !== undefined && (
                <Col xs={24} sm={12} md={8}>
                  <Flex vertical gap={4}>
                    <Typography.Text type="secondary" style={{ fontSize: '0.8rem' }}>
                      {t('dashboard.money', 'Dinheiro')}
                    </Typography.Text>
                    <Typography.Title level={4} style={{ margin: 0, fontWeight: 700, color: '#10b981' }}>
                      $ {trainer.money.toLocaleString()}
                    </Typography.Title>
                  </Flex>
                </Col>
              )}
              {trainer?.battlePoints !== null && trainer?.battlePoints !== undefined && (
                <Col xs={24} sm={12} md={8}>
                  <Flex vertical gap={4}>
                    <Typography.Text type="secondary" style={{ fontSize: '0.8rem' }}>
                      {t('dashboard.battlePoints', 'Pontos de Batalha (BP)')}
                    </Typography.Text>
                    <Typography.Title level={4} style={{ margin: 0, fontWeight: 700, color: '#f59e0b' }}>
                      {trainer.battlePoints} BP
                    </Typography.Title>
                  </Flex>
                </Col>
              )}
              {trainer?.rival && (
                <Col xs={24} sm={12} md={8}>
                  <Flex vertical gap={4}>
                    <Typography.Text type="secondary" style={{ fontSize: '0.8rem' }}>
                      Rival
                    </Typography.Text>
                    <Typography.Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                      {trainer.rival}
                    </Typography.Title>
                  </Flex>
                </Col>
              )}
            </Row>
          </Card>
        </Flex>
      </div>
      )}

      {/* Modal: Como Capturar / Obter */}
      <CatchInfoModal
        open={catchModalSpecies !== null}
        onClose={() => setCatchModalSpecies(null)}
        species={catchModalSpecies}
        onSelectSpecies={(newId) => {
          const found = pokedexEntries.find((s) => s.id === newId)
          if (found) {
            setCatchModalSpecies(found)
          }
        }}
      />
    </Flex>
  )
}
