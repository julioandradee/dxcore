import { Tag } from 'antd'
import { useTranslation } from '../i18n'

export const typeData: Record<number, { name: string; color: string; textColor: string }> = {
  0: { name: 'Normal', color: '#9FA19F', textColor: '#ffffff' },
  1: { name: 'Fighting', color: '#FF8000', textColor: '#ffffff' },
  2: { name: 'Flying', color: '#81B9EF', textColor: '#ffffff' },
  3: { name: 'Poison', color: '#9141CB', textColor: '#ffffff' },
  4: { name: 'Ground', color: '#915121', textColor: '#ffffff' },
  5: { name: 'Rock', color: '#AFA981', textColor: '#ffffff' },
  6: { name: 'Bug', color: '#91A119', textColor: '#ffffff' },
  7: { name: 'Ghost', color: '#704170', textColor: '#ffffff' },
  8: { name: 'Steel', color: '#60A1B8', textColor: '#ffffff' },
  9: { name: 'Fire', color: '#E62829', textColor: '#ffffff' },
  10: { name: 'Water', color: '#2980EF', textColor: '#ffffff' },
  11: { name: 'Grass', color: '#3FA129', textColor: '#ffffff' },
  12: { name: 'Electric', color: '#FAC000', textColor: '#1a1a1a' },
  13: { name: 'Psychic', color: '#EF4179', textColor: '#ffffff' },
  14: { name: 'Ice', color: '#3DCEF3', textColor: '#1a1a1a' },
  15: { name: 'Dragon', color: '#5060E1', textColor: '#ffffff' },
  16: { name: 'Dark', color: '#50413F', textColor: '#ffffff' },
  17: { name: 'Fairy', color: '#EF70EF', textColor: '#ffffff' },
  18: { name: 'Stellar', color: '#4383B8', textColor: '#ffffff' },
}

interface TypeBadgeProps {
  typeId: number
  size?: 'small' | 'middle'
}

export function TypeBadge({ typeId, size = 'small' }: TypeBadgeProps) {
  const { t } = useTranslation()
  const data = typeData[typeId]
  if (!data) return null

  const translatedName = t(`types.${data.name.toLowerCase()}`, data.name)

  return (
    <Tag
      style={{
        backgroundColor: data.color,
        color: data.textColor,
        border: 'none',
        borderRadius: 4,
        fontWeight: 600,
        fontSize: size === 'small' ? '0.50rem' : '0.55rem',
        padding: size === 'small' ? '1px 6px' : '2px 8px',
        lineHeight: 1.5,
        margin: '2px 4px 2px 0',
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
      }}
    >
      {translatedName}
    </Tag>
  )
}
