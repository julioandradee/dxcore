import { useCallback, useMemo, useRef, useState, type ChangeEvent } from 'react'
import {
  AppstoreOutlined,
  CalculatorOutlined,
  CloseOutlined,
  CopyOutlined,
  DownOutlined,
  DownloadOutlined,
  FilterOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  SearchOutlined,
  SwapOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'
import {
  App,
  Badge,
  Button,
  Dropdown,
  Flex,
  Input,
  Modal,
  Popover,
  Segmented,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
  type MenuProps,
} from 'antd'
import type { PokemonSummary } from '@pkhex-everywhere/engine'
import { useBox, useEngine, useLoadedGame } from '@pkhex-everywhere/react'
import { PageHeader } from '../../components/PageHeader'
import { PokemonTable } from '../../components/PokemonTable'
import { useCopyShowdown } from '../../hooks/useCopyShowdown'
import { useExportPokemon } from '../../hooks/useExportPokemon'
import { useSupports } from '../../hooks/useSupports'
import { changePokemonListView, openCalculator, useNavigate, usePokemonListView, type PokemonListView } from '../../host'
import { useTranslation } from '../../i18n'
import { routes } from '../../routes'
import { getBoxColumns } from './boxColumns'
import { ImportedPokemonModal } from './ImportedPokemonModal'
import { MoveToBoxModal } from './MoveToBoxModal'
import { TransferModal } from './TransferModal'
import { useLoadPokemonFile } from './useLoadPokemonFile'

export default function BoxPage() {
  const { box } = useBox()
  const { game } = useLoadedGame()
  const engine = useEngine()
  const navigate = useNavigate()
  const copyShowdown = useCopyShowdown()
  const encountersSupported = useSupports('encounters')
  const showdownSupported = useSupports('showdown')
  const { notification } = App.useApp()
  const { loadFiles, importedPokemon, failedFiles, clearImported } = useLoadPokemonFile()
  const fileInput = useRef<HTMLInputElement>(null)
  const { t } = useTranslation()
  const { exportMultiple, exporting } = useExportPokemon()
  const listView = usePokemonListView()

  const [selected, setSelected] = useState<PokemonSummary[]>([])
  const [transferring, setTransferring] = useState(false)
  const [movingBox, setMovingBox] = useState(false)
  const [search, setSearch] = useState('')
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [boxFilter, setBoxFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [shinyFilter, setShinyFilter] = useState<'all' | 'shiny' | 'normal'>('all')
  const [batchBusy, setBatchBusy] = useState(false)

  const activeFiltersCount =
    (boxFilter !== 'all' ? 1 : 0) +
    (levelFilter !== 'all' ? 1 : 0) +
    (shinyFilter !== 'all' ? 1 : 0)

  const handleBatchClone = async () => {
    setBatchBusy(true)
    try {
      const editables = selected.filter((p) => p.editable)
      for (const p of editables) {
        await engine.pokemon.clone(p.at)
      }
      notification.success({
        message: t('batch.cloneSuccess', 'Pokémon clonados com sucesso!'),
        description: `${editables.length} cópias adicionadas às caixas.`,
      })
    } catch (e) {
      notification.error({
        message: t('batch.cloneError', 'Erro ao clonar Pokémon'),
        description: String(e),
      })
    } finally {
      setBatchBusy(false)
    }
  }

  const boxOptions = useMemo(() => {
    const boxSet = new Set<number>()
    for (const p of box) {
      if (typeof p.at.box === 'number') {
        boxSet.add(p.at.box + 1)
      }
    }
    const maxBox = Math.max(1, ...boxSet)
    const options = [{ value: 'all', label: t('box.allBoxes', 'Todas as Caixas') }]
    for (let i = 1; i <= maxBox; i++) {
      const count = box.filter((p) => (p.at.box ?? 0) + 1 === i).length
      options.push({
        value: String(i),
        label: `${t('box.boxLabel', 'Caixa')} ${i}${count > 0 ? ` (${count})` : ''}`,
      })
    }
    return options
  }, [box, t])

  const levelOptions = useMemo(
    () => [
      { value: 'all', label: t('box.allLevels', 'Todos os Níveis') },
      { value: '1-10', label: `${t('box.levelPrefix', 'Lvl')} 1 - 10` },
      { value: '11-20', label: `${t('box.levelPrefix', 'Lvl')} 11 - 20` },
      { value: '21-30', label: `${t('box.levelPrefix', 'Lvl')} 21 - 30` },
      { value: '31-40', label: `${t('box.levelPrefix', 'Lvl')} 31 - 40` },
      { value: '41-50', label: `${t('box.levelPrefix', 'Lvl')} 41 - 50` },
      { value: '+50', label: `${t('box.levelPrefix', 'Lvl')} +50` },
    ],
    [t],
  )

  const shinyOptions = useMemo(
    () => [
      { value: 'all', label: t('box.allClassifications', 'Todos (Shiny e Normal)') },
      { value: 'shiny', label: t('box.onlyShiny', '✨ Apenas Shiny') },
      { value: 'normal', label: t('box.onlyNormal', 'Apenas Normal') },
    ],
    [t],
  )

  const filteredBox = useMemo(() => {
    return box.filter((pokemon) => {
      // 1. Text search (species / nickname / pokedex #)
      const q = search.trim().toLowerCase()
      if (q) {
        const matchesSpecies = pokemon.species.toLowerCase().includes(q)
        const matchesNickname = pokemon.nickname ? pokemon.nickname.toLowerCase().includes(q) : false
        const cleanQ = q.replace(/^#/, '')
        const matchesDex =
          pokemon.speciesId !== null &&
          (String(pokemon.speciesId) === cleanQ ||
            String(pokemon.speciesId).padStart(4, '0').includes(cleanQ) ||
            String(pokemon.speciesId).padStart(3, '0').includes(cleanQ))
        if (!matchesSpecies && !matchesNickname && !matchesDex) return false
      }

      // 2. Box filter
      if (boxFilter !== 'all') {
        const targetBox = Number(boxFilter)
        if ((pokemon.at.box ?? 0) + 1 !== targetBox) return false
      }

      // 3. Level filter
      if (levelFilter !== 'all') {
        const lvl = pokemon.level
        if (levelFilter === '1-10' && (lvl < 1 || lvl > 10)) return false
        if (levelFilter === '11-20' && (lvl < 11 || lvl > 20)) return false
        if (levelFilter === '21-30' && (lvl < 21 || lvl > 30)) return false
        if (levelFilter === '31-40' && (lvl < 31 || lvl > 40)) return false
        if (levelFilter === '41-50' && (lvl < 41 || lvl > 50)) return false
        if (levelFilter === '+50' && lvl <= 50) return false
      }

      // 4. Shiny classification filter
      if (shinyFilter === 'shiny' && !pokemon.isShiny) return false
      if (shinyFilter === 'normal' && pokemon.isShiny) return false

      return true
    })
  }, [box, search, boxFilter, levelFilter, shinyFilter])

  const openSelectedInCalculator = useCallback(async () => {
    const showdown = selected.length
      ? (await Promise.all(selected.map((pokemon) => engine.pokemon.showdown(pokemon.at)))).join('\n\n')
      : await engine.box.showdown()
    openCalculator(showdown)
  }, [selected, engine])

  const copyBoxShowdown = useCallback(async () => {
    if (box.length === 0) {
      notification.error({ title: t('box.noPokemon', 'No Pokémon found in your box') })
      return
    }
    await copyShowdown(await engine.box.showdown(), `${box.length} entries`)
  }, [box, engine, copyShowdown, notification, t])

  const loadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      await loadFiles(files)
    }
    event.target.value = ''
  }

  const menuItems: MenuProps['items'] = useMemo(() => {
    const hasSelection = selected.length > 0
    return [
      {
        key: 'selection-group',
        type: 'group',
        label: `${t('box.selectionGroup', 'Ações de Seleção')} (${selected.length})`,
        children: [
          {
            key: 'move',
            icon: <SwapOutlined />,
            label:
              selected.length === 1
                ? t('box.moveSingle', 'Mover para outra Caixa')
                : t('box.moveMultiple', 'Mover ({0}) para outra Caixa').replace('{0}', String(selected.length)),
            disabled: !hasSelection,
            onClick: () => setMovingBox(true),
          },
          {
            key: 'export',
            icon: <DownloadOutlined />,
            label:
              selected.length === 1
                ? t('actions.exportSingle', 'Exportar (.pk)')
                : t('actions.exportZip', 'Exportar ({0}) como .zip').replace('{0}', String(selected.length || 0)),
            disabled: !hasSelection || exporting,
            onClick: () => void exportMultiple(selected, 'box_pokemon.zip'),
          },
          {
            key: 'clone',
            icon: <CopyOutlined />,
            label: t('batch.cloneSelected', 'Clonar Selecionados na Caixa'),
            disabled: !hasSelection || batchBusy,
            onClick: () => void handleBatchClone(),
          },
        ],
      },
      { type: 'divider' },
      {
        key: 'box-group',
        type: 'group',
        label: t('box.managementGroup', 'Gerenciamento da Box'),
        children: [
          ...(encountersSupported
            ? [
              {
                key: 'add',
                icon: <PlusOutlined />,
                label: t('actions.add', 'Adicionar Pokémon'),
                onClick: () => navigate(routes.searchEncounter),
              },
            ]
            : []),
          {
            key: 'load',
            icon: <FolderOpenOutlined />,
            label: t('actions.load', 'Carregar Arquivo (.pk/.zip)'),
            onClick: () => fileInput.current?.click(),
          },
          {
            key: 'transfer',
            icon: <SwapOutlined />,
            label: t('actions.transfer', 'Transferir entre Saves'),
            onClick: () => setTransferring(true),
          },
          ...(showdownSupported
            ? [
              {
                key: 'calculator',
                icon: <CalculatorOutlined />,
                label: t('actions.calculator', 'Calculadora de Dano'),
                onClick: () => void openSelectedInCalculator(),
              },
              {
                key: 'showdown',
                icon: <CopyOutlined />,
                label: t('actions.showdown', 'Copiar Showdown da Box'),
                onClick: () => void copyBoxShowdown(),
              },
            ]
            : []),
        ],
      },
    ]
  }, [
    selected,
    exporting,
    batchBusy,
    encountersSupported,
    showdownSupported,
    t,
    navigate,
    openSelectedInCalculator,
    copyBoxShowdown,
    exportMultiple,
  ])

  const totalShiniesInBox = filteredBox.filter((p) => p.isShiny).length

  return (
    <Flex vertical gap={20}>
      <PageHeader
        title={
          <Flex align="center" gap={8} wrap="wrap" style={{ minWidth: 0 }}>
            <span style={{ fontSize: 20, fontWeight: 600, whiteSpace: 'nowrap' }}>{t('box.title', 'Box')}</span>
            <Flex align="center" gap={6} wrap="wrap">
              <Tag
                style={{
                  backgroundColor: '#DC0A2D',
                  color: '#ffffff',
                  borderColor: '#DC0A2D',
                  fontWeight: 600,
                  borderRadius: 4,
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px 8px',
                  margin: 0,
                }}
              >
                {filteredBox.length} Pokémon
              </Tag>
              {totalShiniesInBox > 0 && (
                <Tag
                  color="gold"
                  style={{
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 8px',
                    margin: 0,
                  }}
                >
                  ✨ {totalShiniesInBox} Shiny
                </Tag>
              )}
            </Flex>
          </Flex>
        }
        extra={
          <Flex align="center" justify="end" gap={10} wrap="wrap" style={{ marginLeft: 'auto' }}>
            {/* Tag para busca ativa */}
            {search && (
              <Tag
                closable
                onClose={() => setSearch('')}
                style={{
                  margin: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px 8px',
                  borderRadius: 4,
                }}
              >
                "{search}"
              </Tag>
            )}

            {/* Tag para filtros ativos */}
            {activeFiltersCount > 0 && (
              <Tag
                color="blue"
                closable
                onClose={() => {
                  setBoxFilter('all')
                  setLevelFilter('all')
                  setShinyFilter('all')
                }}
                style={{ margin: 0, borderRadius: 4 }}
              >
                {activeFiltersCount} {t('box.filtersActive', 'filtros')}
              </Tag>
            )}

            {/* Botão de Busca: Ícone que abre o Overlay Centralizado */}
            <Tooltip title={t('box.searchTooltip', 'Buscar Pokémon')}>
              <Badge dot={Boolean(search)} offset={[-2, 2]}>
                <Button
                  icon={<SearchOutlined />}
                  onClick={() => setSearchModalOpen(true)}
                  type={search ? 'primary' : 'default'}
                  ghost={Boolean(search)}
                  aria-label={t('box.searchTooltip', 'Buscar Pokémon')}
                />
              </Badge>
            </Tooltip>

            {/* Botão de Filtros Agrupados: Ícone com Popover */}
            <Popover
              open={filtersOpen}
              onOpenChange={setFiltersOpen}
              trigger="click"
              placement="bottomRight"
              title={
                <Flex justify="space-between" align="center" style={{ paddingBottom: 6 }}>
                  <Space align="center" size={6}>
                    <FilterOutlined style={{ color: '#1677ff' }} />
                    <span style={{ fontWeight: 600 }}>{t('box.filtersTitle', 'Filtros de Pokémon')}</span>
                  </Space>
                  {activeFiltersCount > 0 && (
                    <Button
                      type="link"
                      size="small"
                      danger
                      onClick={() => {
                        setBoxFilter('all')
                        setLevelFilter('all')
                        setShinyFilter('all')
                      }}
                      style={{ padding: 0, height: 'auto', fontSize: 12 }}
                    >
                      {t('box.clearFilters', 'Limpar filtros')}
                    </Button>
                  )}
                </Flex>
              }
              content={
                <Flex vertical gap={12} style={{ width: 250, paddingTop: 4 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>
                      {t('box.filterBox', 'Caixa')}
                    </div>
                    <Select
                      value={boxFilter}
                      onChange={setBoxFilter}
                      options={boxOptions}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>
                      {t('box.filterLevel', 'Nível')}
                    </div>
                    <Select
                      value={levelFilter}
                      onChange={setLevelFilter}
                      options={levelOptions}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>
                      {t('box.filterClassification', 'Classificação')}
                    </div>
                    <Select
                      value={shinyFilter}
                      onChange={setShinyFilter}
                      options={shinyOptions}
                      style={{ width: '100%' }}
                    />
                  </div>
                </Flex>
              }
            >
              <Tooltip title={t('box.filterTooltip', 'Filtrar Pokémon')}>
                <Badge count={activeFiltersCount} size="small" offset={[-2, 2]}>
                  <Button
                    icon={<FilterOutlined />}
                    type={activeFiltersCount > 0 ? 'primary' : 'default'}
                    ghost={activeFiltersCount > 0}
                    aria-label={t('box.filterTooltip', 'Filtrar Pokémon')}
                  />
                </Badge>
              </Tooltip>
            </Popover>

            <Segmented<PokemonListView>
              value={listView}
              onChange={(val) => changePokemonListView(val)}
              options={[
                { value: 'gallery', icon: <AppstoreOutlined />, label: t('view.gallery', '') },
                { value: 'table', icon: <UnorderedListOutlined />, label: t('view.table', '') },
              ]}
            />
            <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
              <Button type="primary" icon={<AppstoreOutlined />}>
                <span>{t('box.actions', 'Ações')}</span>
                {selected.length > 0 && (
                  <span
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      color: '#ffffff',
                      borderRadius: 10,
                      padding: '1px 7px',
                      fontSize: 12,
                      marginLeft: 6,
                      fontWeight: 600,
                    }}
                  >
                    {selected.length}
                  </span>
                )}
                <DownOutlined style={{ fontSize: 10, marginLeft: 4 }} />
              </Button>
            </Dropdown>
            <input
              ref={fileInput}
              type="file"
              hidden
              multiple
              accept=".pk,.pk1,.pk2,.pk3,.pk4,.pk5,.pk6,.pk7,.pk8,.pk9,.pb7,.pa8,.pa9,.ck3,.xk3,.zip"
              onChange={loadFile}
            />
          </Flex>
        }
      />
      <PokemonTable
        pokemon={filteredBox}
        extraColumns={getBoxColumns(t)}
        selected={selected}
        onSelectedChange={setSelected}
        batchExport="box_pokemon.zip"
        pageSize={50}
      />
      {transferring && game && <TransferModal game={game} onClose={() => setTransferring(false)} />}
      {movingBox && (
        <MoveToBoxModal
          open={movingBox}
          selected={selected}
          onClose={() => setMovingBox(false)}
          onSuccess={() => {
            setMovingBox(false)
            setSelected([])
          }}
        />
      )}
      <ImportedPokemonModal
        open={importedPokemon.length > 0}
        imported={importedPokemon}
        failed={failedFiles}
        onClose={clearImported}
      />

      {/* Modal Overlay de Busca Centralizado em Destaque */}
      <Modal
        open={searchModalOpen}
        onCancel={() => setSearchModalOpen(false)}
        footer={null}
        closable={false}
        centered
        width={540}
        destroyOnClose={false}
        styles={{
          mask: {
            backgroundColor: 'rgba(0, 15, 34, 0.75)',
            backdropFilter: 'blur(4px)',
          },
          body: {
            padding: '8px 4px',
          },
        }}
      >
        <Flex vertical gap={16}>
          <Flex justify="space-between" align="center">
            <Typography.Text strong style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <SearchOutlined style={{ color: '#1677ff', fontSize: 18 }} />
              {t('box.searchTitle', 'Buscar Pokémon nas Caixas')}
            </Typography.Text>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setSearchModalOpen(false)}
              aria-label={t('common.close', 'Fechar')}
              style={{ color: '#8c8c8c' }}
            />
          </Flex>

          <Input
            autoFocus
            size="large"
            prefix={<SearchOutlined style={{ color: '#1677ff', fontSize: 18 }} />}
            placeholder={t('box.searchPlaceholder', 'Buscar por nome, espécie ou nº da Pokédex...')}
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={() => setSearchModalOpen(false)}
            style={{ borderRadius: 8, fontSize: 16 }}
          />

          <Flex justify="space-between" align="center" style={{ fontSize: 13, color: '#8c8c8c' }}>
            <span>
              {t('box.foundCount', '{0} Pokémon encontrados').replace('{0}', String(filteredBox.length))}
            </span>
            <Space>
              {search && (
                <Button size="small" type="link" onClick={() => setSearch('')}>
                  {t('box.clearFilters', 'Limpar')}
                </Button>
              )}
              <Button size="small" type="primary" onClick={() => setSearchModalOpen(false)}>
                {t('common.done', 'Concluir')}
              </Button>
            </Space>
          </Flex>
        </Flex>
      </Modal>
    </Flex>
  )
}


