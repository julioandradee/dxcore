import { fromBase64, toBase64 } from '../base64'

export interface SaveSnapshot {
  id: string
  date: string
  fileName: string
  versionName: string
  trainerName?: string
  sizeBytes: number
  dataBase64: string
  note?: string
}

const STORAGE_KEY = '__pkhex_save_snapshots__'
const DB_NAME = 'MeuPKHeX_DB'
const DB_VERSION = 1
const STORE_NAME = 'save_snapshots'
const MAX_SNAPSHOTS = 30

// In-memory cache for synchronous operations and instantaneous rendering
let memoryCache: SaveSnapshot[] | null = null

function getIndexedDB(): IDBFactory | undefined {
  if (typeof window !== 'undefined' && window.indexedDB) {
    return window.indexedDB
  }
  return undefined
}

function openDB(): Promise<IDBDatabase> {
  const idb = getIndexedDB()
  if (!idb) return Promise.reject(new Error('IndexedDB not supported'))

  return new Promise((resolve, reject) => {
    const request = idb.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function persistToIndexedDB(snapshots: SaveSnapshot[]): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.clear()
    for (const s of snapshots) {
      store.put(s)
    }
  } catch {
    // Graceful fallback
  }
}

async function loadFromIndexedDB(): Promise<SaveSnapshot[]> {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.getAll()
      req.onsuccess = () => {
        const results = req.result as SaveSnapshot[]
        resolve(Array.isArray(results) ? results.sort((a, b) => b.date.localeCompare(a.date)) : [])
      }
      req.onerror = () => resolve([])
    })
  } catch {
    return []
  }
}

function readLocalStorage(): SaveSnapshot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SaveSnapshot[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocalStorage(snapshots: SaveSnapshot[]): void {
  try {
    // Only keep the most recent 3 in localStorage as fallback to prevent QuotaExceededError
    const compact = snapshots.slice(0, 3)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compact))
  } catch {
    // If quota exceeded, remove from localStorage since IndexedDB handles storage
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
  }
}

export function listSnapshots(): SaveSnapshot[] {
  if (memoryCache !== null) {
    return memoryCache
  }

  // Initial synchronous read from localStorage
  const fromLocal = readLocalStorage()
  memoryCache = fromLocal

  // Trigger background sync with IndexedDB
  void (async () => {
    const fromIdb = await loadFromIndexedDB()
    if (fromIdb.length > 0) {
      memoryCache = fromIdb
    } else if (fromLocal.length > 0) {
      // Migrate from localStorage to IndexedDB
      await persistToIndexedDB(fromLocal)
    }
  })()

  return memoryCache
}

export async function createSnapshot(params: {
  fileName: string
  versionName: string
  trainerName?: string
  bytes: Uint8Array
  note?: string
}): Promise<SaveSnapshot> {
  const dataBase64 = await toBase64(params.bytes)
  const snapshot: SaveSnapshot = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: new Date().toISOString(),
    fileName: params.fileName,
    versionName: params.versionName,
    trainerName: params.trainerName,
    sizeBytes: params.bytes.length,
    dataBase64,
    note: params.note,
  }

  const existing = listSnapshots()
  const updated = [snapshot, ...existing.filter((s) => s.id !== snapshot.id)].slice(0, MAX_SNAPSHOTS)
  memoryCache = updated

  writeLocalStorage(updated)
  await persistToIndexedDB(updated)

  return snapshot
}

export function deleteSnapshot(id: string): void {
  const existing = listSnapshots()
  const updated = existing.filter((s) => s.id !== id)
  memoryCache = updated

  writeLocalStorage(updated)
  void persistToIndexedDB(updated)
}

export function clearAllSnapshots(): void {
  memoryCache = []
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
  void (async () => {
    try {
      const db = await openDB()
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).clear()
    } catch {}
  })()
}

export function restoreSnapshotBytes(snapshot: SaveSnapshot): Uint8Array {
  return fromBase64(snapshot.dataBase64)
}
