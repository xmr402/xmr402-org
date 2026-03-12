import { useEffect, type ReactNode } from 'react'
import { Router } from 'wouter'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGS } from './config'

export function LangRouter({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation()

  const segments = window.location.pathname.split('/')
  const first = segments[1]
  const langFromUrl = (SUPPORTED_LANGS as readonly string[]).includes(first) ? first : null

  useEffect(() => {
    if (langFromUrl && i18n.language !== langFromUrl) {
      i18n.changeLanguage(langFromUrl)
    }
  }, [langFromUrl, i18n])

  // Keep HTML lang attribute in sync
  useEffect(() => {
    document.documentElement.lang = i18n.language

    const handleChange = (lng: string) => {
      document.documentElement.lang = lng
    }
    i18n.on('languageChanged', handleChange)
    return () => {
      i18n.off('languageChanged', handleChange)
    }
  }, [i18n])

  if (langFromUrl) {
    return <Router base={`/${langFromUrl}`}>{children}</Router>
  }

  return <>{children}</>
}
