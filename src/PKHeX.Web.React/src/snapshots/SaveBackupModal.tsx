import { useState } from 'react'
import {
  CloudDownloadOutlined,
  DeleteOutlined,
  HistoryOutlined,
  PlusOutlined,
  RollbackOutlined,
} from '@ant-design/icons'
import { App, Button, Empty, Flex, Modal, Popconfirm, Space, Table, Tag, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import { useEngine, useLoadedGame } from '@pkhex-everywhere/react'
import { gameName } from '../capabilities'
import { downloadFile } from '../host'
import { useTranslation } from '../i18n'
import {
  clearAllSnapshots,
  createSnapshot,
  deleteSnapshot,
  listSnapshots,
  restoreSnapshotBytes,
  type SaveSnapshot,
} from './saveSnapshots'

interface SaveBackupModalProps {
  open: boolean
  onClose: () => void
}

export function SaveBackupModal({ open, onClose }: SaveBackupModalProps) {
  if (!open) return null
  return <SaveBackupModalContent onClose={onClose} />
}

function SaveBackupModalContent({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const engine = useEngine()
  const { game } = useLoadedGame()
  const { notification } = App.useApp()

  const [snapshots, setSnapshots] = useState<SaveSnapshot[]>(() => listSnapshots())
  const [creating, setCreating] = useState(false)
  const [restoring, setRestoring] = useState(false)

  const reloadSnapshots = () => setSnapshots(listSnapshots())

  const handleCreateSnapshot = async () => {
    if (!game) return
    setCreating(true)
    try {
      const exported = await engine.game.export()
      const trainerData = await engine.trainer.get().catch(() => null)
      await createSnapshot({
        fileName: exported.fileName || game.fileName || 'pokemon_save.sav',
        versionName: gameName(game),
        trainerName: trainerData?.name || undefined,
        bytes: exported.bytes,
      })
      reloadSnapshots()
      notification.success({
        message: t('backup.createdSuccess', 'Backup criado com sucesso!'),
        description: t('backup.createdDesc', 'Ponto de restauração salvo na memória local.'),
      })
    } catch (e) {
      notification.error({
        message: t('backup.createError', 'Erro ao criar backup'),
        description: String(e),
      })
    } finally {
      setCreating(false)
    }
  }

  const handleRestore = async (snapshot: SaveSnapshot) => {
    setRestoring(true)
    try {
      const bytes = restoreSnapshotBytes(snapshot)
      await engine.game.load(bytes, snapshot.fileName)
      notification.success({
        message: t('backup.restoredSuccess', 'Save restaurado com sucesso!'),
        description: `${snapshot.fileName} (${snapshot.versionName})`,
      })
      onClose()
    } catch (e) {
      notification.error({
        message: t('backup.restoreError', 'Falha ao restaurar save'),
        description: String(e),
      })
    } finally {
      setRestoring(false)
    }
  }

  const handleDownload = (snapshot: SaveSnapshot) => {
    const bytes = restoreSnapshotBytes(snapshot)
    downloadFile(bytes as Uint8Array<ArrayBuffer>, snapshot.fileName)
  }

  const handleDelete = (id: string) => {
    deleteSnapshot(id)
    reloadSnapshots()
  }

  const handleClearAll = () => {
    clearAllSnapshots()
    reloadSnapshots()
  }

  const columns: TableColumnsType<SaveSnapshot> = [
    {
      title: t('backup.date', 'Data / Hora'),
      dataIndex: 'date',
      key: 'date',
      render: (dateStr: string) => {
        const d = new Date(dateStr)
        return (
          <Flex vertical>
            <span style={{ fontWeight: 600 }}>{d.toLocaleDateString()}</span>
            <span style={{ fontSize: '0.8em', color: '#8c8c8c' }}>{d.toLocaleTimeString()}</span>
          </Flex>
        )
      },
    },
    {
      title: t('backup.fileInfo', 'Arquivo / Jogo'),
      key: 'info',
      render: (_, s) => (
        <Flex vertical gap={2}>
          <span style={{ fontWeight: 600 }}>{s.fileName}</span>
          <Flex gap={4} wrap="wrap">
            <Tag color="blue">{s.versionName}</Tag>
            {s.trainerName && <Tag color="purple">{s.trainerName}</Tag>}
            <Tag>{Math.round(s.sizeBytes / 1024)} KB</Tag>
          </Flex>
        </Flex>
      ),
    },
    {
      title: t('table.action', 'Ações'),
      key: 'action',
      render: (_, s) => (
        <Space size="small">
          <Popconfirm
            title={t('backup.confirmRestore', 'Restaurar este backup?')}
            description={t('backup.confirmRestoreDesc', 'As alterações não salvas no save atual serão substituídas.')}
            onConfirm={() => void handleRestore(s)}
            okText={t('common.yes', 'Sim')}
            cancelText={t('common.no', 'Não')}
          >
            <Button size="small" type="primary" icon={<RollbackOutlined />}>
              {t('backup.restore', 'Restaurar')}
            </Button>
          </Popconfirm>
          <Button
            size="small"
            icon={<CloudDownloadOutlined />}
            onClick={() => handleDownload(s)}
            title={t('backup.download', 'Baixar arquivo')}
          />
          <Popconfirm
            title={t('backup.confirmDelete', 'Excluir este backup?')}
            onConfirm={() => handleDelete(s.id)}
            okText={t('common.yes', 'Sim')}
            cancelText={t('common.no', 'Não')}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Modal
      open
      onCancel={onClose}
      width={720}
      title={
        <Flex align="center" gap={8}>
          <HistoryOutlined style={{ color: '#1677ff' }} />
          <span>{t('backup.title', 'Histórico e Backups')}</span>
        </Flex>
      }
      footer={[
        <Button key="close" onClick={onClose}>
          {t('common.close', 'Fechar')}
        </Button>,
      ]}
    >
      <Flex vertical gap={16} style={{ marginTop: 12 }}>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          {t(
            'backup.description',
            'Crie pontos de restauração antes de editar seus Pokémon. Os backups ficam salvos de forma segura no seu navegador para você nunca perder seu progresso.',
          )}
        </Typography.Paragraph>

        <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            disabled={!game}
            loading={creating}
            onClick={() => void handleCreateSnapshot()}
          >
            {t('backup.createNow', 'Criar Backup do Save Atual')}
          </Button>

          {snapshots.length > 0 && (
            <Popconfirm
              title={t('backup.confirmClearAll', 'Limpar todos os backups gravados?')}
              onConfirm={handleClearAll}
              okText={t('common.yes', 'Sim')}
              cancelText={t('common.no', 'Não')}
            >
              <Button danger size="small">
                {t('backup.clearAll', 'Limpar Histórico')}
              </Button>
            </Popconfirm>
          )}
        </Flex>

        {snapshots.length === 0 ? (
          <Empty
            description={t('backup.noSnapshots', 'Nenhum ponto de restauração gravado ainda.')}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Table<SaveSnapshot>
            rowKey="id"
            dataSource={snapshots}
            columns={columns}
            size="small"
            pagination={{ pageSize: 5 }}
            loading={restoring}
          />
        )}
      </Flex>
    </Modal>
  )
}
