import { Flex, Layout, Tooltip } from 'antd'
import { applicationName } from '../constants'
import { useTranslation, type Language } from '../i18n'

const langAcronyms: Record<Language, string> = {
  'pt-BR': 'PT-BR',
  en: 'US',
  es: 'ES',
}

export function Footer() {
  const { t, language, changeLanguage, availableLanguages } = useTranslation()

  return (
    <Layout.Footer style={{ textAlign: 'center', padding: '16px 20px', color: '#8c8c8c' }}>
      <Flex justify="center" align="center" gap={8} wrap="wrap" style={{ marginBottom: 14 }}>
        {availableLanguages.map((lang) => {
          const isSelected = language === lang.code
          const acronym = langAcronyms[lang.code] || lang.code.toUpperCase()
          return (
            <Tooltip key={lang.code} title={lang.label}>
              <button
                type="button"
                onClick={() => changeLanguage(lang.code)}
                aria-label={lang.label}
                style={{
                  background: isSelected ? 'rgba(56, 189, 248, 0.14)' : 'transparent',
                  border: isSelected ? '1.5px solid #38bdf8' : '1px solid rgba(140, 140, 140, 0.25)',
                  borderRadius: 6,
                  padding: '4px 10px',
                  cursor: 'pointer',
                  fontSize: 16,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s ease',
                  outline: 'none',
                }}
              >
                <span role="img" aria-label={lang.label} style={{ fontSize: 18, lineHeight: 1 }}>
                  {lang.flag}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? '#38bdf8' : '#8c8c8c',
                    letterSpacing: 0.5,
                  }}
                >
                  {acronym}
                </span>
              </button>
            </Tooltip>
          )
        })}
      </Flex>
      <p style={{ margin: 0, fontWeight: 500 }}>
        ⚡ {applicationName} — {t('footer.tagline', 'Gerenciador e Editor de Saves Pokémon')}
      </p>
      <p style={{ margin: '4px 0 0', fontSize: '0.85em' }}>
        {t('footer.subtitle', 'Versão Web personalizada com WebAssembly e execução local segura')}
      </p>
    </Layout.Footer>
  )
}
