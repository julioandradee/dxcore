import type { ReactNode } from 'react'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Flex, Space, Typography } from 'antd'

interface PageHeaderProps {
  title?: ReactNode
  extra?: ReactNode
  showBack?: boolean
  onBack?: () => void
}

export function PageHeader({ title, extra, showBack = false, onBack }: PageHeaderProps) {
  const shouldShowBack = showBack || Boolean(onBack)

  return (
    <Flex justify="space-between" align="center" wrap="wrap" gap="small" style={{ width: '100%' }}>
      <Flex align="center" gap={8} wrap="wrap" style={{ minWidth: 0, flexShrink: 0 }}>
        {shouldShowBack && (
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            aria-label="Back"
            onClick={onBack ?? (() => history.back())}
          />
        )}
        {title && (
          <Typography.Title level={4} style={{ margin: 0, minWidth: 0 }}>
            {title}
          </Typography.Title>
        )}
      </Flex>
      {extra && <Flex align="center" gap={8} wrap="wrap">{extra}</Flex>}
    </Flex>
  )
}
