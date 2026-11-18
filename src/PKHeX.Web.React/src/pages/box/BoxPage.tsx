import { useCallback, useMemo, useRef, useState, type ChangeEvent } from 'react'
import {
  AppstoreOutlined,
  CalculatorOutlined,
  CopyOutlined,
  DownOutlined,
  DownloadOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  SearchOutlined,
  SwapOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'
import { App, Button, Dropdown, Flex, Input, Segmented, Select, Tag, type MenuProps } from 'antd'
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
  const [boxFilter, setBoxFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [batchBusy, setBatchBusy] = useState(false)

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

      return true
    })
  }, [box, search, boxFilter, levelFilter])

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
          <Flex align="center" gap={12} wrap="wrap">
            <span>{t('box.title', 'Box')}</span>
            <Tag
              style={{
                backgroundColor: '#DC0A2D',
                color: '#ffffff',
                borderColor: '#DC0A2D',
                fontWeight: 600,
                borderRadius: 4,
              }}
            >
              {filteredBox.length} Pokémon
            </Tag>
            {totalShiniesInBox > 0 && <Tag color="gold">✨ {totalShiniesInBox} Shiny</Tag>}
          </Flex>
        }
        extra={
          <Flex align="center" gap={10} wrap="wrap">
            <Input
              prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
              placeholder={t('box.searchPlaceholder', 'Buscar Pokémon...')}
              allowClear
              style={{ width: 190 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              value={boxFilter}
              onChange={setBoxFilter}
              options={boxOptions}
              style={{ minWidth: 155 }}
            />
            <Select
              value={levelFilter}
              onChange={setLevelFilter}
              options={levelOptions}
              style={{ minWidth: 135 }}
            />
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
    </Flex>
  )
}


