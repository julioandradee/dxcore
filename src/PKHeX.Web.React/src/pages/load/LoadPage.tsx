import { Suspense, useRef, useState, type ChangeEvent, type CSSProperties } from 'react'
import { EllipsisOutlined, ExportOutlined, FolderOpenOutlined, HistoryOutlined } from '@ant-design/icons'
import { Badge, Button, Descriptions, Dropdown, Flex, Modal, Space, type ButtonProps } from 'antd'
import type { SaveSummary } from '@pkhex-everywhere/engine'
import { useEngine, useLoadedGame, useQuery } from '@pkhex-everywhere/react'
import { gameName } from '../../capabilities'
import { downloadFile } from '../../host'
import { useTranslation } from '../../i18n'
import { SaveBackupModal } from '../../snapshots/SaveBackupModal'
import { FormatPickerModal } from './FormatPickerModal'
import { LoadRomHackModal } from './LoadRomHackModal'
import { PkhemuCard } from './PkhemuCard'
import { SaveFileDrop } from './SaveFileDrop'
import { cardGeneration } from './pkhemuInvite'
import { showRomHacksBadge } from './romHacksBadge'
import { useLoadSave } from './useLoadSave'

const swordVersionId = 44

export default function LoadPage() {
  const { game } = useLoadedGame()
  const { openFile, openDemo, formatChoice, chooseFormat, cancelFormatChoice } = useLoadSave()
  const fileInput = useRef<HTMLInputElement>(null)
  const [backupModalOpen, setBackupModalOpen] = useState(false)
  const [demoConfirmOpen, setDemoConfirmOpen] = useState(false)
  const { t } = useTranslation()

  const openFilePicker = () => fileInput.current?.click()

  const loadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) await openFile(file)
  }

  return (
    <SaveFileDrop onOpen={openFile}>
      <Flex vertical align="center" gap={20} style={{ width: '100%', padding: '10px 0' }}>
        {game ? (
          <LoadedGame
            key={`${game.fileName}|${game.version}|${game.format?.id}`}
            game={game}
            onOpen={openFilePicker}
            onDemo={() => setDemoConfirmOpen(true)}
            onOpenBackups={() => setBackupModalOpen(true)}
          />
        ) : (
          <NoGame
            onOpen={openFilePicker}
            onDemo={() => setDemoConfirmOpen(true)}
            onOpenBackups={() => setBackupModalOpen(true)}
          />
        )}
        <input ref={fileInput} type="file" hidden onChange={loadFile} />
        {formatChoice && <FormatPickerModal choice={formatChoice} onChoose={chooseFormat} onCancel={cancelFormatChoice} />}
        <SaveBackupModal open={backupModalOpen} onClose={() => setBackupModalOpen(false)} />

        <Modal
          open={demoConfirmOpen}
          onCancel={() => setDemoConfirmOpen(false)}
          onOk={async () => {
            setDemoConfirmOpen(false)
            await openDemo()
          }}
          okText={t('load.confirmLoadDemo', 'Carregar Demonstração')}
          cancelText={t('common.cancel', 'Cancelar')}
          title={t('load.demoConfirmTitle', 'Carregar Save de Demonstração?')}
          centered
        >
          <p style={{ marginTop: 12, lineHeight: 1.6 }}>
            {game
              ? t(
                  'load.demoConfirmWithGame',
                  'Você já possui um save carregado. Carregar o save de demonstração do Pokémon Emerald (GBA) substituirá os dados atuais da sessão. Se desejar guardar sua partida, exporte ou crie um backup antes. Deseja continuar?',
                )
              : t(
                  'load.demoConfirmNoGame',
                  'Ainda não há nenhum save carregado no sistema. Deseja carregar o save de demonstração do Pokémon Emerald (GBA) para explorar e testar todas as funções do DXCore?',
                )}
          </p>
        </Modal>
      </Flex>
    </SaveFileDrop>
  )
}

