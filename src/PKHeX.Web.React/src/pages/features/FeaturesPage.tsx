import { useMemo, useState } from 'react'
import {
  AppstoreOutlined,
  ArrowLeftOutlined,
  BlockOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  CloudDownloadOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  EyeOutlined,
  FilterOutlined,
  GiftOutlined,
  HistoryOutlined,
  MobileOutlined,
  PlayCircleOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  ShopOutlined,
  SwapOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  ToolOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Button, Card, Col, Empty, Flex, Input, Row, Segmented, Tag, Typography } from 'antd'
import { useNavigate } from 'react-router'
import { PageHeader } from '../../components/PageHeader'
import { BattleIcon } from '../../components/BattleIcon'
import { useTranslation } from '../../i18n'
import { routes } from '../../routes'

interface FeatureItem {
  id: string
  titleKey: string
  descKey: string
  fallbackTitle: string
  fallbackDesc: string
  category: 'new' | 'core'
  icon: React.ReactNode
  tagColor: string
}

export default function FeaturesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'core'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const features: FeatureItem[] = useMemo(
    () => [
      // 1. Novidades & Melhorias Exclusivas do DXCore
      {
        id: 'captureAnimation',
        category: 'new',
        tagColor: 'blue',
        icon: <PlayCircleOutlined style={{ fontSize: 20, color: '#38bdf8' }} />,
        titleKey: 'features.item.captureAnimation.title',
        descKey: 'features.item.captureAnimation.desc',
        fallbackTitle: 'Animação de Captura na Abertura (Splash Screen)',
        fallbackDesc:
          'Abertura imersiva de 2 segundos com Pokébola oscilando com LED pulsante, clique com estrelas e revelação da marca DXCore.',
      },
      {
        id: 'moveBox',
        category: 'new',
        tagColor: 'green',
        icon: <SwapOutlined style={{ fontSize: 20, color: '#52c41a' }} />,
        titleKey: 'features.item.moveBox.title',
        descKey: 'features.item.moveBox.desc',
        fallbackTitle: 'Mover Pokémon entre Caixas',
        fallbackDesc:
          'Transferência em lote para qualquer caixa do PC com cálculo de vagas em tempo real e proteção contra corrupção do save.',
      },
      {
        id: 'boxFilters',
        category: 'new',
        tagColor: 'cyan',
        icon: <FilterOutlined style={{ fontSize: 20, color: '#13c2c2' }} />,
        titleKey: 'features.item.boxFilters.title',
        descKey: 'features.item.boxFilters.desc',
        fallbackTitle: 'Filtros Avançados por Tipos e Shiny',
        fallbackDesc:
          'Menu agrupado com filtros rápidos por Tipo Elemental, Classificação Shiny/Normal, Caixa específica e faixas de nível.',
      },
      {
        id: 'galleryView',
        category: 'new',
        tagColor: 'purple',
        icon: <AppstoreOutlined style={{ fontSize: 20, color: '#722ed1' }} />,
        titleKey: 'features.item.galleryView.title',
        descKey: 'features.item.galleryView.desc',
        fallbackTitle: 'Visualização em Galeria de Cards',
        fallbackDesc:
          'Alternância com 1 clique entre modo de galeria em grade visual com sprites animados e tabela analítica detalhada.',
      },
      {
        id: 'visualIndicators',
        category: 'new',
        tagColor: 'gold',
        icon: <ThunderboltOutlined style={{ fontSize: 20, color: '#faad14' }} />,
        titleKey: 'features.item.visualIndicators.title',
        descKey: 'features.item.visualIndicators.desc',
        fallbackTitle: 'Indicadores Visuais na Tabela',
        fallbackDesc:
          'Ícone reluzente com drop-shadow para Shiny, símbolos de gênero masculino/feminino estilizados e número formatado da Pokédex.',
      },
      {
        id: 'typeBadges',
        category: 'new',
        tagColor: 'cyan',
        icon: <BulbOutlined style={{ fontSize: 20, color: '#13c2c2' }} />,
        titleKey: 'features.item.typeBadges.title',
        descKey: 'features.item.typeBadges.desc',
        fallbackTitle: 'Badges de Tipos e Cores por Nível',
        fallbackDesc:
          'Insígnias de tipo com cores autênticas dos jogos oficiais e destaque visual colorido para níveis 50 e 100 na lista.',
      },
      {
        id: 'mobileNav',
        category: 'new',
        tagColor: 'magenta',
        icon: <MobileOutlined style={{ fontSize: 20, color: '#eb2f96' }} />,
        titleKey: 'features.item.mobileNav.title',
        descKey: 'features.item.mobileNav.desc',
        fallbackTitle: 'Navegação Mobile Estilo Aplicativo',
        fallbackDesc:
          'Barra inferior de 4 abas com fade dinâmico ao rolar e cabeçalho fixo inteligente que reaparece instantaneamente ao subir a tela.',
      },
      {
        id: 'showcaseColumns',
        category: 'new',
        tagColor: 'geekblue',
        icon: <EyeOutlined style={{ fontSize: 20, color: '#2f54eb' }} />,
        titleKey: 'features.item.showcaseColumns.title',
        descKey: 'features.item.showcaseColumns.desc',
        fallbackTitle: 'Layout em Colunas Otimizado (40/60 e 30/70)',
        fallbackDesc:
          'Distribuição proporcional responsiva no editor com card de arte oficial HD e formulário de abas lado a lado.',
      },
      {
        id: 'inventorySearch',
        category: 'new',
        tagColor: 'blue',
        icon: <SearchOutlined style={{ fontSize: 20, color: '#1890ff' }} />,
        titleKey: 'features.item.inventorySearch.title',
        descKey: 'features.item.inventorySearch.desc',
        fallbackTitle: 'Busca Rápida e Contadores na Mochila',
        fallbackDesc:
          'Campo de pesquisa instantânea por nome do item e contagem em tempo real de itens por compartimento da mochila.',
      },
      {
        id: 'statsBars',
        category: 'new',
        tagColor: 'purple',
        icon: <ExperimentOutlined style={{ fontSize: 20, color: '#722ed1' }} />,
        titleKey: 'features.item.statsBars.title',
        descKey: 'features.item.statsBars.desc',
        fallbackTitle: 'Barras Visuais de Atributos',
        fallbackDesc:
          'Barras de progresso com cores dedicadas para HP, Ataque, Defesa, Atq. Especial, Def. Especial e Velocidade no editor.',
      },
      {
        id: 'hybridBackup',
        category: 'new',
        tagColor: 'geekblue',
        icon: <HistoryOutlined style={{ fontSize: 20, color: '#2f54eb' }} />,
        titleKey: 'features.item.hybridBackup.title',
        descKey: 'features.item.hybridBackup.desc',
        fallbackTitle: 'Sistema Híbrido de Backups',
        fallbackDesc:
          'Pontos de restauração manuais ou automáticos com visualização em cards interativos para salvar até 30 versões com total segurança.',
      },
      {
        id: 'headerTrainer',
        category: 'new',
        tagColor: 'cyan',
        icon: <UserOutlined style={{ fontSize: 20, color: '#38bdf8' }} />,
        titleKey: 'features.item.headerTrainer.title',
        descKey: 'features.item.headerTrainer.desc',
        fallbackTitle: 'Identificação em Tempo Real no Cabeçalho',
        fallbackDesc:
          'Exibição do título do jogo ativo com a esfera luminosa DXCore e o badge azul do Treinador Original (OT).',
      },
      {
        id: 'adFree',
        category: 'new',
        tagColor: 'volcano',
        icon: <SafetyCertificateOutlined style={{ fontSize: 20, color: '#fa541c' }} />,
        titleKey: 'features.item.adFree.title',
        descKey: 'features.item.adFree.desc',
        fallbackTitle: 'Experiência Limpa e Sem Anúncios',
        fallbackDesc:
          'Interface rápida e privada sem scripts invasivos de anúncios externos ou rastreadores lentos.',
      },

      // 2. Funções Principais do Sistema (Catálogo Completo)
      {
        id: 'saveSupport',
        category: 'core',
        tagColor: 'blue',
        icon: <DatabaseOutlined style={{ fontSize: 20, color: '#1677ff' }} />,
        titleKey: 'features.item.saveSupport.title',
        descKey: 'features.item.saveSupport.desc',
        fallbackTitle: 'Amplo Suporte a Saves e ROM Hacks',
        fallbackDesc:
          'Compatibilidade com saves das gerações 1 a 9, jogos de GameCube (Colosseum/XD) e hacks populares.',
      },
      {
        id: 'pokemonEditor',
        category: 'core',
        tagColor: 'blue',
        icon: <ToolOutlined style={{ fontSize: 20, color: '#1677ff' }} />,
        titleKey: 'features.item.pokemonEditor.title',
        descKey: 'features.item.pokemonEditor.desc',
        fallbackTitle: 'Editor Aprofundado de Pokémon',
        fallbackDesc:
          'Ajuste completo de espécie, apelido, natureza, golpes, EVs, IVs, Pokébola, dados de encontro e fitas.',
      },
      {
        id: 'boxManager',
        category: 'core',
        tagColor: 'blue',
        icon: <BlockOutlined style={{ fontSize: 20, color: '#1677ff' }} />,
        titleKey: 'features.item.boxManager.title',
        descKey: 'features.item.boxManager.desc',
        fallbackTitle: 'Gerenciador de Caixas Pokémon (PC)',
        fallbackDesc:
          'Visualização de todas as caixas com filtros por nome, número de Pokédex, caixa e faixas de nível.',
      },
      {
        id: 'partyManager',
        category: 'core',
        tagColor: 'blue',
        icon: <BattleIcon style={{ fontSize: 20, color: '#1677ff' }} />,
        titleKey: 'features.item.partyManager.title',
        descKey: 'features.item.partyManager.desc',
        fallbackTitle: 'Gerenciador da Equipe Ativa',
        fallbackDesc:
          'Acesso rápido aos 6 membros da equipe com suporte a exportação, edição e clonagem de Pokémon.',
      },
      {
        id: 'exportImport',
        category: 'core',
        tagColor: 'blue',
        icon: <CloudDownloadOutlined style={{ fontSize: 20, color: '#1677ff' }} />,
        titleKey: 'features.item.exportImport.title',
        descKey: 'features.item.exportImport.desc',
        fallbackTitle: 'Exportação e Importação de Arquivos',
        fallbackDesc:
          'Exportação em arquivos .pk individuais ou em pacotes .zip, e importação por seleção ou arrastar e soltar.',
      },
      {
        id: 'showdownCalc',
        category: 'core',
        tagColor: 'blue',
        icon: <ThunderboltOutlined style={{ fontSize: 20, color: '#1677ff' }} />,
        titleKey: 'features.item.showdownCalc.title',
        descKey: 'features.item.showdownCalc.desc',
        fallbackTitle: 'Integração Showdown & Calculadora de Dano',
        fallbackDesc:
          'Exportação em formato Showdown com 1 clique e envio direto para calculadora de dano competitiva.',
      },
      {
        id: 'saveTransfer',
        category: 'core',
        tagColor: 'blue',
        icon: <SwapOutlined style={{ fontSize: 20, color: '#1677ff' }} />,
        titleKey: 'features.item.saveTransfer.title',
        descKey: 'features.item.saveTransfer.desc',
        fallbackTitle: 'Transferência entre Dois Saves',
        fallbackDesc:
          'Abra um segundo arquivo de save simultaneamente para trocar Pokémon livremente entre partidas.',
      },
      {
        id: 'bagEditor',
        category: 'core',
        tagColor: 'blue',
        icon: <ShopOutlined style={{ fontSize: 20, color: '#1677ff' }} />,
        titleKey: 'features.item.bagEditor.title',
        descKey: 'features.item.bagEditor.desc',
        fallbackTitle: 'Gerenciamento Completo de Itens',
        fallbackDesc:
          'Edição de quantidades e inserção de novos itens por compartimento compatível com a versão do jogo.',
      },
      {
        id: 'eventsWonderCards',
        category: 'core',
        tagColor: 'blue',
        icon: <GiftOutlined style={{ fontSize: 20, color: '#1677ff' }} />,
        titleKey: 'features.item.eventsWonderCards.title',
        descKey: 'features.item.eventsWonderCards.desc',
        fallbackTitle: 'Eventos e Mystery Gifts (Wonder Cards)',
        fallbackDesc:
          'Visualização de álbum de eventos e injeção de presentes comemorativos oficiais em saves compatíveis.',
      },
      {
        id: 'encountersSearch',
        category: 'core',
        tagColor: 'blue',
        icon: <SearchOutlined style={{ fontSize: 20, color: '#1677ff' }} />,
        titleKey: 'features.item.encountersSearch.title',
        descKey: 'features.item.encountersSearch.desc',
        fallbackTitle: 'Buscador de Encontros Legais',
        fallbackDesc:
          'Consulta de locais de captura e condições de encontro válidas para gerar Pokémon autênticos.',
      },
      {
        id: 'localWasm',
        category: 'core',
        tagColor: 'blue',
        icon: <SafetyCertificateOutlined style={{ fontSize: 20, color: '#1677ff' }} />,
        titleKey: 'features.item.localWasm.title',
        descKey: 'features.item.localWasm.desc',
        fallbackTitle: 'Motor WebAssembly 100% Local e Seguro',
        fallbackDesc:
          'Todo o processamento em C# ocorre diretamente no navegador, sem envio de arquivos para a nuvem.',
      },
    ],
    [],
  )

  const filteredFeatures = useMemo(() => {
    return features.filter((item) => {
      if (activeTab === 'new' && item.category !== 'new') return false
      if (activeTab === 'core' && item.category !== 'core') return false

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim()
        const title = t(item.titleKey, item.fallbackTitle).toLowerCase()
        const desc = t(item.descKey, item.fallbackDesc).toLowerCase()
        if (!title.includes(q) && !desc.includes(q)) return false
      }

      return true
    })
  }, [features, activeTab, searchTerm, t])

  const newCount = features.filter((f) => f.category === 'new').length
  const coreCount = features.filter((f) => f.category === 'core').length

  return (
    <Flex vertical gap={16} style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
      {/* Cabeçalho Padronizado do Sistema */}
      <PageHeader
        showBack
        onBack={() => navigate(routes.settings)}
        title={t('features.headerTitle', 'Catálogo de Recursos do DXCore')}
        extra={
          <Input
            prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
            placeholder={t('features.searchPlaceholder', 'Filtrar funções...')}
            allowClear
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', maxWidth: 280 }}
          />
        }
      />

      <Typography.Text type="secondary" style={{ fontSize: 13, lineHeight: 1.4, marginTop: -4 }}>
        {t(
          'features.headerSubtitle',
          'Visão geral das melhorias adicionadas e de todas as funções principais do editor.',
        )}
      </Typography.Text>

      <Flex wrap="wrap" gap={12} justify="space-between" align="center">
        <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Segmented
            value={activeTab}
            onChange={(val) => setActiveTab(val as 'all' | 'new' | 'core')}
            options={[
              {
                label: `${t('features.tabAll', 'Todas')} (${features.length})`,
                value: 'all',
              },
              {
                label: `✨ ${t('features.tabNew', 'Novidades')} (${newCount})`,
                value: 'new',
              },
              {
                label: `⚙️ ${t('features.tabCore', 'Sistema')} (${coreCount})`,
                value: 'core',
              },
            ]}
          />
        </div>

        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {filteredFeatures.length} / {features.length}{' '}
          {t('features.countSuffix', 'funções')}
        </Typography.Text>
      </Flex>

      {/* Grid de Funções */}
      {filteredFeatures.length === 0 ? (
        <Card>
          <Empty description={t('features.noResults', 'Nenhuma função encontrada com esse filtro.')} />
        </Card>
      ) : (
        <Row gutter={[12, 12]}>
          {filteredFeatures.map((item) => {
            const isNew = item.category === 'new'
            const badgeLabel = isNew
              ? t('features.badgeNew', 'Adicionado')
              : t('features.badgeCore', 'Sistema')
            const title = t(item.titleKey, item.fallbackTitle)
            const desc = t(item.descKey, item.fallbackDesc)

            return (
              <Col xs={24} sm={24} md={12} key={item.id}>
                <Card
                  hoverable
                  style={{
                    height: '100%',
                    borderLeft: isNew ? '4px solid #52c41a' : '4px solid #1677ff',
                  }}
                  styles={{ body: { padding: '14px 16px' } }}
                >
                  <Flex vertical gap={6}>
                    {/* Badge posicionado ACIMA do título */}
                    <div>
                      <Tag
                        color={item.tagColor}
                        style={{
                          margin: 0,
                          fontWeight: 600,
                          fontSize: 11,
                          borderRadius: 3,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                        }}
                      >
                        {badgeLabel}
                      </Tag>
                    </div>

                    <Flex align="center" gap={8} style={{ marginTop: 2 }}>
                      {item.icon}
                      <Typography.Text strong style={{ fontSize: 15 }}>
                        {title}
                      </Typography.Text>
                    </Flex>

                    <Typography.Paragraph
                      type="secondary"
                      style={{ margin: 0, fontSize: 12.5, lineHeight: '1.5' }}
                    >
                      {desc}
                    </Typography.Paragraph>
                  </Flex>
                </Card>
              </Col>
            )
          })}
        </Row>
      )}
    </Flex>
  )
}

