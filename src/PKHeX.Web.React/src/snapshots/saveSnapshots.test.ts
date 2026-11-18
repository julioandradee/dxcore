import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearAllSnapshots,
  createSnapshot,
  deleteSnapshot,
  listSnapshots,
  restoreSnapshotBytes,
} from './saveSnapshots'

describe('saveSnapshots', () => {
  beforeEach(() => {
    clearAllSnapshots()
    localStorage.clear()
  })

  it('lists empty snapshots by default', () => {
    expect(listSnapshots()).toEqual([])
  })

  it('creates and lists a snapshot', async () => {
    const bytes = new Uint8Array([1, 2, 3, 4])
    const snapshot = await createSnapshot({
      fileName: 'test.sav',
      versionName: 'Emerald',
      trainerName: 'Red',
      bytes,
    })

    expect(snapshot.fileName).toBe('test.sav')
    expect(snapshot.versionName).toBe('Emerald')
    expect(snapshot.trainerName).toBe('Red')
    expect(snapshot.sizeBytes).toBe(4)

    const list = listSnapshots()
    expect(list).toHaveLength(1)
    expect(list[0].id).toBe(snapshot.id)

    const restored = restoreSnapshotBytes(list[0])
    expect(restored).toEqual(bytes)
  })

  it('deletes a snapshot by id', async () => {
    const s1 = await createSnapshot({
      fileName: 's1.sav',
      versionName: 'Ruby',
      bytes: new Uint8Array([1]),
    })
    const s2 = await createSnapshot({
      fileName: 's2.sav',
      versionName: 'Sapphire',
      bytes: new Uint8Array([2]),
    })

    expect(listSnapshots()).toHaveLength(2)
    deleteSnapshot(s1.id)

    const remaining = listSnapshots()
    expect(remaining).toHaveLength(1)
    expect(remaining[0].id).toBe(s2.id)
  })

  it('clears all snapshots', async () => {
    await createSnapshot({
      fileName: 's1.sav',
      versionName: 'Ruby',
      bytes: new Uint8Array([1]),
    })
    clearAllSnapshots()
    expect(listSnapshots()).toEqual([])
  })
})
