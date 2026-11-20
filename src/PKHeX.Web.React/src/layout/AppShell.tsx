import { Suspense, useCallback, useEffect, useState, type ReactNode } from 'react'
import { App, Button, ConfigProvider, Result, Spin, theme as antdTheme } from 'antd'
import ptBR from 'antd/locale/pt_BR'
import esES from 'antd/locale/es_ES'
import enUS from 'antd/locale/en_US'
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router'
import type { EngineError, SaveCapability } from '@pkhex-everywhere/engine'
import { EngineProvider, RequireGame, useLoadedGame } from '@pkhex-everywhere/react'
import { engine } from '../app'
import { useSupports } from '../hooks/useSupports'
import { useLanguage, useTheme } from '../host'
import BoxPage from '../pages/box/BoxPage'
import CreditsPage from '../pages/static/CreditsPage'
import EncountersPage from '../pages/encounters/EncountersPage'
import EventsPage from '../pages/events/EventsPage'
import HomePage from '../pages/home/HomePage'
import ItemsPage from '../pages/items/ItemsPage'
import LoadPage from '../pages/load/LoadPage'
import PartyPage from '../pages/party/PartyPage'
import PokemonClonePage from '../pages/pokemon-editor/PokemonClonePage'
import PokemonEditorPage from '../pages/pokemon-editor/PokemonEditorPage'
import PrivacyPolicyPage from '../pages/static/PrivacyPolicyPage'
import ReleaseNotesPage from '../pages/release-notes/ReleaseNotesPage'
import SettingsPage from '../pages/settings/SettingsPage'
import FeaturesPage from '../pages/features/FeaturesPage'
import TermsOfUsePage from '../pages/static/TermsOfUsePage'
import { routes } from '../routes'
import { useTranslation } from '../i18n'
import { CaptureAnimation } from '../components/CaptureAnimation'
import { AutoLoadDemo } from './AutoLoadDemo'
import { GameJourney } from './GameJourney'
import { journey } from './journey'
import { LoadLayout } from './LoadLayout'
import { MainLayout } from './MainLayout'

const fontFamily = `'Pokemon GB', "Lucida Console", sans-serif`

function useTitle(title: string | undefined) {
  useEffect(() => {
    if (!title) return
    const previous = document.title
    document.title = title
    return () => {
      document.title = previous
    }
  }, [title])
}

interface PageProps {
  title?: string
  requiresSave?: boolean
  capability?: SaveCapability
  children: ReactNode
}

function Page({ title, requiresSave, capability, children }: PageProps) {
  useTitle(title)
  const page = capability ? <RequireCapability capability={capability}>{children}</RequireCapability> : children
  return requiresSave ? <RequireGame>{page}</RequireGame> : page
}

function RequireCapability({ capability, children }: { capability: SaveCapability; children: ReactNode }) {
  const { t } = useTranslation()
  return useSupports(capability) ? children : <p role="alert">{t('common.saveNotSupported', "This save doesn't support this page.")}</p>
}

const integer = (value: string | null) => (value && /^-?\d+$/.test(value) ? Number(value) : null)

function HomeRoute() {
  const { game } = useLoadedGame()
  const redirect = journey.redirectsToLoad(game !== null)
  useEffect(() => journey.reachedHome(), [])
  return redirect ? <Navigate to={routes.load} replace /> : <HomePage />
}

function LoadRoute({ autoLoad }: { autoLoad: boolean }) {
  const { game } = useLoadedGame()
  if (game) return <Navigate to={routes.home} replace />
  return (
    <>
      {autoLoad && <AutoLoadDemo />}
      <LoadPage />
    </>
  )
}

function EncountersRoute() {
  const { game } = useLoadedGame()
  const [query] = useSearchParams()
  if (!game) return <Navigate to={routes.load} replace />
  return <EncountersPage version={integer(query.get('version'))} species={integer(query.get('species'))} />
}

function ReleaseNotesRoute() {
  const [query] = useSearchParams()
  return <ReleaseNotesPage since={query.get('since') || null} />
}

function PokemonEditorRoute() {
  const { source, id } = useParams()
  return <PokemonEditorPage source={source} id={id} />
}

function PokemonCloneRoute() {
  const { source, id } = useParams()
  return <PokemonClonePage source={source} id={id} />
}

function NotFoundPage() {
  const { t } = useTranslation()
  const { game } = useLoadedGame()
  const navigate = useNavigate()
  return (
    <Page title={t('common.notFound', 'Not found')}>
      <Result
        status="404"
        title="404"
        subTitle={<span role="alert">{t('common.pageNotFound', "Sorry, there's nothing at this address.")}</span>}
        extra={
          <Button type="primary" onClick={() => navigate(game ? routes.home : routes.load)}>
            {game ? t('common.backToHome', 'Voltar ao Início') : t('load.title', 'Carregar Save')}
          </Button>
        }
      />
    </Page>
  )
}

