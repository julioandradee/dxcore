import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  BulbFilled,
  BulbOutlined,
  FlagOutlined,
  HistoryOutlined,
  HomeOutlined,
  InboxOutlined,
  SaveOutlined,
  SettingOutlined,
  ShopOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Button, Dropdown, Flex, Grid, Layout, Menu, Space, Tag, type MenuProps } from 'antd'
import { Link, useLocation } from 'react-router'
import { useLoadedGame, useTrainer } from '@pkhex-everywhere/react'
import { gameName, supports } from '../capabilities'
import { changeTheme, useNavigate, useTheme } from '../host'
import { routes } from '../routes'
import { useTranslation } from '../i18n'
import { SaveBackupModal } from '../snapshots/SaveBackupModal'
import { Footer } from './Footer'
import { RoutedContent } from './RoutedContent'
import { menuEntries, type MenuEntry, type MenuIcon } from './menu'
import { NewsBanner } from './NewsBanner'

const icons: Record<MenuIcon, ReactNode> = {
  home: <HomeOutlined />,
  team: <TeamOutlined />,
  inbox: <InboxOutlined />,
  shop: <ShopOutlined />,
  flag: <FlagOutlined />,
  save: <SaveOutlined />,
}

type MenuItem = Required<MenuProps>['items'][number]

function toMenuItem({ route, label, icon, children }: MenuEntry): MenuItem {
  if (children) return { key: `${route}#group`, icon: icon && icons[icon], label, children: children.map(toMenuItem) }
  return { key: route, icon: icon && icons[icon], label: <Link to={route}>{label}</Link> }
}

function SideMenu() {
  const { pathname } = useLocation()
  const { game } = useLoadedGame()
  const { t } = useTranslation()

  return (
    <Menu theme="dark" mode="inline" selectedKeys={[pathname]} items={menuEntries(game, t).map(toMenuItem)} />
  )
}

function TrainerBadge() {
  const { trainer } = useTrainer()
  if (!trainer?.name) return null
  return (
    <Tag
      style={{
        fontWeight: 600,
        margin: 0,
        backgroundColor: '#38bdf8',
        color: '#001529',
        borderColor: '#38bdf8',
        borderRadius: 4,
        padding: '0 8px',
      }}
    >
      👤 {trainer.name}
    </Tag>
  )
}

function HeaderGameInfo() {
  const { game } = useLoadedGame()
  const { t } = useTranslation()

  if (!game) {
    return (
      <Tag color="default" style={{ margin: 0 }}>
        {t('load.noSaveLoaded', 'Nenhum save carregado')}
      </Tag>
    )
  }

  return (
    <>
      <Tag
        style={{
          fontWeight: 600,
          margin: 0,
          backgroundColor: '#DC0A2D',
          color: '#ffffff',
          borderColor: '#DC0A2D',
          borderRadius: 4,
          padding: '0 8px',
        }}
      >
        🎮 {gameName(game)}
      </Tag>
      <Suspense fallback={null}>
        <TrainerBadge />
      </Suspense>
    </>
  )
}

