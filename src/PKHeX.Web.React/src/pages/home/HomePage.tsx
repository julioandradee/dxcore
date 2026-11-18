import { useState } from 'react'
import {
  ExportOutlined,
  HistoryOutlined,
  InboxOutlined,
  ShopOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { App, Button, Card, Col, Descriptions, Flex, Input, InputNumber, Row, Space, Statistic, Typography } from 'antd'
import { EngineError } from '@pkhex-everywhere/engine'
import { useBox, useEngine, useLoadedGame, useParty, useTrainer } from '@pkhex-everywhere/react'
import { gameName } from '../../capabilities'
import { TrainerGenderRadio } from '../../components/TrainerGenderRadio'
import { downloadFile, useNavigate } from '../../host'
import { useTranslation } from '../../i18n'
import { routes } from '../../routes'
import { SaveBackupModal } from '../../snapshots/SaveBackupModal'

const maxMoney = 999_999
const maxBattlePoints = 65_535

export default function HomePage() {
  const { game } = useLoadedGame()

  return (
    <Flex vertical gap={20} style={{ width: '100%' }}>
      {game && (
        <>
          <TrainerCard />
          <SaveOverviewCard />
        </>
      )}
    </Flex>
  )
}

function SaveOverviewCard() {
  const { t } = useTranslation()
  const { game } = useLoadedGame()
  const { party } = useParty()
  const { box } = useBox()
  const engine = useEngine()
  const navigate = useNavigate()
  const [backupModalOpen, setBackupModalOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  if (!game) return null

  const totalBoxPokemon = box.length
  const totalPartyPokemon = party.length
  const shinyCount = box.filter((p) => p.isShiny).length + party.filter((p) => p.isShiny).length

  const handleExport = async () => {
    setExporting(true)
    try {
      const { bytes, fileName } = await engine.game.export()
      downloadFile(bytes, fileName)
    } finally {
      setExporting(false)
    }
  }

  return (
    <Card
      title={
        <Flex align="center" gap={8}>
          <span>{t('home.overviewTitle', 'Visão Geral do Save')}</span>
          <span style={{ fontSize: '0.85em', color: '#8c8c8c' }}>({gameName(game)})</span>
        </Flex>
      }
      size="small"
      style={{ borderRadius: 8 }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} md={6}>
          <Statistic
            title={t('home.partyCount', 'Na Equipe')}
            value={totalPartyPokemon}
            suffix="/ 6"
            prefix={<TeamOutlined style={{ color: '#1677ff' }} />}
          />
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Statistic
            title={t('home.boxCount', 'Nas Caixas')}
            value={totalBoxPokemon}
            prefix={<InboxOutlined style={{ color: '#52c41a' }} />}
          />
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Statistic
            title={t('home.shinyCount', 'Pokémon Shiny')}
            value={shinyCount}
            prefix={<span style={{ color: '#faad14' }}>✨</span>}
          />
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Statistic
            title={t('home.fileName', 'Arquivo')}
            value={game.fileName ?? '—'}
            valueStyle={{ fontSize: '0.9rem', wordBreak: 'break-all' }}
          />
        </Col>
      </Row>

      <Flex wrap="wrap" gap={10} style={{ marginTop: 20 }}>
        <Button icon={<TeamOutlined />} onClick={() => navigate(routes.party)}>
          {t('menu.party', 'Equipe')}
        </Button>
        <Button icon={<InboxOutlined />} onClick={() => navigate(routes.box)}>
          {t('menu.box', 'Caixas Pokémon')}
        </Button>
        <Button icon={<ShopOutlined />} onClick={() => navigate(routes.items)}>
          {t('menu.items', 'Itens')}
        </Button>
        <Button icon={<HistoryOutlined />} onClick={() => setBackupModalOpen(true)}>
          {t('backup.title', 'Histórico e Backups')}
        </Button>
        <Button type="primary" icon={<ExportOutlined />} loading={exporting} onClick={() => void handleExport()}>
          {t('load.export', 'Salvar / Exportar')}
        </Button>
      </Flex>
      <SaveBackupModal open={backupModalOpen} onClose={() => setBackupModalOpen(false)} />
    </Card>
  )
}

function TrainerCard() {
  const { t } = useTranslation()
  const { trainer, setName, setGender, setMoney, setBattlePoints } = useTrainer()
  const edit = useTrainerEdit()
  const [name, setNameDraft] = useState<string | null>(null)
  const commitName = () => {
    if (name !== null && name !== trainer.name) void edit(() => setName(name))
    setNameDraft(null)
  }
  const money = useDraft(trainer.money, (value) => value !== null && edit(() => setMoney(value)))
  const battlePoints = useDraft(trainer.battlePoints, (value) => value !== null && edit(() => setBattlePoints(value)))

  return (
    <Descriptions
      title={t('trainer.title')}
      bordered
      size="small"
      layout="vertical"
      column={{ xs: 1, sm: 2, md: 3, lg: 3, xl: 3, xxl: 3 }}
      items={[
        { key: 'id', label: 'TID/SID', children: trainer.id },
        {
          key: 'name',
          label: t('trainer.name'),
          children: (
            <Input
              value={name ?? trainer.name}
              onChange={(event) => setNameDraft(event.target.value)}
              onBlur={commitName}
              onPressEnter={commitName}
              maxLength={trainer.maxNameLength}
              placeholder={t('trainer.name')}
              style={{ width: '100%', maxWidth: 170 }}
            />
          ),
        },
        ...(trainer.gender === null
          ? []
          : [
              {
                key: 'gender',
                label: t('trainer.gender'),
                children: (
                  <TrainerGenderRadio value={trainer.gender} onChange={(gender) => edit(() => setGender(gender))} />
                ),
              },
            ]),
        {
          key: 'cash',
          label: t('trainer.cash'),
          children: (
            <Space.Compact style={{ width: '100%', maxWidth: 220 }}>
              <InputNumber<number>
                aria-label={t('trainer.cash')}
                value={money.value ?? 0}
                onChange={money.onChange}
                onBlur={money.onBlur}
                formatter={(value) => `$ ${value}`}
                parser={(value) => Number(value?.replace(/\$\s?/g, ''))}
                disabled={trainer.money === null}
                min={0}
                max={maxMoney}
                precision={0}
                style={{ width: '100%' }}
              />
              <Button
                disabled={trainer.money === null}
                onClick={() => void edit(() => setMoney(maxMoney))}
                title={t('trainer.maxCash', 'Maximizar Dinheiro')}
              >
                MAX
              </Button>
            </Space.Compact>
          ),
        },
        ...(trainer.battlePoints === null
          ? []
          : [
              {
                key: 'battlePoints',
                label: t('trainer.battlePoints'),
                children: (
                  <Space.Compact style={{ width: '100%', maxWidth: 220 }}>
                    <InputNumber<number>
                      aria-label={t('trainer.battlePoints')}
                      value={battlePoints.value}
                      onChange={battlePoints.onChange}
                      onBlur={battlePoints.onBlur}
                      min={0}
                      max={maxBattlePoints}
                      precision={0}
                      style={{ width: '100%' }}
                    />
                    <Button
                      onClick={() => void edit(() => setBattlePoints(maxBattlePoints))}
                      title={t('trainer.maxBp', 'Maximizar Battle Points')}
                    >
                      MAX
                    </Button>
                  </Space.Compact>
                ),
              },
            ]),
        { key: 'rival', label: t('home.rival', 'Rival'), children: trainer.rival },
      ]}
    />
  )
}


// The input shows its own value while focused, so an edit's refetch can't overwrite keystrokes that came after it.
function useDraft<T>(value: T, commit: (next: T) => unknown) {
  const [draft, setDraft] = useState<{ value: T } | null>(null)
  return {
    value: draft ? draft.value : value,
    onChange: (next: T) => {
      setDraft({ value: next })
      commit(next)
    },
    onBlur: () => setDraft(null),
  }
}

function useTrainerEdit() {
  const { t } = useTranslation()
  const { notification } = App.useApp()

  return async (edit: () => Promise<void>) => {
    try {
      await edit()
    } catch (error) {
      if (!(error instanceof EngineError) || (error.code !== 'out-of-range' && error.code !== 'not-in-game')) throw error
      notification.error({ title: t('home.changeTrainerError', "Couldn't change the trainer"), description: error.message })
    }
  }
}
