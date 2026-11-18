import { useState } from 'react'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { Card, Flex, Space, Tag, Typography } from 'antd'
import type { PokemonSummary } from '@pkhex-everywhere/engine'
import { pokemonOfficialArtworkUrl } from '../../components/PokemonImage'
import { TypeBadge } from '../../components/TypeBadge'
import { useTranslation } from '../../i18n'

interface PokemonShowcaseCardProps {
  pokemon: Pick<PokemonSummary, 'speciesId' | 'species' | 'isShiny' | 'nickname' | 'level' | 'gender' | 'types'>
}

export function PokemonShowcaseCard({ pokemon }: PokemonShowcaseCardProps) {
  const { t } = useTranslation()
  const [imgFailed, setImgFailed] = useState(false)

  const artworkSrc = pokemonOfficialArtworkUrl(pokemon.speciesId, pokemon.isShiny)
  const dexNumber =
    pokemon.speciesId !== null && pokemon.speciesId !== undefined
      ? `#${String(pokemon.speciesId).padStart(4, '0')}`
      : '---'

  const genderSymbol =
    pokemon.gender === 'male' ? (
      <span style={{ color: '#1890ff', fontWeight: 'bold' }}>♂ Macho</span>
    ) : pokemon.gender === 'female' ? (
      <span style={{ color: '#eb2f96', fontWeight: 'bold' }}>♀ Fêmea</span>
    ) : null

  return (
    <Card
      style={{
        height: '100%',
        textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(22, 119, 255, 0.03) 0%, rgba(0, 0, 0, 0.02) 100%)',
        borderRadius: 12,
        position: 'relative',
      }}
      styles={{
        body: {
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        },
      }}
    >
      {/* Identificação Pokédex e Shiny */}
      <Flex justify="center" align="center" gap={8} wrap="wrap">
        <Tag style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 13, margin: 0 }}>
          {dexNumber}
        </Tag>
        {pokemon.isShiny ? (
          <Tag color="gold" style={{ fontWeight: 600, margin: 0 }}>
            ✨ Shiny
          </Tag>
        ) : (
          <Tag style={{ margin: 0 }}>Normal</Tag>
        )}
      </Flex>

      {/* Imagem Oficial Grande em Destaque */}
      <div
        style={{
          width: '100%',
          minHeight: 260,
          maxHeight: 320,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px',
          position: 'relative',
        }}
      >
        {artworkSrc && !imgFailed ? (
          <img
            src={artworkSrc}
            alt={pokemon.species}
            onError={() => setImgFailed(true)}
            style={{
              maxHeight: 280,
              maxWidth: '100%',
              objectFit: 'contain',
              filter: pokemon.isShiny ? 'drop-shadow(0 0 20px rgba(255, 128, 0, 0.8))' : 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.12))',
              transition: 'transform 0.2s ease-in-out',
            }}
          />
        ) : (
          <QuestionCircleOutlined style={{ fontSize: 96, color: '#bfbfbf' }} />
        )}
      </div>

      {/* Nome e Apelido */}
      <Flex vertical align="center" gap={4}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {pokemon.nickname || pokemon.species || 'Pokémon'}
        </Typography.Title>
        {pokemon.nickname && pokemon.nickname !== pokemon.species && (
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            ({pokemon.species})
          </Typography.Text>
        )}
      </Flex>

      {/* Badges dos Tipos */}
      {pokemon.types && pokemon.types.length > 0 && (
        <Space size={6} wrap style={{ justifyContent: 'center' }}>
          {pokemon.types.map((typeId) => (
            <TypeBadge key={typeId} typeId={typeId} size="middle" />
          ))}
        </Space>
      )}

      {/* Metadados rápidos: Nível e Gênero */}
      <Flex justify="center" gap={10} wrap="wrap" style={{ marginTop: 4 }}>
        <Tag
          color={pokemon.level === 100 ? 'purple' : pokemon.level >= 50 ? 'blue' : 'default'}
          style={{ fontWeight: 600, margin: 0 }}
        >
          {t('table.level', 'Nível')} {pokemon.level}
        </Tag>
        {genderSymbol && <Tag style={{ margin: 0 }}>{genderSymbol}</Tag>}
      </Flex>
    </Card>
  )
}
