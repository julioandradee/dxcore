import { Layout } from 'antd'
import { Footer } from './Footer'
import { RoutedContent } from './RoutedContent'

export function LoadLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Content style={{ margin: '20px 16px 0', display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            width: '100%',
            maxWidth: 728 + 2 * 20,
            padding: 20,
            minHeight: 360,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
          }}
        >
          <RoutedContent />
        </div>
      </Layout.Content>
      <Footer />
    </Layout>
  )
}
