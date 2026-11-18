import { useMemo } from 'react'
import { Button, Flex, Space, Table, Tag, type TableColumnsType, type TablePaginationConfig } from 'antd'
import type { PokemonSummary } from '@pkhex-everywhere/engine'
import { usePokemonListView, type PokemonListView } from '../host'
import { useTranslation } from '../i18n'
import { PokemonActions } from './PokemonActions'
import { PokemonGrid } from './PokemonGrid'
import { PokemonSprite } from './PokemonSprite'
import { TypeBadge } from './TypeBadge'
import { NumberFilter } from './filters/NumberFilter'
import { containsText } from './filters/containsText'
import { TextFilter } from './filters/TextFilter'

const rowKey = (pokemon: PokemonSummary) => JSON.stringify(pokemon.at)

export interface PokemonTableProps {
  pokemon: PokemonSummary[]
  extraColumns?: TableColumnsType<PokemonSummary>
  actions?: boolean
  selected?: PokemonSummary[]
  onSelectedChange?: (selected: PokemonSummary[], selectedKeys: (string | number)[]) => void
  pageSize?: number
  pagination?: TablePaginationConfig | false
  batchExport?: boolean | string
  onClearSelection?: () => void
  view?: PokemonListView
}

export function PokemonTable({
  pokemon,
  extraColumns = [],
  actions = true,
  selected = [],
  onSelectedChange,
  pageSize = 50,
  pagination,
  batchExport,
  onClearSelection,
  view,
}: PokemonTableProps) {
  const { t } = useTranslation()
  const defaultView = usePokemonListView()
  const activeView = view ?? defaultView

  const columns: TableColumnsType<PokemonSummary> = useMemo(
    () => [
      {
        key: 'sprite',
        width: 70,
        render: (_: unknown, p: PokemonSummary) => (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <PokemonSprite pokemon={p} />
            {p.isShiny && (
              <span
                title={t('editor.fields.shiny', 'Shiny')}
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -4,
                  fontSize: 14,
                  filter: 'drop-shadow(0 0 2px rgba(250, 192, 0, 0.8))',
                  userSelect: 'none',
                }}
              >
                ✨
              </span>
            )}
          </div>
        ),
      },
      {
        title: t('table.dex', 'Nº Pokédex'),
        dataIndex: 'speciesId',
        key: 'dex',
        width: 100,
        sorter: (a, b) => (a.speciesId ?? 99999) - (b.speciesId ?? 99999),
        filterDropdown: (props) => (
          <NumberFilter {...props} placeholder={t('table.dex', 'Nº Pokédex')} min={1} max={1025} />
        ),
        onFilter: (value, p) => p.speciesId === value,
        render: (_: unknown, p: PokemonSummary) => (
          <span style={{ color: '#8c8c8c', fontFamily: 'monospace', fontWeight: 600 }}>
            {p.speciesId !== null ? `#${String(p.speciesId).padStart(4, '0')}` : '—'}
          </span>
        ),
      },
      {
        title: t('table.name', 'Name'),
        dataIndex: 'species',
        sorter: (a, b) => a.species.localeCompare(b.species),
        filterDropdown: (props) => <TextFilter {...props} placeholder={t('table.name', 'Name')} />,
        onFilter: (value, p) => containsText(p.species, value),
        render: (_: unknown, p: PokemonSummary) => {
          const hasNickname = Boolean(p.nickname && p.nickname.trim() && p.nickname !== p.species)
          const genderSymbol = p.gender === 'male' ? '♂' : p.gender === 'female' ? '♀' : null
          const genderColor = p.gender === 'male' ? '#1890ff' : '#eb2f96'

          return (
            <Flex vertical gap={2}>
              <Flex align="center" gap={6}>
                <span style={{ fontWeight: 600 }}>{hasNickname ? p.nickname : p.species}</span>
                {genderSymbol && (
                  <span style={{ color: genderColor, fontWeight: 700, fontSize: '0.9em' }}>
                    {genderSymbol}
                  </span>
                )}
                {p.isEgg && (
                  <Tag color="gold" style={{ fontSize: '0.7em', padding: '0 4px', margin: 0 }}>
                    {t('editor.fields.egg', 'Egg')}
                  </Tag>
                )}
              </Flex>
              {hasNickname && (
                <span style={{ fontSize: '0.8em', color: '#8c8c8c' }}>{p.species}</span>
              )}
              {p.types && p.types.length > 0 && (
                <Flex wrap="wrap" gap={2} style={{ marginTop: 2 }}>
                  {p.types.map((typeId) => (
                    <TypeBadge key={typeId} typeId={typeId} size="small" />
                  ))}
                </Flex>
              )}
            </Flex>
          )
        },
      },
      {
        title: t('table.level', 'Level'),
        dataIndex: 'level',
        width: 90,
        sorter: (a, b) => a.level - b.level,
        filterDropdown: (props) => <NumberFilter {...props} placeholder={t('table.level', 'Level')} min={1} max={100} />,
        onFilter: (value, p) => p.level === value,
        render: (level: number) => (
          <Tag color={level === 100 ? 'purple' : level >= 50 ? 'blue' : 'default'} style={{ fontWeight: 600 }}>
            {t('box.levelPrefix', 'Lvl')} {level}
          </Tag>
        ),
      },
      ...extraColumns,
      ...(actions
        ? [
            {
              title: t('table.action', 'Action'),
              key: 'action',
              render: (_: unknown, p: PokemonSummary) => <PokemonActions pokemon={p} />,
            },
          ]
        : []),
    ],
    [t, extraColumns, actions],
  )

  // Se a visualização for Galeria (Grid)
  if (activeView === 'gallery') {
    return (
      <PokemonGrid
        pokemon={pokemon}
        selected={selected}
        onSelectedChange={onSelectedChange}
        pageSize={pageSize}
        pagination={pagination}
        onClearSelection={onClearSelection}
        actions={actions}
      />
    )
  }

  // Visualização por Tabela (Table)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {selected.length > 0 && (
        <Flex
          align="center"
          justify="space-between"
          gap={12}
          wrap="wrap"
          style={{
            padding: '10px 16px',
            background: 'rgba(220, 10, 45, 0.08)',
            borderRadius: 8,
            border: '1px solid rgba(220, 10, 45, 0.25)',
          }}
        >
          <span style={{ fontWeight: 600, color: '#A00820' }}>
            {selected.length === 1
              ? t('table.oneSelected', '1 Pokémon selecionado')
              : t('table.multipleSelected', '{0} Pokémon selecionados').replace('{0}', String(selected.length))}
          </span>
          <Space>
            {onSelectedChange && (
              <Button onClick={() => (onClearSelection ? onClearSelection() : onSelectedChange([], []))}>
                {t('actions.clearSelection', 'Limpar seleção')}
              </Button>
            )}
          </Space>
        </Flex>
      )}
      <Table<PokemonSummary>
        rowKey={rowKey}
        dataSource={pokemon}
        columns={columns}
        rowSelection={
          onSelectedChange && {
            preserveSelectedRowKeys: true,
            selectedRowKeys: selected.map(rowKey),
            onChange: (selectedRowKeys, rows) => {
              const keySet = new Set(selectedRowKeys.map(String))
              const map = new Map<string, PokemonSummary>()
              for (const p of selected) {
                if (keySet.has(rowKey(p))) {
                  map.set(rowKey(p), p)
                }
              }
              for (const p of rows) {
                map.set(rowKey(p), p)
              }
              onSelectedChange(Array.from(map.values()), selectedRowKeys as (string | number)[])
            },
          }
        }
        size="small"
        scroll={{ x: 'max-content' }}
        pagination={
          pagination === false
            ? false
            : {
                defaultPageSize: pageSize,
                pageSizeOptions: ['10', '25', '50', '100'],
                showSizeChanger: true,
                showTotal: (total) => `${total} Pokémon`,
                ...pagination,
              }
        }
      />
    </div>
  )
}
