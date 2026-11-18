import { useMemo, useState } from 'react'
import { Alert, App, Button, Flex, Modal, Progress, Radio, Space, Tag, Typography } from 'antd'
import { call, type BoxEntry, type PokemonSummary } from '@pkhex-everywhere/engine'
import { useBox, useEngine, useQuery } from '@pkhex-everywhere/react'
import { useTranslation } from '../../i18n'

interface MoveToBoxModalProps {
  open: boolean
  selected: PokemonSummary[]
  onClose: () => void
  onSuccess: () => void
}

export function MoveToBoxModal({ open, selected, onClose, onSuccess }: MoveToBoxModalProps) {
  const { box, moveToBox } = useBox()
  const engine = useEngine()
  const boxList = useQuery('box.list') ?? []
  const { notification } = App.useApp()
  const { t } = useTranslation()
  const [targetBox, setTargetBox] = useState<number | null>(null)
  const [moving, setMoving] = useState(false)

  // Calculate box statistics
  const boxStats = useMemo(() => {
    return boxList.map((b: BoxEntry) => {
      const occupied = box.filter((p) => p.at.box === b.box).length
      const freeSlots = Math.max(0, b.slots - occupied)
      const selectedInBox = selected.filter((p) => p.at.box === b.box).length
      const netToMove = selected.length - selectedInBox
      const canFit = freeSlots >= netToMove && netToMove > 0
      const isCurrent = selectedInBox === selected.length
      const displayName = b.name && b.name.trim().length > 0 ? b.name : `${t('box.boxLabel', 'Caixa')} ${b.box + 1}`

      return {
        ...b,
        displayName,
        occupied,
        freeSlots,
        selectedInBox,
        netToMove,
        canFit,
        isCurrent,
      }
    })
  }, [boxList, box, selected, t])

  const selectedStats = useMemo(() => {
    if (targetBox === null) return null
    return boxStats.find((b) => b.box === targetBox) ?? null
  }, [boxStats, targetBox])

  const handleMove = async () => {
    if (targetBox === null || !selectedStats || !selectedStats.canFit || moving) return
    setMoving(true)
    try {
      const handles = selected.map((p) => p.at)
      if (typeof moveToBox === 'function') {
        await moveToBox(handles, targetBox)
      } else if (typeof engine.box?.moveToBox === 'function') {
        await engine.box.moveToBox(handles, targetBox)
      } else {
        await call(engine, 'box.moveToBox', [handles, targetBox])
      }
      notification.success({
        title: t('box.moveSuccessTitle', 'Pokémon movidos com sucesso!'),
        description: t(
          'box.moveSuccessDesc',
          '{0} Pokémon transferidos para a {1}.',
        )
          .replace('{0}', String(selectedStats.netToMove))
          .replace('{1}', selectedStats.displayName),
      })
      onSuccess()
    } catch (err: unknown) {
      notification.error({
        title: t('box.moveErrorTitle', 'Erro ao mover Pokémon'),
        description: String((err as { message?: string })?.message || err),
      })
    } finally {
      setMoving(false)
    }
  }

  return (
    <Modal
      open={open}
      title={
        <Space align="center">
          <span>{t('box.moveModalTitle', 'Mover Pokémon para outra Caixa')}</span>
          <Tag color="blue">
            {selected.length === 1
              ? t('box.oneSelected', '1 Pokémon selecionado')
              : `${selected.length} ${t('box.multipleSelected', 'Pokémon selecionados')}`}
          </Tag>
        </Space>
      }
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={moving}>
          {t('actions.cancel', 'Cancelar')}
        </Button>,
        <Button
          key="confirm"
          type="primary"
          loading={moving}
          disabled={!selectedStats || !selectedStats.canFit || moving}
          onClick={() => void handleMove()}
        >
          {t('box.confirmMove', 'Confirmar Transferência')}
        </Button>,
      ]}
      width={600}
    >
      <Flex vertical gap={16} style={{ marginTop: 12 }}>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          {t(
            'box.moveModalDescription',
            'Selecione a caixa de destino. As caixas são validadas de acordo com o limite de capacidade ({0} slots) do jogo para proteger o save de corrupção.',
          ).replace('{0}', String(boxList[0]?.slots ?? 30))}
        </Typography.Paragraph>

        <div style={{ maxHeight: '320px', overflowY: 'auto', paddingRight: 6 }}>
          <Radio.Group
            value={targetBox}
            onChange={(e) => setTargetBox(e.target.value as number)}
            style={{ width: '100%' }}
          >
            <Flex vertical gap={10}>
              {boxStats.map((b) => {
                const percent = Math.min(100, Math.round((b.occupied / b.slots) * 100))
                const isSelectedBox = targetBox === b.box

                return (
                  <div
                    key={b.box}
                    onClick={() => {
                      if (!b.isCurrent && (b.canFit || b.freeSlots > 0)) {
                        setTargetBox(b.box)
                      }
                    }}
                    style={{
                      border: isSelectedBox ? '2px solid #DC0A2D' : '1px solid #d9d9d9',
                      borderRadius: 8,
                      padding: '10px 14px',
                      background: isSelectedBox ? 'rgba(220, 10, 45, 0.08)' : '#fafafa',
                      cursor: b.isCurrent ? 'default' : 'pointer',
                      opacity: b.isCurrent ? 0.6 : 1,
                      transition: 'all 0.2s',
                    }}
                  >
                    <Flex align="center" justify="space-between" wrap="wrap" gap={8}>
                      <Space>
                        <Radio value={b.box} disabled={b.isCurrent || !b.canFit} />
                        <Typography.Text strong style={{ fontSize: 15 }}>
                          {b.displayName}
                        </Typography.Text>
                      </Space>

                      <Space>
                        {b.isCurrent && <Tag color="default">{t('box.currentBox', 'Caixa Atual')}</Tag>}
                        {b.freeSlots === 0 && <Tag color="error">{t('box.full', 'Lotada (0 vagas)')}</Tag>}
                        {b.freeSlots > 0 && !b.canFit && !b.isCurrent && (
                          <Tag color="warning">
                            {t('box.insufficient', 'Sem vagas ({0} livres)').replace('{0}', String(b.freeSlots))}
                          </Tag>
                        )}
                        {b.canFit && !b.isCurrent && (
                          <Tag color="success">
                            {t('box.freeSlots', '{0} vagas livres').replace('{0}', String(b.freeSlots))}
                          </Tag>
                        )}
                        <span style={{ fontSize: 13, color: '#8c8c8c' }}>
                          {b.occupied} / {b.slots}
                        </span>
                      </Space>
                    </Flex>

                    <Progress
                      percent={percent}
                      size="small"
                      status={b.freeSlots === 0 ? 'exception' : percent >= 80 ? 'active' : 'normal'}
                      showInfo={false}
                      style={{ marginTop: 6, marginBottom: 0 }}
                    />
                  </div>
                )
              })}
            </Flex>
          </Radio.Group>
        </div>

        {selectedStats && (
          <div>
            {selectedStats.isCurrent ? (
              <Alert
                type="info"
                showIcon
                title={t('box.allSelectedAlreadyInBox', 'Todos os Pokémon selecionados já estão nesta caixa.')}
              />
            ) : !selectedStats.canFit ? (
              <Alert
                type="error"
                showIcon
                title={t('box.capacityExceededTitle', 'Capacidade da caixa excedida!')}
                description={t(
                  'box.capacityExceededDesc',
                  'A {0} possui apenas {1} vaga(s) livre(s), mas foram selecionados {2} Pokémon. A transferência foi bloqueada para proteger o save de corrupção.',
                )
                  .replace('{0}', selectedStats.displayName)
                  .replace('{1}', String(selectedStats.freeSlots))
                  .replace('{2}', String(selectedStats.netToMove))}
              />
            ) : (
              <Alert
                type="success"
                showIcon
                title={t('box.readyToMoveTitle', 'Pronto para transferir')}
                description={t(
                  'box.readyToMoveDesc',
                  'Serão transferidos {0} Pokémon para a {1}. A caixa ficará com {2} / {3} Pokémon após a operação.',
                )
                  .replace('{0}', String(selectedStats.netToMove))
                  .replace('{1}', selectedStats.displayName)
                  .replace('{2}', String(selectedStats.occupied + selectedStats.netToMove))
                  .replace('{3}', String(selectedStats.slots))}
              />
            )}
          </div>
        )}
      </Flex>
    </Modal>
  )
}
