import { describe, expect, it } from 'vitest'
import { render } from '../testing/render'
import { CaptureAnimation } from './CaptureAnimation'

describe('CaptureAnimation', () => {
  it('renders DXCore brand text and pokeball', () => {
    const { container } = render(<CaptureAnimation />)
    expect(container.textContent).toContain('DXCore')
  })

  it('renders replay controls when showControls is true', () => {
    const { container } = render(<CaptureAnimation showControls />)
    expect(container.textContent).toContain('Repetir Animação')
  })
})
