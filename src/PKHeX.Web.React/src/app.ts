import { createEngine, wasmHost } from '@pkhex-everywhere/engine'
import { readEnabledFormats } from './enabledFormats'

// Ensure any legacy persisted session from previous test is purged
if (typeof window !== 'undefined') {
  try {
    sessionStorage.removeItem('__pkhex_active_session__')
    if (window.indexedDB?.deleteDatabase) {
      window.indexedDB.deleteDatabase('MeuPKHeX_ActiveSession_DB')
    }
  } catch {}
}

const base = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`
const dotnetUrl = `${base}_framework/dotnet.js`

export const engine = createEngine({
  host: wasmHost({ dotnetUrl }),
})

const enabledFormats = readEnabledFormats(location.search, () => localStorage)

export const formatsEnabled = engine.ready
  .then(() =>
    Promise.all(
      enabledFormats.map((id) =>
        engine.game.enableFormat(id).catch((error) => console.error(`Couldn't enable the save format '${id}'.`, error)),
      ),
    ),
  )
  .catch((error) => {
    console.error("Engine not ready for save formats.", error)
  })
