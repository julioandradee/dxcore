import { useState } from 'react'
import { DownOutlined, UpOutlined, WarningOutlined } from '@ant-design/icons'
import { Alert, Button, Flex, Space, Tag, Typography } from 'antd'
import type { Legality } from '@pkhex-everywhere/engine'
import { useTranslation } from '../../i18n'

interface LegalityBannerProps {
  legality: Legality
}

export function LegalityBanner({ legality }: LegalityBannerProps) {
  const { t } = useTranslation()
  const [showDetails, setShowDetails] = useState(false)

  if (!legality || legality.messages.length === 0) return null

  const formatMessage = (msg: string) => {
    const lower = msg.toLowerCase()
    if (lower.includes('pid') || lower.includes('correlation')) {
      return {
        tag: 'PID / Natureza',
        color: 'orange',
        friendly: t(
          'legality.pidIvMismatch',
          'A combinação de Natureza, PID e IVs difere da semente matemática original do encontro selvagem.',
        ),
        raw: msg,
      }
    }
    if (lower.includes('move')) {
      return {
        tag: 'Golpes',
        color: 'blue',
        friendly: t(
          'legality.movesMismatch',
          'Um ou mais movimentos não são aprendidos naturalmente por este método de encontro.',
        ),
        raw: msg,
      }
    }
    if (lower.includes('encounter')) {
      return {
        tag: 'Encontro',
        color: 'cyan',
        friendly: t(
          'legality.encounterMismatch',
          'Os dados do encontro (local, nível ou método) não correspondem à tabela original do jogo.',
        ),
        raw: msg,
      }
    }
    if (lower.includes('ability')) {
      return {
        tag: 'Habilidade',
        color: 'purple',
        friendly: t(
          'legality.abilityMismatch',
          'A habilidade atribuída difere da permitida para o slot deste encontro.',
        ),
        raw: msg,
      }
    }
    return {
      tag: 'Legitimidade',
      color: 'default',
      friendly: msg,
      raw: msg,
    }
  }

  return (
    <Alert
      key={legality.messages.join('\n')}
      type="warning"
      showIcon
      icon={<WarningOutlined style={{ color: '#d97706', fontSize: 18 }} />}
      closable
      style={{
        borderRadius: 8,
        border: '1px solid #fde68a',
        backgroundColor: '#fffbeb',
      }}
      title={
        <span style={{ fontWeight: 600, color: '#92400e', fontSize: 14 }}>
          {t('legality.title', 'Aviso de Legitimidade (Modificação Detectada)')}
        </span>
      }
      description={
        <Flex vertical gap={8} style={{ marginTop: 4 }}>
          <Typography.Text style={{ color: '#78350f', fontSize: 13, lineHeight: '1.45' }}>
            {t(
              'legality.desc',
              'Este Pokémon possui modificações que diferem dos parâmetros originais de captura. Ele funciona e batalha normalmente no jogo offline e em emuladores, mas pode não ser aceito em transferências online oficiais (Pokémon HOME) ou torneios competitivos da Nintendo.',
            )}
          </Typography.Text>

          <div>
            <Button
              type="link"
              size="small"
              onClick={() => setShowDetails((prev) => !prev)}
              style={{ padding: 0, height: 'auto', fontSize: 12, color: '#b45309', fontWeight: 500 }}
            >
              <Space size={4}>
                <span>{t('legality.details', 'Detalhes técnicos da auditoria')}</span>
                {showDetails ? <UpOutlined style={{ fontSize: 10 }} /> : <DownOutlined style={{ fontSize: 10 }} />}
              </Space>
            </Button>

            {showDetails && (
              <Flex vertical gap={6} style={{ marginTop: 8, paddingLeft: 4 }}>
                {legality.messages.map((message, index) => {
                  const info = formatMessage(message)
                  return (
                    <div
                      key={index}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 6,
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        border: '1px solid #fef3c7',
                        fontSize: 12,
                      }}
                    >
                      <Space size={8} wrap align="start">
                        <Tag color={info.color} style={{ margin: 0, fontSize: 11, padding: '0 6px' }}>
                          {info.tag}
                        </Tag>
                        <span style={{ color: '#451a03', fontWeight: 500 }}>{info.friendly}</span>
                      </Space>
                      {info.raw !== info.friendly && (
                        <div style={{ fontSize: 11, color: '#92400e', marginTop: 2, fontFamily: 'monospace' }}>
                          {info.raw}
                        </div>
                      )}
                    </div>
                  )
                })}
              </Flex>
            )}
          </div>
        </Flex>
      }
    />
  )
}
