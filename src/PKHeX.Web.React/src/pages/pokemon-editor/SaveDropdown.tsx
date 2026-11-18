import { EllipsisOutlined } from '@ant-design/icons'
import { Button, Dropdown, Space } from 'antd'
import { draftHandle } from '@pkhex-everywhere/engine'
import { useEngine } from '@pkhex-everywhere/react'
import { downloadFile } from '../../host'
import { useTranslation } from '../../i18n'

interface SaveDropdownProps {
  onSave: () => void
}

export function SaveDropdown({ onSave }: SaveDropdownProps) {
  const { t } = useTranslation()
  const engine = useEngine()

  const exportFile = async () => {
    const { bytes, fileName } = await engine.pokemon.export(draftHandle)
    downloadFile(bytes, fileName)
  }

  return (
    <Space.Compact>
      <Button type="primary" onClick={onSave}>
        {t('actions.save')}
      </Button>
      <Dropdown
        trigger={['click']}
        menu={{
          items: [
            { key: 'export', label: t('editor.exportPk'), onClick: () => void exportFile() },
          ],
        }}
      >
        <Button type="primary" icon={<EllipsisOutlined />} aria-label={t('editor.moreActions')} />
      </Dropdown>
    </Space.Compact>
  )
}
