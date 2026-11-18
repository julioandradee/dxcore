import { useState } from 'react'
import { AppstoreOutlined } from '@ant-design/icons'
import { AutoComplete, Button, Descriptions, Flex, Radio, Select, Switch, Tag, Typography } from 'antd'
import { useNavigate } from 'react-router'
import { calculators } from '../../calculators'
import {
  changeCalculatorUrl,
  changeEditorLayout,
  changePokemonListView,
  changeTheme,
  useCalculatorUrl,
  useEditorLayout,
  usePokemonListView,
  useTheme,
} from '../../host'
import { useTranslation, type Language } from '../../i18n'
import { routes } from '../../routes'

function CalculatorInput({ placeholder }: { placeholder: string }) {
  const calculatorUrl = useCalculatorUrl()
  const [text, setText] = useState(() => calculators.find((c) => c.url === calculatorUrl)?.name ?? calculatorUrl)

  const handleChange = (value: string | undefined) => {
    const next = value ?? ''
    setText(next)
    const preset = calculators.find((c) => c.name === next)
    changeCalculatorUrl(preset?.url ?? next)
  }

  return (
    <AutoComplete
      aria-label="Calculator"
      style={{ width: '100%' }}
      value={text}
      onChange={handleChange}
      options={calculators.map((c) => ({ value: c.name, label: c.name }))}
      filterOption={false}
      placeholder={placeholder}
      allowClear
    />
  )
}

function LanguageSelect() {
  const { language, changeLanguage, availableLanguages, t } = useTranslation()

  return (
    <Select<Language>
      aria-label={t('settings.language')}
      style={{ width: '100%' }}
      value={language}
      onChange={(next) => changeLanguage(next)}
      options={availableLanguages.map((l) => ({
        value: l.code,
        label: `${l.flag} ${l.label}`,
      }))}
    />
  )
}

export default function SettingsPage() {
  const theme = useTheme()
  const editorLayout = useEditorLayout()
  const pokemonListView = usePokemonListView()
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <Flex vertical gap={20}>
      <Descriptions
        title={t('settings.general')}
        bordered
        size="small"
        layout="vertical"
        column={1}
        items={[
          { key: 'language', label: t('settings.language'), children: <LanguageSelect /> },
          { key: 'calculator', label: t('settings.calculator'), children: <CalculatorInput placeholder={t('settings.calculatorPlaceholder')} /> },
        ]}
      />
      <Descriptions
        title={t('settings.appearance')}
        bordered
        size="small"
        layout="vertical"
        column={1}
        items={[
          {
            key: 'theme',
            label: t('settings.theme'),
            children: (
              <Switch
                checked={theme === 'dark'}
                onChange={(dark) => changeTheme(dark ? 'dark' : 'light')}
                checkedChildren={t('settings.theme.dark')}
                unCheckedChildren={t('settings.theme.light')}
              />
            ),
          },
          {
            key: 'editorLayout',
            label: t('settings.editorLayout', 'Layout do Editor de Pokémon'),
            children: (
              <Radio.Group
                value={editorLayout}
                onChange={(e) => changeEditorLayout(e.target.value)}
                optionType="button"
                buttonStyle="solid"
                options={[
                  {
                    value: 'showcase',
                    label: t('settings.editorLayout.showcase', '✨ Destaque em Colunas (Arte Oficial HD)'),
                  },
                  {
                    value: 'classic',
                    label: t('settings.editorLayout.classic', '🖼️ Clássico Compacto (GIF Animado)'),
                  },
                ]}
              />
            ),
          },
          {
            key: 'pokemonListView',
            label: t('settings.pokemonListView', 'Visualização de Pokémon (Equipe e Caixas)'),
            children: (
              <Radio.Group
                value={pokemonListView}
                onChange={(e) => changePokemonListView(e.target.value)}
                optionType="button"
                buttonStyle="solid"
                options={[
                  {
                    value: 'gallery',
                    label: t('settings.pokemonListView.gallery', '🖼️ Galeria em Grade (Padrão)'),
                  },
                  {
                    value: 'table',
                    label: t('settings.pokemonListView.table', '📋 Lista por Tabela'),
                  },
                ]}
              />
            ),
          },
        ]}
      />
      <Descriptions
        title={t('settings.about')}
        bordered
        size="small"
        layout="vertical"
        column={1}
        items={[
          {
            key: 'version',
            label: t('settings.version'),
            children: <Tag color="blue">⚡ DXCore v2.0</Tag>,
          },
          {
            key: 'desc',
            label: t('settings.about'),
            children: <Typography.Text>{t('settings.aboutDescription')}</Typography.Text>,
          },
          {
            key: 'features',
            label: t('settings.features'),
            children: (
              <Button
                type="primary"
                icon={<AppstoreOutlined />}
                onClick={() => navigate(routes.features)}
              >
                {t('settings.viewFeatures', 'Ver Catálogo')}
              </Button>
            ),
          },
        ]}
      />
    </Flex>
  )
}