function AppRoutes({ autoLoad }: { autoLoad: boolean }) {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Page title="Home"><HomeRoute /></Page>} />
        <Route path="party" element={<Page title="Party" requiresSave><PartyPage /></Page>} />
        <Route path="pokemon-box" element={<Page title="Pokemon Box" requiresSave><BoxPage /></Page>} />
        <Route path="items" element={<Page title="Items" requiresSave><ItemsPage /></Page>} />
        <Route path="events" element={<Page title="Events" requiresSave capability="events"><EventsPage /></Page>} />
        <Route path="pokemon/search-encounter" element={<Page title="Encounters" capability="encounters"><EncountersRoute /></Page>} />
        <Route path="pokemon/:source/:id" element={<Page title="Pokemon" requiresSave><PokemonEditorRoute /></Page>} />
        <Route path="pokemon/:source/:id/clone" element={<Page title="Clone Pokemon" requiresSave><PokemonCloneRoute /></Page>} />
        <Route path="save" element={<Page title="Save"><LoadPage /></Page>} />
        <Route path="settings" element={<Page title="Settings"><SettingsPage /></Page>} />
        <Route path="features" element={<Page title="Features"><FeaturesPage /></Page>} />
        <Route path="credits" element={<Page title="Credits"><CreditsPage /></Page>} />
        <Route path="privacy-policy" element={<Page title="Privacy Policy"><PrivacyPolicyPage /></Page>} />
        <Route path="terms-of-use" element={<Page title="Terms of Use"><TermsOfUsePage /></Page>} />
        <Route path="release-notes" element={<Page title="Release Notes"><ReleaseNotesRoute /></Page>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route element={<LoadLayout />}>
        <Route path="load" element={<LoadRoute autoLoad={false} />} />
      </Route>
    </Routes>
  )
}

function PageBackground() {
  const { token } = antdTheme.useToken()
  useEffect(() => {
    document.documentElement.style.background = token.colorBgLayout
    document.body.style.background = token.colorBgLayout
  }, [token.colorBgLayout])
  return null
}

function NotifyingEngineProvider({ children }: { children: ReactNode }) {
  const { notification } = App.useApp()
  const onUnhandledError = useCallback(
    (error: EngineError) => notification.error({ title: 'Something went wrong', description: error.message }),
    [notification],
  )
  return (
    <EngineProvider engine={engine} onUnhandledError={onUnhandledError}>
      {children}
    </EngineProvider>
  )
}

function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [fading, setFading] = useState(false)

  const handleComplete = useCallback(() => {
    setFading(true)
    setTimeout(onFinish, 350)
  }, [onFinish])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#000814',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: fading ? 'none' : 'auto',
        cursor: 'pointer',
      }}
      onClick={handleComplete}
      title="Toque para pular"
    >
      <CaptureAnimation onComplete={handleComplete} />
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          fontSize: 12,
          color: '#64748b',
          letterSpacing: 1,
          opacity: 0.7,
        }}
      >
        Toque para pular
      </div>
    </div>
  )
}

export function AppShell({ autoLoad }: { autoLoad: boolean }) {
  const [showSplash, setShowSplash] = useState(true)
  const theme = useTheme()
  const language = useLanguage()
  const antdLocale = language === 'pt-BR' ? ptBR : language === 'es' ? esES : enUS

  const isDark = theme === 'dark'

  return (
    <ConfigProvider
      locale={antdLocale}
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          fontFamily,
          controlHeight: 38,
          colorPrimary: '#DC0A2D',
          colorPrimaryHover: '#E8304D',
          colorPrimaryActive: '#B80825',
          colorLink: '#DC0A2D',
          colorLinkHover: '#ff4d4f',
          borderRadius: 8,
          ...(isDark
            ? {
                colorBgBase: '#000a18',
                colorBgLayout: '#000814',
                colorBgContainer: '#000f22',
                colorBgElevated: '#00152d',
                colorBorder: '#0d2544',
                colorBorderSecondary: '#081a30',
              }
            : {}),
        },
        components: {
          Layout: {
            headerBg: '#001529',
            siderBg: '#001529',
            bodyBg: isDark ? '#000814' : undefined,
          },
          Menu: {
            darkItemBg: '#001529',
            darkSubMenuItemBg: '#000c18',
          },
        },
      }}
    >
      <PageBackground />
      <App component={false}>
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
        <NotifyingEngineProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <GameJourney />
            <Suspense
              fallback={
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>
                  <Spin size="large" />
                </div>
              }
            >
              <AppRoutes autoLoad={autoLoad} />
            </Suspense>
          </BrowserRouter>
        </NotifyingEngineProvider>
      </App>
    </ConfigProvider>
  )
}
