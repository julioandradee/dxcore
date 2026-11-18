import { useState } from 'react'
import { Flex, Select, Space, Tag } from 'antd'
import type { Choice, StatValues } from '@pkhex-everywhere/engine'
import { getNatureInfo, getShortStatName, isNatureSuitableForStats } from '../../utils/natureEffects'

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
  stats,
  disabled,
  onChange,
  onInteract,
}: NatureSelectProps) {
  const [search, setSearch] = useState('')

  const options = choices.map((choice) => {
    const info = getNatureInfo(choice.id)
    const isSuitable = isNatureSuitableForStats(choice.id, stats)

    return {
      value: choice.id,
      label: choice.name,
      isSuitable,
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
          const { label: name, isSuitable, info } = option.data
          const opacity = isSuitable ? 1 : 0.45
          return (
            <Flex
              justify="space-between"
              align="center"
              style={{
                width: '100%',
                opacity,
                transition: 'opacity 0.2s ease',
              }}
            >
              <Space size={6}>
                <span style={{ fontWeight: isSuitable && !info.isNeutral ? 600 : 400 }}>
                  {name}
                </span>
                {isSuitable && !info.isNeutral && (
                  <Tag color="success" style={{ margin: 0, padding: '0 4px', fontSize: 10, lineHeight: '16px' }}>
                    Ideal
                  </Tag>
                )}
                {!isSuitable && (
                  <span style={{ fontSize: 10, color: '#8c8c8c' }}>
                    (Inadequada)
                  </span>
                )}
              </Space>
              <span style={{ fontSize: 11, color: isSuitable ? '#1677ff' : '#8c8c8c' }}>
                {info.isNeutral
                  ? '—'
                  : `+${getShortStatName(info.increased)} / -${getShortStatName(info.decreased)}`}
              </span>
            </Flex>
          )
        }}
      />
    </div>
  )
}
