import { act, Suspense } from 'react'
import { App } from 'antd'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEngine, type EngineHost, type PokemonHandle, type PokemonId, type PokemonSummary } from '@pkhex-everywhere/engine'
import { EngineProvider } from '@pkhex-everywhere/react'
import { render } from '../../testing/render'
import { MoveToBoxModal } from './MoveToBoxModal'

const pikachu: PokemonSummary = {
  id: 'pika' as unknown as PokemonId,
  at: { source: 'box', box: 0, slot: 0 } as PokemonHandle,
  speciesId: 25,
  speciesIndex: 25,
  species: 'Pikachu',
  isUnknown: false,
  editable: true,
  form: { id: 0, name: '' },
  nickname: 'Sparky',
  level: 50,
  isShiny: false,
  gender: 'male',
  isEgg: false,
  types: [12],
}

describe('MoveToBoxModal', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }))
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    )
  })

  it('renders modal with selected pokemon count and capacity info', async () => {
    const onClose = vi.fn()
    const onSuccess = vi.fn()

    const host: EngineHost = {
      ready: () => Promise.resolve(),
      onChange: () => () => {},
      onEvent: () => () => {},
      getAssemblyExports: async () => ({
        PKHeX: {
          Everywhere: {
            Engine: {
              EngineExports: {
                Call: async (name: string) => {
                  if (name === 'box.get') {
                    return JSON.stringify({ ok: true, value: [pikachu] })
                  }
                  if (name === 'box.list') {
                    return JSON.stringify({
                      ok: true,
                      value: [
                        { box: 0, name: 'Box 1', slots: 30 },
                        { box: 1, name: 'Box 2', slots: 30 },
                      ],
                    })
                  }
                  return JSON.stringify({ ok: true, value: null })
                },
              },
            },
          },
        },
      }),
    }

    const engine = createEngine({ host })

    render(
      <EngineProvider engine={engine}>
        <App>
          <Suspense fallback={<div>Carregando...</div>}>
            <MoveToBoxModal
              open={true}
              selected={[pikachu]}
              onClose={onClose}
              onSuccess={onSuccess}
            />
          </Suspense>
        </App>
      </EngineProvider>,
    )

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    const text = document.body.textContent ?? ''
    expect(text).toMatch(/Mover Pokémon para outra Caixa|Move Pokémon to another Box/)
    expect(text).toMatch(/1 Pokémon selecionado|1 Pokémon selected/)
    expect(text).toContain('Box 1')
    expect(text).toContain('Box 2')
    expect(text).toMatch(/Caixa Atual|Current Box/)
  })

  it('calls moveToBox when target box is selected and confirmed', async () => {
    const onClose = vi.fn()
    const onSuccess = vi.fn()
    let movedCallArgs: unknown[] = []

    const host: EngineHost = {
      ready: () => Promise.resolve(),
      onChange: () => () => {},
      onEvent: () => () => {},
      getAssemblyExports: async () => ({
        PKHeX: {
          Everywhere: {
            Engine: {
              EngineExports: {
                Call: async (name: string, json: string) => {
                  if (name === 'box.get') {
                    return JSON.stringify({ ok: true, value: [pikachu] })
                  }
                  if (name === 'box.list') {
                    return JSON.stringify({
                      ok: true,
                      value: [
                        { box: 0, name: 'Box 1', slots: 30 },
                        { box: 1, name: 'Box 2', slots: 30 },
                      ],
                    })
                  }
                  if (name === 'box.moveToBox') {
                    movedCallArgs = JSON.parse(json) as unknown[]
                    return JSON.stringify({ ok: true, value: null })
                  }
                  return JSON.stringify({ ok: true, value: null })
                },
              },
            },
          },
        },
      }),
    }

    const engine = createEngine({ host })

    render(
      <EngineProvider engine={engine}>
        <App>
          <Suspense fallback={<div>Carregando...</div>}>
            <MoveToBoxModal
              open={true}
              selected={[pikachu]}
              onClose={onClose}
              onSuccess={onSuccess}
            />
          </Suspense>
        </App>
      </EngineProvider>,
    )

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    // Click on Box 2 radio button
    const box2Radio = document.querySelectorAll('input[type="radio"]')[1] as HTMLInputElement
    expect(box2Radio).not.toBeNull()
    act(() => {
      box2Radio.click()
    })

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20))
    })

    // Find and click "Confirmar Transferência" button
    const confirmButton = [...document.querySelectorAll('button')].find(
      (b) => b.textContent?.includes('Confirmar Transferência') || b.textContent?.includes('Confirm Transfer'),
    ) as HTMLButtonElement
    expect(confirmButton).not.toBeNull()
    expect(confirmButton.disabled).toBe(false)

    await act(async () => {
      confirmButton.click()
    })

    expect(movedCallArgs[1]).toBe(1) // targetBox = 1 (Box 2)
    expect(onSuccess).toHaveBeenCalled()
  })

  it('renders modal with party pokemon title and moves party pokemon to target box', async () => {
    const onClose = vi.fn()
    const onSuccess = vi.fn()
    let movedCallArgs: unknown[] = []

    const partyPikachu: PokemonSummary = {
      ...pikachu,
      at: { source: 'party', slot: 1 } as PokemonHandle,
    }

    const host: EngineHost = {
      ready: () => Promise.resolve(),
      onChange: () => () => {},
      onEvent: () => () => {},
      getAssemblyExports: async () => ({
        PKHeX: {
          Everywhere: {
            Engine: {
              EngineExports: {
                Call: async (name: string, json: string) => {
                  if (name === 'box.get') {
                    return JSON.stringify({ ok: true, value: [] })
                  }
                  if (name === 'box.list') {
                    return JSON.stringify({
                      ok: true,
                      value: [
                        { box: 0, name: 'Box 1', slots: 30 },
                        { box: 1, name: 'Box 2', slots: 30 },
                      ],
                    })
                  }
                  if (name === 'box.moveToBox') {
                    movedCallArgs = JSON.parse(json) as unknown[]
                    return JSON.stringify({ ok: true, value: null })
                  }
                  return JSON.stringify({ ok: true, value: null })
                },
              },
            },
          },
        },
      }),
    }

    const engine = createEngine({ host })

    render(
      <EngineProvider engine={engine}>
        <App>
          <Suspense fallback={<div>Carregando...</div>}>
            <MoveToBoxModal
              open={true}
              selected={[partyPikachu]}
              onClose={onClose}
              onSuccess={onSuccess}
            />
          </Suspense>
        </App>
      </EngineProvider>,
    )

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    const text = document.body.textContent ?? ''
    expect(text).toMatch(/Mover Pokémon da Equipe para o Box|Move Party Pokémon to Box/)

    const box1Radio = document.querySelectorAll('input[type="radio"]')[0] as HTMLInputElement
    expect(box1Radio).not.toBeNull()
    act(() => {
      box1Radio.click()
    })

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20))
    })

    const confirmButton = [...document.querySelectorAll('button')].find(
      (b) => b.textContent?.includes('Confirmar Transferência') || b.textContent?.includes('Confirm Transfer'),
    ) as HTMLButtonElement
    expect(confirmButton).not.toBeNull()
    expect(confirmButton.disabled).toBe(false)

    await act(async () => {
      confirmButton.click()
    })

    expect(movedCallArgs[1]).toBe(0) // targetBox = 0 (Box 1)
    expect(onSuccess).toHaveBeenCalled()
  })
})
