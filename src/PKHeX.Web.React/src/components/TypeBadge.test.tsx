import { describe, expect, it } from 'vitest'
import { render } from '../testing/render'
import { TypeBadge, typeData } from './TypeBadge'

describe('TypeBadge', () => {
  it('renders type tag for valid typeId', () => {
    const { container } = render(<TypeBadge typeId={9} />)
    expect(container.textContent).toMatch(/Fire|Fogo|Fuego/i)
  })

  it('renders nothing for invalid typeId', () => {
    const { container } = render(<TypeBadge typeId={999} />)
    expect(container.textContent).toBe('')
  })

  it('contains colors for standard types', () => {
    expect(typeData[9].name).toBe('Fire')
    expect(typeData[10].name).toBe('Water')
    expect(typeData[11].name).toBe('Grass')
  })
})
