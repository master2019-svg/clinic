import '@/styles/globals.css'
import { LanguageProvider } from '@/components/LanguageProvider'

export default function App({ Component, pageProps }) {
  return (
    <LanguageProvider>
      <a href="#main" className="sr-only focus:not-sr-only">Skip to content</a>
      <Component {...pageProps} />
    </LanguageProvider>
  )
}