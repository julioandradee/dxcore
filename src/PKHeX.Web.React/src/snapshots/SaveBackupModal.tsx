import { useState } from 'react'
import {
  CloudDownloadOutlined,
  DeleteOutlined,
  HistoryOutlined,
  PlusOutlined,
  RollbackOutlined,
} from '@ant-design/icons'
import { App, Button, Card, Empty, Flex, Modal, Popconfirm, Space, Spin, Tag, Typography } from 'antd'
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
          <Spin spinning={restoring}>
            <Flex vertical gap={10} style={{ maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
              {snapshots.map((s) => {
                const d = new Date(s.date)
                return (
                  <Card
                    key={s.id}
                    size="small"
                    style={{
                      borderRadius: 8,
                    }}
                  >
                    <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
                      {/* Metadados e Identificação do Save */}
                      <Flex vertical gap={6} style={{ flex: '1 1 240px', minWidth: 0 }}>
                        <Flex align="center" gap={8} wrap="wrap">
                          <Typography.Text strong style={{ fontSize: 14 }}>
                            {s.fileName}
                          </Typography.Text>
                          <Tag color="blue" style={{ margin: 0 }}>
                            {s.versionName}
                          </Tag>
                          {s.trainerName && (
                            <Tag color="purple" style={{ margin: 0 }}>
                              👤 {s.trainerName}
                            </Tag>
                          )}
                        </Flex>

                        <Flex align="center" gap={12} wrap="wrap" style={{ fontSize: 12, color: '#8c8c8c' }}>
                          <span>
                            📅 {d.toLocaleDateString()} · ⏰ {d.toLocaleTimeString()}
                          </span>
                          <span>💾 {Math.round(s.sizeBytes / 1024)} KB</span>
                        </Flex>
                      </Flex>

                      {/* Ações em Cada Card */}
                      <Space size="small" wrap style={{ flexShrink: 0 }}>
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
                          title={t('backup.download', '')}
                        >
                          {t('backup.download', 'Baixar')}
                        </Button>
                        <Popconfirm
                          title={t('backup.confirmDelete', 'Excluir este backup?')}
                          onConfirm={() => handleDelete(s.id)}
                          okText={t('common.yes', 'Sim')}
                          cancelText={t('common.no', 'Não')}
                        >
                          <Button size="small" danger icon={<DeleteOutlined />} aria-label={t('common.delete', 'Excluir')} />
                        </Popconfirm>
                      </Space>
                    </Flex>
                  </Card>
                )
              })}
            </Flex>
          </Spin>
        )}
      </Flex>
    </Modal>
  )
}
