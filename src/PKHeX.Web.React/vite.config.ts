import { join, resolve } from 'node:path'
import { defaultClientConditions, defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pkhexEngine from '@pkhex-everywhere/engine/vite'

const host = resolve(import.meta.dirname, '../PKHeX.Everywhere.Engine.Host/bin')
const debugFramework = join(host, 'Debug/net10.0/wwwroot/_framework')
const publishedFramework = join(host, 'Release/net10.0/publish/wwwroot/_framework')

export default defineConfig(({ command }) => ({
  base: process.env.VITE_BASE_PATH ?? (process.env.NODE_ENV === 'production' ? '/dxcore/' : '/'),
  plugins: [
    react(),
    pkhexEngine({ frameworkDir: command === 'serve' ? debugFramework : publishedFramework }),
  ],
  resolve: { preserveSymlinks: true, conditions: ['source', ...defaultClientConditions] },
  server: { port: 5173, strictPort: true },
  optimizeDeps: {
    exclude: ['@pkhex-everywhere/engine', '@pkhex-everywhere/react'],
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-router',
      'antd',
      'antd/locale/pt_BR',
      'antd/locale/en_US',
      'antd/locale/es_ES',
      '@ant-design/icons',
      '@sentry/browser',
      'dayjs',
      'jszip',
      'crypto-js',
    ],
  },
}))


