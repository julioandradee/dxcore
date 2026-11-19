import type { ReactNode } from 'react'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Flex, Space, Typography } from 'antd'

interface PageHeaderProps {
  title?: ReactNode
  extra?: ReactNode
}

export function PageHeader({ title, extra }: PageHeaderProps) {
  return (
    <Flex justify="space-between" align="center" wrap="wrap" gap="small" style={{ width: '100%' }}>
      <Flex align="center" gap={8} wrap="wrap" style={{ minWidth: 0, flexShrink: 0 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} aria-label="Back" onClick={() => history.back()} />
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
