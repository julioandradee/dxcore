import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { StatValues } from '@pkhex-everywhere/engine'
import { render } from '../../testing/render'
import { NatureSelect } from './NatureSelect'

describe('NatureSelect', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
  })

  const natures = [
    { id: 0, name: 'Hardy' },
    { id: 3, name: 'Adamant' },
    { id: 10, name: 'Timid' },
    { id: 13, name: 'Jolly' },
    { id: 15, name: 'Modest' },
  ]

  const physicalStats: StatValues = {
    health: 150,
    attack: 140,
    defense: 80,
    specialAttack: 60,
    specialDefense: 80,
    speed: 70,
  }

  it('renders the select component with the current nature selected', () => {
    const { container } = render(
      <NatureSelect
        label="Natureza"
        choices={natures}
        value={3}
        stats={physicalStats}
        onChange={() => {}}
      />,
    )

    expect(container.querySelector('.ant-select')).not.toBeNull()
    expect(container.textContent).toContain('Adamant')
  })

  it('triggers onInteract when clicked or focused', () => {
    const onInteract = vi.fn()
    const { container } = render(
      <NatureSelect
        label="Natureza"
        choices={natures}
        value={3}
        stats={physicalStats}
        onChange={() => {}}
        onInteract={onInteract}
      />,
    )

    const selectWrapper = container.firstElementChild as HTMLElement
    act(() => {
      selectWrapper.click()
    })
    expect(onInteract).toHaveBeenCalled()
  })
})