function LoadedGame({
  game,
  onOpen,
  onDemo,
  onOpenBackups,
}: {
  game: SaveSummary
  onOpen: () => void
  onDemo: () => void
  onOpenBackups: () => void
}) {
  const { t } = useTranslation()
  const engine = useEngine()
  const [exported, setExported] = useState(false)
  const versions = useQuery('game.blankVersions')

  const exportSave = async () => {
    const { bytes, fileName } = await engine.game.export()
    downloadFile(bytes, fileName)
    setExported(true)
  }

  return (
    <>
      <Descriptions
        title={t('load.loadedGame')}
        bordered
        size="small"
        layout="vertical"
        style={{ width: '100%' }}
        items={[
          { key: 'file', label: t('trainer.file'), children: game.fileName },
          { key: 'version', label: t('load.version', 'Version'), children: gameName(game) },
        ]}
      />
      <Flex vertical gap={12} style={{ width: '100%', maxWidth: 300 }}>
        <Button
          type="primary"
          icon={<ExportOutlined aria-hidden />}
          onClick={exportSave}
          style={{ width: '100%', height: 40 }}
        >
          {t('load.export')}
        </Button>
        <Button
          icon={<HistoryOutlined />}
          onClick={onOpenBackups}
          style={{ width: '100%', height: 40 }}
        >
          {t('backup.title', 'Histórico e Backups')}
        </Button>
        {exported && <PkhemuCard generation={cardGeneration(game)} onClose={() => setExported(false)} />}
        <OpenButton label={t('load.openNew')} onOpen={onOpen} style={{ width: '100%', height: 40 }} />
        <Space.Compact style={{ width: '100%', height: 40 }}>
          <Button
            style={{ flexGrow: 1, height: 40 }}
            onClick={() => engine.game.loadBlank(swordVersionId)}
          >
            {t('load.empty')}
          </Button>
          <Dropdown
            trigger={['click']}
            menu={{
              items: versions.map((version) => ({ key: version.id, label: version.name })),
              onClick: ({ key }) => engine.game.loadBlank(Number(key)),
              style: { maxHeight: 250, overflowY: 'auto' },
            }}
          >
            <Button icon={<EllipsisOutlined />} style={{ height: 40 }} aria-label="Empty save versions" />
          </Dropdown>
        </Space.Compact>
        <Button style={{ width: '100%', height: 40 }} onClick={onDemo}>
          {t('load.demo')}
        </Button>
      </Flex>
    </>
  )
}

function NoGame({
  onOpen,
  onDemo,
  onOpenBackups,
}: {
  onOpen: () => void
  onDemo: () => void
  onOpenBackups: () => void
}) {
  const { t } = useTranslation()
  const engine = useEngine()
  const versions = useQuery('game.blankVersions')

  return (
    <Flex vertical align="center" gap={12} style={{ width: '100%', maxWidth: 300 }}>
      <OpenButton label={t('actions.load')} type="primary" style={{ width: '100%', height: 40 }} onOpen={onOpen} />
      <Space.Compact style={{ width: '100%', height: 40 }}>
        <Button style={{ flexGrow: 1, height: 40 }} onClick={() => engine.game.loadBlank(swordVersionId)}>
          {t('load.empty')}
        </Button>
        <Dropdown
          trigger={['click']}
          menu={{
            items: versions.map((version) => ({ key: version.id, label: version.name })),
            onClick: ({ key }) => engine.game.loadBlank(Number(key)),
            style: { maxHeight: 250, overflowY: 'auto' },
          }}
        >
          <Button icon={<EllipsisOutlined />} style={{ height: 40 }} aria-label="Empty save versions" />
        </Dropdown>
      </Space.Compact>
      <Button style={{ width: '100%', height: 40 }} icon={<HistoryOutlined />} onClick={onOpenBackups}>
        {t('backup.title', 'Histórico e Backups')}
      </Button>
      <Button style={{ width: '100%', height: 40 }} onClick={onDemo}>
        {t('load.demo')}
      </Button>
    </Flex>
  )
}

interface OpenButtonProps {
  label: string
  type?: ButtonProps['type']
  style?: CSSProperties
  onOpen: () => void
}

function OpenButton({ label, type, style, onOpen }: OpenButtonProps) {
  const { t } = useTranslation()
  const [loadingRomHack, setLoadingRomHack] = useState(false)

  const buttons = (
    <Space.Compact style={{ width: '100%', height: 40, ...style }}>
      <Button type={type} icon={<FolderOpenOutlined aria-hidden />} style={{ flexGrow: 1, height: 40 }} onClick={onOpen}>
        {label}
      </Button>
      <Dropdown
        trigger={['click']}
        menu={{
          items: [
            { key: 'open', label: t('load.openSaveFile') },
            { key: 'romHack', label: t('load.loadRomHack') },
          ],
          onClick: ({ key }) => (key === 'romHack' ? setLoadingRomHack(true) : onOpen()),
        }}
      >
        <Button type={type} icon={<EllipsisOutlined />} style={{ height: 40 }} aria-label="More ways to open" />
      </Dropdown>
    </Space.Compact>
  )

  return (
    <>
      {showRomHacksBadge(new Date()) ? (
        <Badge
          count={t('load.romHacks.newBadge', 'New')}
          size="small"
          color="yellow"
          // antd sets the badge to width: fit-content, and Space.Compact items to z-index 2-4.
          styles={{
            root: { display: 'flex', flexDirection: 'column', width: 'auto' },
            indicator: { zIndex: 5, color: 'rgba(0, 0, 0, 0.88)' },
          }}
        >
          {buttons}
        </Badge>
      ) : (
        buttons
      )}
      {loadingRomHack && (
        <Suspense fallback={null}>
          <LoadRomHackModal onClose={() => setLoadingRomHack(false)} />
        </Suspense>
      )}
    </>
  )
}
