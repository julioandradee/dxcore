import { useState } from 'react'
import { Flex, Select, Space, Tag } from 'antd'
import type { Choice, StatValues } from '@pkhex-everywhere/engine'
import { getNatureInfo, getShortStatName } from '../../utils/natureEffects'

interface NatureSelectProps {
  label: string
  choices: Choice[]
  value: number | null
  stats?: StatValues | null
  disabled?: boolean
  onChange: (id: number) => void
  onInteract?: () => void
}

export function NatureSelect({
  label,
  choices,
  value,
  disabled,
  onChange,
  onInteract,
}: NatureSelectProps) {
  const [search, setSearch] = useState('')

  const options = choices.map((choice) => {
    const info = getNatureInfo(choice.id)

    return {
      value: choice.id,
      label: choice.name,
      info,
    }
  })

  return (
    <div
      onClick={onInteract}
      onFocus={onInteract}
      style={{ width: '100%' }}
    >
      <Select<number>
        value={value ?? undefined}
        disabled={disabled}
        aria-label={label}
        placeholder={label}
        style={{ width: '100%' }}
        showSearch={{
          searchValue: search,
          onSearch: setSearch,
          filterOption: (input, option) => {
            if (!option) return false
            const choiceName = (option.label as string) ?? ''
            const info = option.info
            const inc = info?.increased ?? ''
            const dec = info?.decreased ?? ''
            return (
              choiceName.toLowerCase().includes(input.toLowerCase()) ||
              inc.toLowerCase().includes(input.toLowerCase()) ||
              dec.toLowerCase().includes(input.toLowerCase())
            )
          },
        }}
        virtual
        options={options}
        onSelect={() => setSearch('')}
        onChange={onChange}
        onOpenChange={(open) => {
          if (open && onInteract) onInteract()
        }}
        optionRender={(option) => {
          const { label: name, info } = option.data
          const isCurrent = value === option.data.value

          return (
            <Flex
              justify="space-between"
              align="center"
              style={{
                width: '100%',
              }}
            >
              <Space size={6}>
                <span style={{ fontWeight: 500 }}>
                  {name}
                </span>
                {isCurrent && (
                  <Tag color="blue" style={{ fontSize: 10, margin: 0, padding: '0 4px', lineHeight: '16px' }}>
                    Atual
                  </Tag>
                )}
              </Space>
              <span
                style={{
                  fontSize: 11,
                  color: info.isNeutral ? '#8c8c8c' : '#1677ff',
                  fontWeight: info.isNeutral ? 400 : 500,
                }}
              >
                {info.isNeutral
                  ? 'Neutra'
                  : `+${getShortStatName(info.increased)} / -${getShortStatName(info.decreased)}`}
              </span>
            </Flex>
          )
        }}
      />
    </div>
  )
}
