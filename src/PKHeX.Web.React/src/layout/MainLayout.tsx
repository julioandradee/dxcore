import { Suspense, useState, type ReactNode } from 'react'
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
import { gameName } from '../capabilities'
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
    <Tag color="purple" style={{ margin: 0 }}>
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
  const [backupModalOpen, setBackupModalOpen] = useState(false)
  const screens = Grid.useBreakpoint()
  const isMobile = screens.md === false

  const toggleTheme = () => changeTheme(theme === 'dark' ? 'light' : 'dark')

  const mobileMenuItems: MenuProps['items'] = [
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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <NewsBanner />
      <Layout.Sider
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '0 20px',
          }}
        >
          <Flex align="center" gap={8} wrap="nowrap" style={{ overflow: 'hidden' }}>
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
        <Layout.Content style={{ margin: '0' }}>
          <div style={{ padding: 20, minHeight: 360 }}>
            <RoutedContent key={pathname} />
          </div>
        </Layout.Content>
        <Footer />
        <SaveBackupModal open={backupModalOpen} onClose={() => setBackupModalOpen(false)} />
      </Layout>
    </Layout>
  )
}

