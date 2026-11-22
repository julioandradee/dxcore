import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '../../testing/render'
import { LegalityBanner } from './LegalityBanner'

describe('LegalityBanner', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
  })

  it('renders nothing when there are no legality messages', () => {
    const legality = { valid: true, messages: [] }
    const { container } = render(<LegalityBanner legality={legality} />)
    expect(container.firstElementChild).toBeNull()
  })

  it('renders the friendly warning banner when there are legality messages', () => {
    const legality = {
      valid: false,
      messages: ['PID: PIDTypeMismatch', 'Moves: Move 1 invalid'],
    }
    const { container } = render(<LegalityBanner legality={legality} />)

    // Should render the alert with friendly title (default test locale is en)
    expect(container.textContent).toContain('Legitimacy Notice')
    expect(container.textContent).toContain('differ from original capture parameters')

    // Click details button to expand
    const detailsButton = container.querySelector('button')
    expect(detailsButton).not.toBeNull()
    act(() => {
      detailsButton?.click()
    })

    // Now technical breakdown is shown
    expect(container.textContent).toContain('PID / Natureza')
    expect(container.textContent).toContain('Golpes')
    expect(container.textContent).toContain('PID: PIDTypeMismatch')
  })
})
