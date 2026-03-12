import { Route, Switch } from 'wouter'
import { Sun, Moon, Monitor, Github } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from './hooks/useTheme'
import { Home } from './pages/Home'
import { Ecosystem } from './pages/Ecosystem'
import { Donate } from './pages/Donate'
import { LangRouter } from './i18n/LangRouter'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import './index.css'
import { XLogo } from './components/XLogo'

function App() {
  const { mode, cycleTheme } = useTheme()
  const { t } = useTranslation()
  const isDonateSubdomain = window.location.hostname === 'donate.xmr402.org' || window.location.search.includes('donate=true');

  return (
    <LangRouter>
      <div className="portal-container">
        {/* HEADER ACTIONS */}
        <div className="header-actions">
          <LanguageSwitcher />
          <a href="https://x.com/xmr402" target="_blank" rel="noopener noreferrer" className="action-btn" title={t('app.title_twitter')}>
            <XLogo size={20} />
          </a>
          <a href="https://github.com/xmr402/XMR402-org" target="_blank" rel="noopener noreferrer" className="action-btn" title={t('app.title_github')}>
            <Github size={20} />
          </a>
          <button onClick={cycleTheme} className="action-btn">
            {mode === 'light' && <Sun size={20} />}
            {mode === 'dark' && <Moon size={20} />}
            {mode === 'system' && <Monitor size={20} />}
          </button>
        </div>

        {/* ROUTES */}
        <Switch>
          {isDonateSubdomain ? (
            <Route path="/" component={Donate} />
          ) : (
              <Route path="/" component={Home} />
          )}
          <Route path="/donate" component={Donate} />
          <Route path="/ecosystem" component={Ecosystem} />
          <Route>
            {/* 404 Fallback */}
            <div className="text-center py-32">
              <h1 className="text-4xl font-black mb-4">{t('app.404_title')}</h1>
              <a href="/" className="text-emerald-500 hover:underline">{t('app.404_link')}</a>
            </div>
          </Route>
        </Switch>

        <footer>
          <p><a href="https://x.com/xmr402" target="_blank" className="text-emerald-500">@XMR402</a> • <a href="https://github.com/xmr402/XMR402-org" target="_blank">{t('app.footer_repo')}</a> • <a href="/donate">{t('app.footer_donate')}</a> • {t('app.footer_version')} • 2026</p>
        </footer>
      </div>
    </LangRouter>
  )
}

export default App
