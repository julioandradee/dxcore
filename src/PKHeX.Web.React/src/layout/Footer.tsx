import { Layout } from 'antd'
import { applicationName } from '../constants'
import { useTranslation } from '../i18n'

export function Footer() {
  const { t } = useTranslation()

  return (
    <Layout.Footer style={{ textAlign: 'center', padding: '16px 20px', color: '#8c8c8c' }}>
      <p style={{ margin: 0, fontWeight: 500 }}>
        ⚡ {applicationName} — {t('footer.tagline', 'Gerenciador e Editor de Saves Pokémon')}
      </p>
      <p style={{ margin: '4px 0 0', fontSize: '0.85em' }}>
        {t('footer.subtitle', 'Versão Web personalizada com WebAssembly e execução local segura')}
      </p>
    </Layout.Footer>
  )
}
