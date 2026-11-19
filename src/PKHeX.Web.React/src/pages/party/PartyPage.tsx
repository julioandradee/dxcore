import { useMemo, useState } from 'react'
import {
  AppstoreOutlined,
  CalculatorOutlined,
  CopyOutlined,
  DownOutlined,
  DownloadOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'
import { App, Button, Dropdown, Flex, Segmented, Tag, type MenuProps } from 'antd'
import type { PokemonSummary } from '@pkhex-everywhere/engine'
import { useEngine, useParty } from '@pkhex-everywhere/react'
import { PageHeader } from '../../components/PageHeader'
import { PokemonTable } from '../../components/PokemonTable'
import { useCopyShowdown } from '../../hooks/useCopyShowdown'
import { useExportPokemon } from '../../hooks/useExportPokemon'
import { useSupports } from '../../hooks/useSupports'
import { changePokemonListView, openCalculator, usePokemonListView, type PokemonListView } from '../../host'
import { useTranslation } from '../../i18n'

export default function PartyPage() {
  const { party } = useParty()
  const engine = useEngine()
  const { t } = useTranslation()
  const listView = usePokemonListView()
  const { notification } = App.useApp()
  const [selected, setSelected] = useState<PokemonSummary[]>([])
  const { exportMultiple, exporting } = useExportPokemon()
  const [batchBusy, setBatchBusy] = useState(false)
  const copyShowdown = useCopyShowdown()
  const showdownSupported = useSupports('showdown')

  const handleBatchClone = async (targets: PokemonSummary[]) => {
    setBatchBusy(true)
    try {
      const editables = targets.filter((p) => p.editable)
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

  const menuItems: MenuProps['items'] = useMemo(() => {
    const hasSelection = selected.length > 0
    const items: MenuProps['items'] = [
      {
        key: 'selection-group',
        type: 'group',
        label: `${t('party.selectionGroup', 'Ações de Seleção')} (${selected.length})`,
        children: [
          {
            key: 'export',
            icon: <DownloadOutlined />,
            label:
              selected.length === 1
                ? t('actions.exportSingle', 'Exportar (.pk)')
                : t('actions.exportZip', 'Exportar ({0}) como .zip').replace('{0}', String(selected.length || 0)),
            disabled: !hasSelection || exporting,
            onClick: () => void exportMultiple(selected, 'party_pokemon.zip'),
          },
          {
            key: 'clone',
            icon: <CopyOutlined />,
            label: t('batch.cloneSelected', 'Clonar Selecionados na Caixa'),
            disabled: !hasSelection || batchBusy,
            onClick: () => void handleBatchClone(selected),
          },
        ],
      },
    ]

    if (showdownSupported) {
      items.push(
        { type: 'divider' },
        {
          key: 'tools-group',
          type: 'group',
          label: t('party.toolsGroup', 'Ferramentas Showdown'),
          children: [
            {
              key: 'calculator',
              icon: <CalculatorOutlined />,
              label: t('actions.calculator', 'Calculadora de Dano'),
              onClick: async () => {
                const showdown = selected.length
                  ? (await Promise.all(selected.map((p) => engine.pokemon.showdown(p.at)))).join('\n\n')
                  : await engine.party.showdown()
                openCalculator(showdown)
              },
            },
            {
              key: 'showdown',
              icon: <CopyOutlined />,
              label: t('actions.showdownParty', 'Copiar Showdown da Equipe'),
              onClick: async () => {
                await copyShowdown(await engine.party.showdown(), `${party.length} entries`)
              },
            },
          ],
        },
      )
    }

    return items
  }, [
    selected,
    exporting,
    batchBusy,
    showdownSupported,
    party.length,
    t,
    engine,
    copyShowdown,
    exportMultiple,
  ])

  return (
    <Flex vertical gap={20}>
      <PageHeader
        title={
          <Flex align="center" gap={12} wrap="wrap" style={{ minWidth: 'fit-content' }}>
            <span style={{ whiteSpace: 'nowrap' }}>{t('party.title', 'Party')}</span>
            <Tag
              style={{
                backgroundColor: '#DC0A2D',
                color: '#ffffff',
                borderColor: '#DC0A2D',
                fontWeight: 600,
                borderRadius: 4,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 10px',
                minWidth: 'fit-content',
                lineHeight: '1.5',
                margin: 0,
              }}
            >
              {party.length} / 6
            </Tag>
          </Flex>
        }
        extra={
          <Flex align="center" gap={10} wrap="wrap">
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
                <span>{t('party.actions', 'Ações')}</span>
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
                <DownOutlined style={{ fontSize: 11, marginLeft: 4 }} />
              </Button>
            </Dropdown>
          </Flex>
        }
      />
      <PokemonTable
        pokemon={party}
        selected={selected}
        onSelectedChange={setSelected}
        pagination={false}
      />
    </Flex>
  )
}
