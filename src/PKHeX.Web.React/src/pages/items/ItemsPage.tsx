import { useMemo, useState } from 'react'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Flex, Input, Tabs, Tag } from 'antd'
import type { ItemHandle } from '@pkhex-everywhere/engine'
import { useInventory } from '@pkhex-everywhere/react'
import { ItemsTable } from '../../components/ItemsTable'
import { PageHeader } from '../../components/PageHeader'
import { useTranslation } from '../../i18n'
import { AddItemModal } from './AddItemModal'
import { EditItemModal } from './EditItemModal'

export default function ItemsPage() {
  const { t } = useTranslation()
  const { inventory } = useInventory()
  const [activeKey, setActiveKey] = useState<string>()
  const [editing, setEditing] = useState<ItemHandle>()
  const [addingTo, setAddingTo] = useState<string>()
  const [search, setSearch] = useState('')

  const active = inventory.find((pouch) => pouch.name === activeKey) ?? inventory[0]
  const findPouch = (name?: string) => inventory.find((pouch) => pouch.name === name)
  const editingItem = findPouch(editing?.pouch)?.items.find((item) => item.id === editing?.itemId)
  const addingPouch = findPouch(addingTo)

  const filteredItems = useMemo(() => {
    if (!active) return []
    const q = search.trim().toLowerCase()
    if (!q) return active.items
    return active.items.filter((item) => item.name.toLowerCase().includes(q))
  }, [active, search])

  return (
    <Flex vertical gap={20}>
      <PageHeader
        title={
          <Flex align="center" gap={12}>
            <span>{t('items.title')}</span>
            {active && <Tag color="blue">{active.items.length} itens</Tag>}
          </Flex>
        }
        extra={
          <Flex align="center" gap={10} wrap="wrap">
            <Input
              prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
              placeholder={t('items.searchPlaceholder', 'Buscar item...')}
              allowClear
              style={{ width: 180 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              disabled={!active || !active.addable || active.addable.length === 0}
              onClick={() => setAddingTo(active?.name)}
            >
              {t('actions.add')}
            </Button>
          </Flex>
        }
      />
      <Tabs
        activeKey={active?.name}
        onChange={(k) => {
          setActiveKey(k)
          setSearch('')
        }}
        items={inventory.map((pouch) => ({
          key: pouch.name,
          label: (
            <span>
              {pouch.name} ({pouch.items.length})
            </span>
          ),
          children: (
            <ItemsTable
              items={pouch.name === active?.name ? filteredItems : pouch.items}
              onEdit={(item) => setEditing({ pouch: pouch.name, itemId: item.id })}
            />
          ),
        }))}
      />
      {editing && editingItem && (
        <EditItemModal pouchName={editing.pouch} item={editingItem} onClose={() => setEditing(undefined)} />
      )}
      {addingPouch && <AddItemModal pouch={addingPouch} onClose={() => setAddingTo(undefined)} />}
    </Flex>
  )
}

