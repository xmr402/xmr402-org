import { useState, useRef, useEffect } from 'react'
import { Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'zh-TW', name: '\u7E41\u9AD4\u4E2D\u6587' },
  { code: 'ru', name: '\u0420\u0443\u0441\u0441\u043A\u0438\u0439' },
  { code: 'es', name: 'Espa\u00F1ol' },
  { code: 'pt', name: 'Portugu\u00EAs' },
  { code: 'ja', name: '\u65E5\u672C\u8A9E' },
] as const

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLanguageChange = (langCode: string) => {
    setIsOpen(false)

    const currentPath = window.location.pathname
    const codes = LANGUAGES.map(l => l.code) as readonly string[]
    const segments = currentPath.split('/')

    // Strip existing lang prefix
    let pathWithoutLang = currentPath
    if (segments[1] && codes.includes(segments[1])) {
      pathWithoutLang = '/' + segments.slice(2).join('/')
      if (!pathWithoutLang || pathWithoutLang === '/') pathWithoutLang = '/'
    }

    // English uses bare paths; others use prefix
    if (langCode === 'en') {
      window.location.href = pathWithoutLang
    } else {
      window.location.href = `/${langCode}${pathWithoutLang === '/' ? '' : pathWithoutLang}`
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="action-btn"
        title="Language"
      >
        <Globe size={20} />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded shadow-lg z-50 min-w-[160px] overflow-hidden">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                i18n.language === lang.code || i18n.language.startsWith(lang.code + '-')
                  ? 'text-[var(--brand-color)] font-bold bg-[var(--brand-color)]/5'
                  : 'text-[var(--text-dim)] hover:bg-[var(--brand-color)]/10 hover:text-[var(--text-primary)]'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