export function MainLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const theme = useTheme()
  const { game } = useLoadedGame()
  const [backupModalOpen, setBackupModalOpen] = useState(false)
  const screens = Grid.useBreakpoint()
  const isMobile = screens.md === false

  const [headerVisible, setHeaderVisible] = useState(true)
  const [isScrolling, setIsScrolling] = useState(false)
  const lastScrollYRef = useRef(0)
  const scrollTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Fade out do bottom navigation no mobile enquanto a tela rola
      setIsScrolling(true)
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current)
      }
      scrollTimeoutRef.current = window.setTimeout(() => {
        setIsScrolling(false)
      }, 220)

      // Efeito smart sticky no cabeçalho
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const diff = currentScrollY - lastScrollYRef.current

          if (currentScrollY <= 60) {
            setHeaderVisible(true)
          } else if (diff > 8) {
            // Rolar para baixo -> recolhe o menu do topo
            setHeaderVisible(false)
          } else if (diff < -6) {
            // Rolar para cima -> reaparece rapidamente!
            setHeaderVisible(true)
          }

          lastScrollYRef.current = currentScrollY
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current)
    }
  }, [])

  const toggleTheme = () => changeTheme(theme === 'dark' ? 'light' : 'dark')

  const mobileMenuItems: MenuProps['items'] = [
    ...(game && game.hasEvents && supports(game, 'events')
      ? [
          {
            key: 'events',
            icon: <FlagOutlined />,
            label: t('menu.events', 'Eventos'),
            onClick: () => navigate(routes.events),
          },
        ]
      : []),
    {
      key: 'save',
      icon: <SaveOutlined />,
      label: t('menu.save', 'Salvar / Carregar'),
      onClick: () => navigate(routes.save),
    },
    {
      type: 'divider',
    },
    {
      key: 'backups',
      icon: <HistoryOutlined />,
      label: t('backup.headerBtn', 'Backups de Saves'),
      onClick: () => setBackupModalOpen(true),
    },
    {
      key: 'theme',
      icon: theme === 'dark' ? <BulbFilled style={{ color: '#faad14' }} /> : <BulbOutlined />,
      label: theme === 'dark' ? t('settings.lightTheme', 'Tema Claro') : t('settings.darkTheme', 'Tema Escuro'),
      onClick: toggleTheme,
    },
    {
      type: 'divider',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('common.settings', 'Configurações'),
      onClick: () => navigate(routes.settings),
    },
  ]

  const mobileNavItems = [
    { key: 'home', route: routes.home, icon: <HomeOutlined />, label: t('menu.home', 'Início') },
    { key: 'party', route: routes.party, icon: <TeamOutlined />, label: t('menu.party', 'Equipe') },
    { key: 'box', route: routes.box, icon: <InboxOutlined />, label: t('menu.box', 'Caixas') },
    { key: 'items', route: routes.items, icon: <ShopOutlined />, label: t('menu.items', 'Itens') },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <NewsBanner />
      <Layout.Sider
        className="desktop-sider"
        collapsible
        breakpoint="lg"
        collapsedWidth={64}
        style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'auto' }}
      >
        <div
          style={{
            color: 'white',
            marginTop: 10,
            padding: '16px 12px',
            textAlign: 'center',
            fontWeight: 'bold',
            letterSpacing: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 14,
              height: 14,
              borderRadius: '50%',
              backgroundColor: '#38bdf8',
              boxShadow: '0 0 8px #38bdf8, inset 0 0 4px #ffffff',
              border: '2px solid #ffffff',
              flexShrink: 0,
            }}
          />
          <span
            className="project-title"
            style={isMobile ? { display: 'none' } : undefined}
          >
            DXCore
          </span>
        </div>
        <Suspense fallback={null}>
          <SideMenu />
        </Suspense>
      </Layout.Sider>
      <Layout>
        <Layout.Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '0 20px',
            transform: headerVisible ? 'translateY(0)' : 'translateY(-100%)',
            transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease',
            boxShadow: headerVisible && lastScrollYRef.current > 10 ? '0 2px 10px rgba(0, 0, 0, 0.25)' : 'none',
          }}
        >
          <Flex align="center" gap={8} wrap="nowrap" style={{ overflow: 'hidden' }}>
            {/* Esfera do logo visível no mobile no lado esquerdo do badge do jogo */}
            <span
              className="mobile-header-sphere"
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                backgroundColor: '#38bdf8',
                boxShadow: '0 0 8px #38bdf8, inset 0 0 4px #ffffff',
                border: '2px solid #ffffff',
                flexShrink: 0,
              }}
              title="DXCore"
            />
            <Suspense fallback={null}>
              <HeaderGameInfo />
            </Suspense>
          </Flex>

          {/* Ações Desktop: botões separados */}
          <Space size="middle" align="center" className="desktop-header-actions">
            <Button
              icon={<HistoryOutlined />}
              shape="round"
              onClick={() => setBackupModalOpen(true)}
              title={t('backup.title', 'Histórico e Backups')}
            >
              <span>{t('backup.headerBtn', 'Backups')}</span>
            </Button>
            <Button
              icon={theme === 'dark' ? <BulbFilled style={{ color: '#faad14' }} /> : <BulbOutlined />}
              shape="circle"
              aria-label={t('settings.theme')}
              title={t('settings.theme')}
              onClick={toggleTheme}
            />
            <Button
              icon={<SettingOutlined />}
              shape="circle"
              aria-label={t('common.settings')}
              title={t('common.settings')}
              onClick={() => navigate(routes.settings)}
            />
          </Space>

          {/* Ações Mobile: ícone único de configuração com menu */}
          <div className="mobile-header-actions">
            <Dropdown menu={{ items: mobileMenuItems }} trigger={['click']} placement="bottomRight">
              <Button
                icon={<SettingOutlined />}
                shape="circle"
                aria-label={t('common.settings', 'Configurações')}
                title={t('common.settings', 'Opções e Configurações')}
              />
            </Dropdown>
          </div>
        </Layout.Header>
        <Layout.Content style={{ margin: '0' }} className="main-content-wrapper">
          <div style={{ padding: 20, minHeight: 360 }}>
            <RoutedContent key={pathname} />
          </div>
        </Layout.Content>
        <Footer />
        <SaveBackupModal open={backupModalOpen} onClose={() => setBackupModalOpen(false)} />

        {/* Barra de Navegação Inferior estilo App no Mobile */}
        <nav
          className="mobile-bottom-nav"
          aria-label="Mobile Navigation"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            background: theme === 'dark' ? '#001529' : '#ffffff',
            borderTop: theme === 'dark' ? '1px solid #0d2544' : '1px solid #e8e8e8',
            boxShadow: theme === 'dark' ? '0 -4px 16px rgba(0,0,0,0.45)' : '0 -2px 10px rgba(0,0,0,0.06)',
            transition: 'opacity 0.25s ease, transform 0.25s ease',
            opacity: isScrolling ? 0 : 1,
            transform: isScrolling ? 'translateY(16px)' : 'translateY(0)',
            pointerEvents: isScrolling ? 'none' : 'auto',
            padding: '0 8px',
          }}
        >
          {mobileNavItems.map((item) => {
            const isActive =
              item.route === routes.home
                ? pathname === routes.home
                : item.route === routes.party
                  ? pathname === routes.party || pathname.startsWith('/pokemon/party')
                  : item.route === routes.box
                    ? pathname === routes.box || pathname.startsWith('/pokemon/box')
                    : item.route === routes.items
                      ? pathname === routes.items
                      : pathname === item.route

            const activeColor = '#DC0A2D'
            const inactiveColor = theme === 'dark' ? '#8c8c8c' : '#595959'
            const color = isActive ? activeColor : inactiveColor

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(item.route)}
                style={{
                  flex: 1,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 0',
                  color,
                  transition: 'color 0.2s',
                  WebkitTapHighlightColor: 'transparent',
                }}
                aria-label={item.label}
              >
                <span style={{ fontSize: 19, marginBottom: 2 }}>{item.icon}</span>
                <span style={{ fontSize: 11, fontWeight: isActive ? 600 : 400, lineHeight: 1.1 }}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>
      </Layout>
    </Layout>
  )
}

