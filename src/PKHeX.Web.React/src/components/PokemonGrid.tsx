import { useMemo, useState } from 'react'
import { Checkbox, Card, Col, Empty, Flex, Pagination, Row, Space, Tag, Typography, Button, type TablePaginationConfig } from 'antd'
import type { PokemonSummary } from '@pkhex-everywhere/engine'
import { pokemonOfficialArtworkUrl } from './PokemonImage'
import { PokemonSprite } from './PokemonSprite'
import { PokemonActions } from './PokemonActions'
import { TypeBadge } from './TypeBadge'
import { useTranslation } from '../i18n'

const rowKey = (pokemon: PokemonSummary) => JSON.stringify(pokemon.at)

export interface PokemonGridProps {
  pokemon: PokemonSummary[]
  selected?: PokemonSummary[]
  onSelectedChange?: (selected: PokemonSummary[], selectedKeys: (string | number)[]) => void
  pageSize?: number
  pagination?: TablePaginationConfig | false
  onClearSelection?: () => void
  actions?: boolean
}

export function PokemonGrid({
  pokemon,
  selected = [],
  onSelectedChange,
  pageSize = 48,
  pagination,
  onClearSelection,
  actions = true,
}: PokemonGridProps) {
  const { t } = useTranslation()
  const [currentPage, setCurrentPage] = useState(1)
  const [activePageSize, setActivePageSize] = useState(pageSize)

  const selectedKeySet = useMemo(() => new Set(selected.map(rowKey)), [selected])

  const toggleSelect = (p: PokemonSummary) => {
    if (!onSelectedChange) return
    const key = rowKey(p)
    let next: PokemonSummary[]
    if (selectedKeySet.has(key)) {
      next = selected.filter((item) => rowKey(item) !== key)
    } else {
      next = [...selected, p]
    }
    onSelectedChange(next, next.map(rowKey))
  }

  // Handle pagination slicing
  const displayedPokemon = useMemo(() => {
    if (pagination === false) return pokemon
    const start = (currentPage - 1) * activePageSize
    return pokemon.slice(start, start + activePageSize)
  }, [pokemon, pagination, currentPage, activePageSize])

  if (pokemon.length === 0) {
    return <Empty description={t('box.noPokemon', 'Nenhum Pokémon encontrado')} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Barra de seleção */}
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

      {/* Grid de Cards de Pokémon */}
      <Row gutter={[16, 16]}>
        {displayedPokemon.map((p) => {
          const isSelected = selectedKeySet.has(rowKey(p))
          return (
            <Col xs={12} md={6} xl={4} key={rowKey(p)}>
              <PokemonGridCard
                pokemon={p}
                isSelected={isSelected}
                selectable={Boolean(onSelectedChange)}
                onToggleSelect={() => toggleSelect(p)}
                showActions={actions}
              />
            </Col>
          )
        })}
      </Row>

      {/* Paginação */}
      {pagination !== false && pokemon.length > activePageSize && (
        <Flex vertical align="center" gap={8} style={{ width: '100%', marginTop: 8 }}>
          <Pagination
            current={currentPage}
            pageSize={activePageSize}
            total={pokemon.length}
            pageSizeOptions={['24', '48', '96']}
            showSizeChanger
            showTotal={(total) => `${total} Pokémon`}
            onChange={(page, size) => {
              setCurrentPage(page)
              if (size && size !== activePageSize) {
                setActivePageSize(size)
              }
            }}
          />
        </Flex>
      )}
    </div>
  )
}

interface PokemonGridCardProps {
  pokemon: PokemonSummary
  isSelected: boolean
  selectable: boolean
  onToggleSelect: () => void
  showActions: boolean
}

function PokemonGridCard({
  pokemon,
  isSelected,
  selectable,
  onToggleSelect,
  showActions,
}: PokemonGridCardProps) {
  const { t } = useTranslation()
  const [artworkFailed, setArtworkFailed] = useState(false)

  const dexNumber =
    pokemon.speciesId !== null && pokemon.speciesId !== undefined
      ? `#${String(pokemon.speciesId).padStart(4, '0')}`
      : '—'

  const artworkSrc = pokemonOfficialArtworkUrl(pokemon.speciesId, pokemon.isShiny)
  const hasNickname = Boolean(pokemon.nickname && pokemon.nickname.trim() && pokemon.nickname !== pokemon.species)
  const genderSymbol = pokemon.gender === 'male' ? '♂' : pokemon.gender === 'female' ? '♀' : null
  const genderColor = pokemon.gender === 'male' ? '#1890ff' : '#eb2f96'
  const isBoxPokemon = typeof pokemon.at.box === 'number'

  return (
    <Card
      hoverable
      size="small"
      onClick={() => {
        if (selectable) onToggleSelect()
      }}
      style={{
        height: '100%',
        borderRadius: 10,
        position: 'relative',
        cursor: selectable ? 'pointer' : 'default',
        border: isSelected ? '2px solid #DC0A2D' : undefined,
        background: isSelected ? 'rgba(220, 10, 45, 0.04)' : undefined,
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
      {/* Topo do Card: Checkbox + Dex # + Shiny/Egg */}
      <Flex justify="space-between" align="center" style={{ width: '100%' }}>
        {selectable ? (
          <Checkbox
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation()
              onToggleSelect()
            }}
            onClick={(e) => e.stopPropagation()}
            aria-label={pokemon.nickname || pokemon.species}
          />
        ) : (
          <span />
        )}
        <Flex align="center" gap={4}>
          <span style={{ color: '#8c8c8c', fontFamily: 'monospace', fontWeight: 600, fontSize: 12 }}>
            {dexNumber}
          </span>
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

      {/* Imagem HD do Pokémon: Reduzida para 80x80px */}
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
        {artworkSrc && !artworkFailed ? (
          <img
            src={artworkSrc}
            alt={pokemon.species}
            onError={() => setArtworkFailed(true)}
            style={{
              width: 80,
              height: 80,
              maxHeight: 80,
              maxWidth: 80,
              objectFit: 'contain',
              filter: pokemon.isShiny
                ? 'drop-shadow(0 0 6px rgba(250, 173, 20, 0.5))'
                : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.12))',
              transition: 'transform 0.15s ease',
            }}
          />
        ) : (
          <div style={{ transform: 'scale(1.3)' }}>
            <PokemonSprite pokemon={pokemon} />
          </div>
        )}
      </div>

      {/* Identificação: Nome, Apelido, Gênero */}
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

      {/* Ações */}
      {showActions && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ marginTop: 4, width: '100%', display: 'flex', justifyContent: 'center' }}
        >
          <PokemonActions pokemon={pokemon} />
        </div>
      )}
    </Card>
  )
}
