import { useEffect, useRef, useState, type ReactNode } from 'react'
import { LeftOutlined, RightOutlined, SwapOutlined } from '@ant-design/icons'
import { Button, Col, Flex, Row, Space, Tabs, Tooltip } from 'antd'
import { draftHandle } from '@pkhex-everywhere/engine'
import { usePokemon, usePokemonDetails, useQuery } from '@pkhex-everywhere/react'
import { PageHeader } from '../../components/PageHeader'
import { PokemonImage } from '../../components/PokemonImage'
import { changeEditorLayout, useEditorLayout } from '../../host'
import { useTranslation } from '../../i18n'
import { AbilityTab } from './AbilityTab'
import { DescriptionTab } from './DescriptionTab'
import { LegalityBanner } from './LegalityBanner'
import { MetConditionsTab } from './MetConditionsTab'
import { MovesTab } from './MovesTab'
import { PokemonShowcaseCard } from './PokemonShowcaseCard'
import { StatsTab } from './StatsTab'
import { TrainerTab } from './TrainerTab'
import { TypeMatchupTab } from './TypeMatchupTab'

interface DraftEditorProps {
  actions: ReactNode
  notice?: ReactNode
  onBack?: () => void
}

export function DraftEditor({ actions, notice, onBack }: DraftEditorProps) {
  const { pokemon } = usePokemon(draftHandle)
  const { details } = usePokemonDetails(draftHandle)
  const options = useQuery('pokemon.options', draftHandle)
  const editorLayout = useEditorLayout()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('description')
  const tabsRef = useRef<HTMLDivElement>(null)

  const hasAbilities = options?.abilities && options.abilities.length > 0

  const tabItems = [
    {
      key: 'description',
      label: t('editor.tabs.description', 'Description'),
      children: <DescriptionTab />,
    },
    ...(hasAbilities
      ? [
        {
          key: 'ability',
          label: t('editor.tabs.ability', 'Habilidade'),
          children: <AbilityTab />,
        },
      ]
      : []),
    {
      key: 'matchups',
      label: t('editor.tabs.matchups', 'Vantagens & Fraquezas'),
      children: <TypeMatchupTab />,
    },
    {
      key: 'metConditions',
      label: t('editor.tabs.metConditions', 'Met Conditions'),
      children: <MetConditionsTab />,
    },
    {
      key: 'stats',
      label: t('editor.tabs.stats', 'Stats'),
      children: <StatsTab />,
    },
    {
      key: 'moves',
      label: t('editor.tabs.moves', 'Moves'),
      children: <MovesTab />,
    },
    {
      key: 'trainer',
      label: t('editor.tabs.trainer', 'Trainer'),
      children: <TrainerTab />,
    },
  ]

  const currentIndex = tabItems.findIndex((item) => item.key === activeTab)

  const handlePrevTab = () => {
    if (currentIndex > 0) {
      const prevKey = tabItems[currentIndex - 1].key
      setActiveTab(prevKey)
      const nav = tabsRef.current?.querySelector('.ant-tabs-nav-wrap') as HTMLElement | null
      nav?.scrollBy({ left: -140, behavior: 'smooth' })
    }
  }

  const handleNextTab = () => {
    if (currentIndex < tabItems.length - 1) {
      const nextKey = tabItems[currentIndex + 1].key
      setActiveTab(nextKey)
      const nav = tabsRef.current?.querySelector('.ant-tabs-nav-wrap') as HTMLElement | null
      nav?.scrollBy({ left: 140, behavior: 'smooth' })
    }
  }

  // Permite rolar a barra de abas horizontalmente usando a roda do mouse no desktop
  useEffect(() => {
    const navWrap = tabsRef.current?.querySelector('.ant-tabs-nav-wrap') as HTMLElement | null
    if (!navWrap) return
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 && navWrap.scrollWidth > navWrap.clientWidth) {
        e.preventDefault()
        navWrap.scrollLeft += e.deltaY
      }
    }
    navWrap.addEventListener('wheel', onWheel, { passive: false })
    return () => navWrap.removeEventListener('wheel', onWheel)
  }, [tabItems.length])

  // Controles de setas para navegação entre abas
  const tabBarExtra = (
    <Space size={4} align="center" style={{ paddingLeft: 8 }}>
      <Tooltip title={t('editor.prevTab', 'Aba anterior')}>
        <Button
          size="small"
          shape="circle"
          icon={<LeftOutlined />}
          disabled={currentIndex <= 0}
          onClick={handlePrevTab}
          aria-label={t('editor.prevTab', 'Aba anterior')}
        />
      </Tooltip>
      <Tooltip title={t('editor.nextTab', 'Próxima aba')}>
        <Button
          size="small"
          shape="circle"
          icon={<RightOutlined />}
          disabled={currentIndex >= tabItems.length - 1}
          onClick={handleNextTab}
          aria-label={t('editor.nextTab', 'Próxima aba')}
        />
      </Tooltip>
    </Space>
  )

  // Layout 1: Showcase 40/60 (Colunas com Arte Oficial Grande)
  if (editorLayout === 'showcase') {
    return (
      <Flex vertical gap={20}>
        <PageHeader
          showBack
          onBack={onBack}
          title={pokemon.nickname || pokemon.species || 'Pokémon'}
          extra={
            <Tooltip
              title={t(
                'editor.layoutToggleTip',
                'Alternar para o Layout Clássico com GIF',
              )}
            >
              <Button
                size="small"
                shape="circle"
                icon={<SwapOutlined />}
                onClick={() => changeEditorLayout('classic')}
                aria-label={t('editor.classicBtn', 'Alternar layout')}
              />
            </Tooltip>
          }
        />
        {notice}
        <Row gutter={[20, 20]} align="stretch">
          {/* Coluna Esquerda (~40% no desktop): Card de Destaque Visual */}
          <Col xs={24} lg={10} xl={9}>
            <PokemonShowcaseCard pokemon={pokemon} />
          </Col>

          {/* Coluna Direita (~60% no desktop): Formulário de Abas e Informações */}
          <Col xs={24} lg={14} xl={15}>
            <Flex vertical gap={16} style={{ height: '100%', justifyContent: 'space-between' }}>
              <Flex vertical gap={16}>
                {details.legality && <LegalityBanner legality={details.legality} />}
                <div ref={tabsRef} className="pokemon-editor-tabs-wrapper">
                  <Tabs
                    items={tabItems}
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    tabBarExtraContent={tabBarExtra}
                  />
                </div>
              </Flex>
              <Flex justify="end" style={{ marginTop: 12 }}>
                {actions}
              </Flex>
            </Flex>
          </Col>
        </Row>
      </Flex>
    )
  }

  // Layout 2: Clássico (Cabeçalho Compacto com GIF Animado)
  return (
    <Flex vertical gap={20}>
      <PageHeader
        showBack
        onBack={onBack}
        title={pokemon.nickname || pokemon.species || 'Pokémon'}
        extra={
          <Space size={12} align="center">
            <Tooltip
              title={t(
                'editor.layoutToggleTip',
                'Alternar para o Novo Layout em Colunas (Arte Oficial Grande)',
              )}
            >
              <Button
                size="small"
                shape="circle"
                icon={<SwapOutlined />}
                onClick={() => changeEditorLayout('showcase')}
                aria-label={t('editor.showcaseBtn', 'Alternar layout')}
              />
            </Tooltip>
            <PokemonImage pokemon={pokemon} />
          </Space>
        }
      />
      {notice}
      {details.legality && <LegalityBanner legality={details.legality} />}
      <div ref={tabsRef} className="pokemon-editor-tabs-wrapper">
        <Tabs
          items={tabItems}
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarExtraContent={tabBarExtra}
        />
      </div>
      <Flex justify="end">{actions}</Flex>
    </Flex>
  )
}
